import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { TaskStatus, TaskActorType } from '@/lib/types';
import { validateTaskTransition, normalizeTaskStatus } from '@/lib/task-fsm';

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
            .select('id, status')
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

        // 5. Sync assembler status based on task transition
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
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to change task status', message },
            { status: 500 }
        );
    }
}

/**
 * Sync assembler.status when a task changes state
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
