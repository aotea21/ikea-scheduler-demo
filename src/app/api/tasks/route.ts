import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient();

    try {
        // Fetch tasks
        const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .select('*')

        if (tasksError) throw tasksError

        // Fetch task assignments
        const { data: assignments, error: assignmentsError } = await supabase
            .from('task_assignments')
            .select('*')

        if (assignmentsError) throw assignmentsError

        // Fetch task events/history
        const { data: events, error: eventsError } = await supabase
            .from('task_events')
            .select('*')

        if (eventsError) throw eventsError

        // Combine tasks with assignments and history
        const tasksWithDetails = tasks?.map(task => ({
            id: task.id,
            orderId: task.order_id,
            status: task.status,
            skillRequired: task.skill_required,
            requiredSkills: task.skill_required, // Add this for UI/Scheduler compatibility
            scheduledStart: task.scheduled_start,
            scheduledEnd: task.scheduled_end,
            estimatedDurationMinutes: task.estimated_duration_minutes,
            actualStart: task.actual_start,
            actualEnd: task.actual_end,
            assignedAssemblerIds: assignments?.filter(a => a.task_uuid === task.uuid).map(a => a.assembler_id) || [],
            history: events?.filter(e => e.task_id === task.id).map(e => ({
                id: e.id,
                type: e.event_type,
                timestamp: e.event_time,
                eventTime: e.event_time,
                location: e.location ? parsePoint(e.location) : null,
                metadata: e.metadata
            })) || []
        }))

        return NextResponse.json(tasksWithDetails)
    } catch (error) {
        console.error('Error fetching tasks:', error)
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
    }
}

// Helper to parse PostGIS POINT format
function parsePoint(pointStr: string): { lat: number; lng: number; address: string } {
    return { lat: 0, lng: 0, address: 'Unknown' }
}
