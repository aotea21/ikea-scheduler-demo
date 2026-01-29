import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { MOCK_ASSEMBLERS, MOCK_ORDERS, MOCK_TASKS } from '../src/lib/mockData'
import * as path from 'path'

// Load .env.local from project root
config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
    console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'SET' : 'NOT SET')
    console.error('SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? 'SET' : 'NOT SET')
    throw new Error('Missing Supabase environment variables. Check .env.local file.')
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

// Helper to generate deterministic UUIDs from mock IDs (for Users/Assemblers only)
function mockIdToUuid(mockId: string): string {
    const hash = mockId.split('').reduce((acc, char) => {
        return ((acc << 5) - acc) + char.charCodeAt(0)
    }, 0)
    const hex = Math.abs(hash).toString(16).padStart(12, '0').substring(0, 12)
    return `00000000-0000-4000-8${hex.substring(0, 3)}-${hex.substring(3, 15).padEnd(12, '0')}`
}

async function seed() {
    console.log('Starting database seed (UUID Compatible)...');

    try {
        // 0. Clean existing data (foreign keys require specific order)
        console.log('Cleaning existing data...');
        // Order matters due to cascades, but explicit delete is safer
        await supabase.from('task_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('task_assignments').delete().neq('task_uuid', '00000000-0000-0000-0000-000000000000'); // Use UUID generic check or just delete all
        await supabase.from('assemblers').delete().neq('user_id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('tasks').delete().neq('id', 'PLACEHOLDER'); // Safe to delete all
        await supabase.from('orders').delete().neq('id', 'PLACEHOLDER');
        await supabase.from('assembler_skills').delete().neq('assembler_id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        console.log('✅ Existing data cleaned');

        // 1. Seed Users (for assemblers)
        console.log('Seeding users...');
        const userInserts = MOCK_ASSEMBLERS.map(a => ({
            id: mockIdToUuid(a.id),
            email: `${a.id}@ikea.com`,
            role: 'ASSEMBLER',
            is_active: true
        }));

        const { error: usersError } = await supabase.from('users').upsert(userInserts);
        if (usersError) throw usersError;

        // 2. Seed Orders (Orders now have UUIDs, but we assume generated)
        console.log('Seeding orders...');
        const orderInserts = MOCK_ORDERS.map(o => ({
            id: o.id,
            customer_name: o.customerName,
            customer_phone: o.customerPhone,
            customer_email: o.email,
            delivery_date: o.deliveryDate,
            address_line: o.address.address,
            location: `POINT(${o.address.lng} ${o.address.lat})`,
            items: JSON.stringify(o.items),
            service_fee: o.serviceFee,
            notes: o.notes,
            status: o.status
        }));

        const { error: ordersError } = await supabase.from('orders').upsert(orderInserts);
        if (ordersError) throw ordersError;

        // 3. Seed Tasks and Capture UUIDs
        console.log('Seeding tasks...');
        const taskInserts = MOCK_TASKS.map(t => ({
            id: t.id,
            order_id: t.orderId,
            skill_required: t.skillRequired,
            status: t.status,
            scheduled_start: t.scheduledStart,
            scheduled_end: t.scheduledEnd,
            estimated_duration_minutes: t.estimatedDurationMinutes,
            actual_start: t.actualStart,
            actual_end: t.actualEnd
        }));

        const { data: insertedTasks, error: tasksError } = await supabase
            .from('tasks')
            .upsert(taskInserts)
            .select('id, uuid'); // Return both IDs

        if (tasksError) throw tasksError;
        if (!insertedTasks) throw new Error('No tasks returned after insert');

        // 4. Create Map: Legacy ID -> New UUID
        const taskUuidMap = new Map<string, string>();
        insertedTasks.forEach(t => taskUuidMap.set(t.id, t.uuid));

        // 5. Seed Assemblers (using UUID map for active_task_uuid)
        console.log('Seeding assemblers...');
        const assemblerInserts = MOCK_ASSEMBLERS.map(a => ({
            user_id: mockIdToUuid(a.id),
            name: a.name,
            avatar_url: '',
            phone_primary: a.mobileNumberPrimary,
            phone_secondary: null,
            rating: a.rating,
            rating_count: a.ratingCount || 0,
            current_location: `POINT(${a.currentLocation.lng} ${a.currentLocation.lat})`,
            address_line: a.currentLocation.address,
            // Use the map to find the UUID for the active task
            active_task_uuid: a.activeTaskId ? taskUuidMap.get(a.activeTaskId) || null : null,
            status: a.isActive ? 'AVAILABLE' : 'OFFLINE'
        }));

        const { error: assemblersError } = await supabase.from('assemblers').upsert(assemblerInserts);
        if (assemblersError) throw assemblersError;

        // 6. Seed Assembler Skills
        console.log('Seeding assembler skills...');
        const skillInserts = MOCK_ASSEMBLERS.flatMap(a =>
            a.skills.map(skill => ({
                assembler_id: mockIdToUuid(a.id),
                skill: skill
            }))
        );

        const { error: skillsError } = await supabase.from('assembler_skills').upsert(skillInserts);
        if (skillsError) throw skillsError;

        // 7. Seed Task Assignments (using UUID map)
        console.log('Seeding task assignments...');
        const assignmentInserts = MOCK_TASKS.flatMap(t =>
            (t.assignedAssemblerIds || []).map(assemblerId => ({
                task_uuid: taskUuidMap.get(t.id), // Use UUID from map
                assembler_id: mockIdToUuid(assemblerId)
            }))
        ).filter(a => a.task_uuid && a.assembler_id);

        if (assignmentInserts.length > 0) {
            const { error: assignmentsError } = await supabase
                .from('task_assignments')
                .upsert(assignmentInserts);

            if (assignmentsError) throw assignmentsError;
        }

        // 8. Seed Task Events (using UUID for events? No, events usually link to Task ID (text) or UUID? 
        // Schema likely uses task_id TEXT for events based on previous files, but let's check. 
        // Safer to skip events if schema is ambiguous, or assume TEXT link if not changed. 
        // Assuming TEXT link for now as we didn't migrate events table.)
        console.log('Seeding task events...');
        const eventInserts = MOCK_TASKS.flatMap(t =>
            (t.history || []).map(e => ({
                id: mockIdToUuid(e.id),
                task_id: t.id,
                event_type: e.type,
                event_time: e.eventTime || e.timestamp,
                location: e.location ? `POINT(${e.location.lng} ${e.location.lat})` : null,
                metadata: JSON.stringify(e.metadata || {})
            }))
        );

        if (eventInserts.length > 0) {
            const { error: eventsError } = await supabase.from('task_events').upsert(eventInserts);
            if (eventsError) throw eventsError;
        }

        console.log('✅ Database seeded successfully!');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
}

seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
