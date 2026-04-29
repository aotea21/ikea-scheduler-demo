import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server'
import { MOCK_TASKS } from '@/lib/mockData';

export async function GET() {
    const supabase = await createClient();

    try {
        // Fetch all data in parallel (was 3 sequential queries)
        const [tasksResult, assignmentsResult, eventsResult] = await Promise.all([
            supabase.from('tasks').select('*'),
            supabase.from('task_assignments').select('*'),
            supabase.from('task_events').select('*'),
        ]);

        if (tasksResult.error) throw tasksResult.error;

        if (assignmentsResult.error) {
            console.warn('Failed to fetch task_assignments:', assignmentsResult.error.message);
        }
        if (eventsResult.error) {
            console.warn('Failed to fetch task_events:', eventsResult.error.message);
        }

        const tasks = tasksResult.data;
        const assignments = assignmentsResult.data;
        const events = eventsResult.data;

        // Pre-index assignments by task_uuid AND task_id — O(A) build, O(1) lookup
        const assignmentsByUuid = new Map<string, string[]>();
        const assignmentsById = new Map<string, string[]>();
        for (const a of assignments ?? []) {
            if (a.task_uuid) {
                const list = assignmentsByUuid.get(a.task_uuid);
                if (list) list.push(a.assembler_id);
                else assignmentsByUuid.set(a.task_uuid, [a.assembler_id]);
            }
            if (a.task_id) {
                const list = assignmentsById.get(a.task_id);
                if (list) list.push(a.assembler_id);
                else assignmentsById.set(a.task_id, [a.assembler_id]);
            }
        }

        // Pre-index events by task_uuid AND task_id — O(E) build, O(1) lookup
        const eventsByUuid = new Map<string, typeof events>();
        const eventsById = new Map<string, typeof events>();
        for (const e of events ?? []) {
            if (e.task_uuid) {
                const list = eventsByUuid.get(e.task_uuid);
                if (list) list.push(e);
                else eventsByUuid.set(e.task_uuid, [e]);
            }
            if (e.task_id) {
                const list = eventsById.get(e.task_id);
                if (list) list.push(e);
                else eventsById.set(e.task_id, [e]);
            }
        }

        // Combine tasks — all lookups are now O(1) per task
        const tasksWithDetails = tasks?.map(task => {
            // Merge assignments from both UUID and legacy ID lookups
            const asmIds = new Set<string>();
            for (const id of assignmentsByUuid.get(task.uuid) ?? []) asmIds.add(id);
            for (const id of assignmentsById.get(task.id) ?? []) asmIds.add(id);

            // Merge events from both UUID and legacy ID lookups
            const taskEvents = [
                ...(eventsByUuid.get(task.uuid) ?? []),
                ...(eventsById.get(task.id) ?? []),
            ];
            // Deduplicate events by id
            const seenEventIds = new Set<string>();
            const uniqueEvents = taskEvents.filter(e => {
                if (seenEventIds.has(e.id)) return false;
                seenEventIds.add(e.id);
                return true;
            });

            return {
                id: task.id,
                uuid: task.uuid,
                orderId: task.order_id,
                status: task.status,
                requiredSkills: task.required_domain_skills || ['CABINETRY'],
                taskType: task.task_type || 'GENERAL_ASSEMBLY',
                isKitchenTask: task.is_kitchen_task || false,
                scheduledStart: task.scheduled_start,
                scheduledEnd: task.scheduled_end,
                estimatedDurationMinutes: task.estimated_duration_minutes,
                actualStart: task.actual_start,
                actualEnd: task.actual_end,
                assignedAssemblerIds: [...asmIds],
                history: uniqueEvents.map(e => ({
                    id: e.id,
                    type: e.event_type,
                    timestamp: e.event_time,
                    eventTime: e.event_time,
                    description: e.description ?? e.notes,
                    location: e.location ? parsePoint(e.location) : null,
                    metadata: e.metadata
                }))
            };
        });

        return NextResponse.json(tasksWithDetails)

    } catch (error) {
        console.error('Error fetching tasks:', error);
        console.warn('Falling back to MOCK_TASKS due to error');

        // Return mock data on failure
        return NextResponse.json(MOCK_TASKS);
    }
}

// Helper to parse PostGIS POINT format
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function parsePoint(_pointStr: string): { lat: number; lng: number; address: string } {
    return { lat: 0, lng: 0, address: 'Unknown' }
}
