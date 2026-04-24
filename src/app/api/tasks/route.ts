import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server'
import { MOCK_TASKS } from '@/lib/mockData';

export async function GET() {
    const supabase = await createClient();

    try {
        // Fetch tasks
        const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .select('*')

        if (tasksError) throw tasksError

        // Fetch task assignments (graceful fallback if table missing)
        const { data: assignments, error: assignmentsError } = await supabase
            .from('task_assignments')
            .select('*')

        if (assignmentsError) {
            console.warn('Failed to fetch task_assignments (table might be missing), continuing without assignments:', assignmentsError.message)
        }

        // Fetch task events/history (graceful fallback if table missing)
        const { data: events, error: eventsError } = await supabase
            .from('task_events')
            .select('*')

        if (eventsError) {
            console.warn('Failed to fetch task_events (table might be missing), continuing without history:', eventsError.message)
        }

        // Combine tasks with assignments and history
        const tasksWithDetails = tasks?.map(task => ({
            id: task.id,
            uuid: task.uuid,                 // expose real UUID for debugging
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
            // Join by task_uuid (UUID column) OR task_id (legacy short ID column)
            assignedAssemblerIds: assignments?.filter(a =>
                (task.uuid && a.task_uuid === task.uuid) ||
                (a.task_id === task.id)
            ).map(a => a.assembler_id) || [],
            history: events?.filter(e => e.task_id === task.id || (task.uuid && e.task_uuid === task.uuid)).map(e => ({
                id: e.id,
                type: e.event_type,
                timestamp: e.event_time,
                eventTime: e.event_time,
                description: e.description ?? e.notes,
                location: e.location ? parsePoint(e.location) : null,
                metadata: e.metadata
            })) || []
        }))

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
