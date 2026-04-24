import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { TaskStatus, TaskActorType, KITCHEN_REQUIRED_EVIDENCE } from '@/lib/types';
import { validateTaskTransition, normalizeTaskStatus } from '@/lib/task-fsm';
import { notifyCustomer, buildTrackingUrl, NotificationEvent } from '@/lib/notifications';

interface StatusChangeBody {
    newStatus: TaskStatus;
    actorType: TaskActorType;
    actorId: string;
    notes?: string;
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ taskId: string }> }
) {
    const supabase = await createClient();
    const { taskId } = await params;


    try {
        const body: StatusChangeBody = await request.json();
        const { newStatus, actorType, actorId, notes } = body;

        if (!taskId || !newStatus || !actorType || !actorId) {
            return NextResponse.json(
                { error: 'Missing required fields: taskId, newStatus, actorType, actorId' },
                { status: 400 }
            );
        }

        // 1. Fetch current task status from DB
        const { data: task, error: fetchError } = await supabase
            .from('tasks')
            .select('id, status, order_id')
            .eq('id', taskId)
            .single();

        if (fetchError || !task) {
            return NextResponse.json(
                { error: 'Task not found', details: fetchError?.message },
                { status: 404 }
            );
        }

        // Fetch assembler IDs from task_assignments (graceful fallback)
        let assemblerIds: string[] = [];
        try {
            const { data: assignments } = await supabase
                .from('task_assignments')
                .select('assembler_id')
                .eq('task_uuid', taskId);
            assemblerIds = assignments?.map((a: { assembler_id: string }) => a.assembler_id) ?? [];
        } catch {
            // task_assignments might not exist or use different column names
        }


        const oldStatus = normalizeTaskStatus(task.status) as TaskStatus;

        // 2. Validate FSM transition (throws on invalid)
        try {
            validateTaskTransition(oldStatus, newStatus, actorType, taskId);
        } catch (fsmError) {
            return NextResponse.json(
                { error: 'Invalid status transition', message: (fsmError as Error).message },
                { status: 422 }
            );
        }

        const now = new Date().toISOString();

        // 3. Update task status
        const { error: updateError } = await supabase
            .from('tasks')
            .update({
                status: newStatus,
                ...(newStatus === 'IN_PROGRESS' && { actual_start: now }),
                ...(newStatus === 'COMPLETED' && { actual_end: now }),
            })
            .eq('id', taskId);

        if (updateError) throw updateError;

        // 4. Record event in task_events (graceful — table may not exist yet)
        try {
            const { error: eventError } = await supabase
                .from('task_events')
                .insert({
                    task_id: taskId,
                    event_type: 'STATUS_CHANGED',
                    old_status: oldStatus,
                    new_status: newStatus,
                    actor_type: actorType,
                    actor_id: actorId,
                    event_time: now,
                    metadata: notes ? { notes } : null,
                });

            if (eventError) {
                console.warn('task_events INSERT failed (table may not exist):', eventError.message);
            }
        } catch (eventWriteError) {
            console.warn('task_events write skipped:', eventWriteError);
        }

        // 4a. Kitchen task evidence check: COMPLETED requires evidence photos
        let isKitchenTask = false;
        try {
            const { data: taskMeta } = await supabase
                .from('tasks')
                .select('is_kitchen_task')
                .eq('id', taskId)
                .single();
            isKitchenTask = taskMeta?.is_kitchen_task ?? false;
        } catch {
            // Column may not exist yet — skip kitchen check
        }
        if (newStatus === 'COMPLETED' && isKitchenTask) {
            try {
                const { data: evidence } = await supabase
                    .from('task_evidence')
                    .select('evidence_type')
                    .eq('task_id', taskId);

                const uploadedTypes = new Set(evidence?.map((e: { evidence_type: string }) => e.evidence_type) ?? []);
                const missing = KITCHEN_REQUIRED_EVIDENCE.filter(t => !uploadedTypes.has(t));

                if (missing.length > 0) {
                    return NextResponse.json(
                        {
                            error: 'Missing required evidence photos for kitchen task completion',
                            missingCategories: missing,
                            required: KITCHEN_REQUIRED_EVIDENCE,
                            uploaded: Array.from(uploadedTypes),
                        },
                        { status: 422 }
                    );
                }
            } catch {
                // task_evidence table may not exist yet — skip validation
                console.warn('task_evidence check skipped (table may not exist)');
            }
        }

        // 5. Notify customer (async, non-blocking)
        const NOTIFICATION_EVENTS: TaskStatus[] = ['EN_ROUTE', 'ARRIVED', 'MATERIALS_VERIFIED', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED'];
        if (NOTIFICATION_EVENTS.includes(newStatus)) {
            try {
                const { data: order } = await supabase
                    .from('orders')
                    .select('id, customer_name, customer_phone, customer_email')
                    .eq('id', task.order_id)
                    .single();

                if (order) {
                    notifyCustomer({
                        orderId: order.id,
                        customerName: order.customer_name,
                        customerPhone: order.customer_phone,
                        customerEmail: order.customer_email,
                        eventType: newStatus as NotificationEvent,
                        trackingUrl: buildTrackingUrl(order.id),
                    }).catch(err => console.warn('Notification failed:', err));
                }
            } catch {
                console.warn('Customer notification skipped');
            }
        }

        // 6. Sync assembler status based on task transition
        await syncAssemblerStatus(supabase, assemblerIds, newStatus, now);

        return NextResponse.json({
            success: true,
            taskId,
            oldStatus,
            newStatus,
            timestamp: now,
        });
    } catch (error) {
        console.error('Error changing task status:', error);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const message = error instanceof Error ? error.message : (error as any)?.message ?? 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to change task status', message },
            { status: 500 }
        );
    }
}

/**
 * Sync assembler.status when a task changes state
 */
async function syncAssemblerStatus(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase: any,
    assemblerIds: string[],
    newStatus: TaskStatus,
    now: string
) {
    if (assemblerIds.length === 0) return;

    let assemblerStatus: string | null = null;
    let clearActiveTask = false;

    switch (newStatus) {
        case 'EN_ROUTE':
            assemblerStatus = 'EN_ROUTE';
            break;
        case 'ARRIVED':
        case 'MATERIALS_VERIFIED':
        case 'IN_PROGRESS':
            assemblerStatus = 'WORKING';
            break;
        case 'COMPLETED':
        case 'VERIFIED':
        case 'CANCELLED':
            assemblerStatus = 'AVAILABLE';
            clearActiveTask = true;
            break;
        case 'ISSUE':
            // Keep assembler WORKING but flag them
            assemblerStatus = 'WORKING';
            break;
        default:
            return; // No assembler sync needed
    }

    if (!assemblerStatus) return;

    const updatePayload: Record<string, unknown> = {
        status: assemblerStatus,
        last_seen_at: now,
    };

    if (clearActiveTask) {
        updatePayload.active_task_uuid = null;
    }

    const { error } = await supabase
        .from('assemblers')
        .update(updatePayload)
        .in('user_id', assemblerIds);

    if (error) {
        console.warn('Failed to sync assembler status:', error.message);
    }
}
