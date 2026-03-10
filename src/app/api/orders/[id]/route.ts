import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * DELETE /api/orders/[id]
 * Deletes an order and its associated tasks
 */
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Fix: params is a Promise in Next.js 15+
) {
    const supabase = await createClient();
    const { id } = await params; // Fix: await params

    try {
        console.log('Deleting order:', id);

        // 1. Fetch associated tasks to get their IDs and UUIDs for manual cascade
        const { data: tasks, error: fetchError } = await supabase
            .from('tasks')
            .select('id, uuid')
            .eq('order_id', id);

        if (fetchError) {
            console.error('Error fetching tasks for deletion:', fetchError);
            return NextResponse.json(
                { error: `Failed to fetch associated tasks: ${fetchError.message}` },
                { status: 500 }
            );
        }

        if (tasks && tasks.length > 0) {
            const taskIds = tasks.map(t => t.id);
            const taskUuids = tasks.map(t => t.uuid).filter(uuid => uuid); // Filter out nulls if any

            // 2. Delete task_assignments (linked by task_uuid)
            if (taskUuids.length > 0) {
                // First clear any active_task_uuid refs in assemblers table
                const { error: assemblerError } = await supabase
                    .from('assemblers')
                    .update({ active_task_uuid: null })
                    .in('active_task_uuid', taskUuids);

                if (assemblerError) {
                    console.error('Error clearing assembler active tasks:', assemblerError);
                    return NextResponse.json(
                        { error: `Failed to clear assembler active tasks: ${assemblerError.message}` },
                        { status: 500 }
                    );
                }

                // Then delete assignments
                const { error: assignmentError } = await supabase
                    .from('task_assignments')
                    .delete()
                    .in('task_uuid', taskUuids);

                if (assignmentError) {
                    console.error('Error deleting task assignments:', assignmentError);
                    // Continue anyway? No, this will likely fail the task delete.
                    return NextResponse.json(
                        { error: `Failed to delete task assignments: ${assignmentError.message}` },
                        { status: 500 }
                    );
                }
            }

            // 3. Delete task_events (linked by task_id)
            if (taskIds.length > 0) {
                const { error: eventError } = await supabase
                    .from('task_events')
                    .delete()
                    .in('task_id', taskIds);

                if (eventError) {
                    console.error('Error deleting task events:', eventError);
                    return NextResponse.json(
                        { error: `Failed to delete task events: ${eventError.message}` },
                        { status: 500 }
                    );
                }
            }
        }

        // 4. Delete tasks
        const { error: taskError } = await supabase
            .from('tasks')
            .delete()
            .eq('order_id', id);

        if (taskError) {
            console.error('Error deleting tasks:', taskError);
            return NextResponse.json(
                { error: `Failed to delete associated tasks: ${taskError.message}` },
                { status: 500 }
            );
        }

        // 5. Delete the order
        const { error: orderError } = await supabase
            .from('orders')
            .delete()
            .eq('id', id);

        if (orderError) {
            console.error('Error deleting order:', orderError);
            return NextResponse.json(
                { error: `Failed to delete order: ${orderError.message}` },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, id: id });
    } catch (error) {
        console.error('Failed to delete order (catch block):', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown server error' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/orders/[id]
 * Updates an order and synchronizes the associated task
 */
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const { id } = await params;

    try {
        const updates = await request.json();

        console.log('Updating order:', id, updates);

        // Prepare order updates
        const orderUpdates: Record<string, any> = {};

        if (updates.customerName !== undefined) orderUpdates.customer_name = updates.customerName;
        if (updates.customerPhone !== undefined) orderUpdates.customer_phone = updates.customerPhone;
        if (updates.email !== undefined) orderUpdates.customer_email = updates.email;
        if (updates.addressLine !== undefined) orderUpdates.address_line = updates.addressLine;
        if (updates.deliveryDate !== undefined) orderUpdates.delivery_date = updates.deliveryDate;
        if (updates.serviceFee !== undefined) orderUpdates.service_fee = parseFloat(updates.serviceFee);
        if (updates.notes !== undefined) orderUpdates.notes = updates.notes;
        if (updates.items !== undefined) orderUpdates.items = updates.items;

        // Handle assembly window timestamps
        if (updates.assemblyWindowStart || updates.assemblyWindowEnd) {
            const deliveryDate = updates.deliveryDate || null;
            if (deliveryDate && updates.assemblyWindowStart) {
                orderUpdates.assembly_window_start = `${deliveryDate}T${updates.assemblyWindowStart}:00`;
            }
            if (deliveryDate && updates.assemblyWindowEnd) {
                orderUpdates.assembly_window_end = `${deliveryDate}T${updates.assemblyWindowEnd}:00`;
            }
        }

        // Update order
        const { data, error } = await supabase
            .from('orders')
            .update(orderUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Supabase error updating order:', error);
            return NextResponse.json(
                { error: `Database error: ${error.message}` },
                { status: 500 }
            );
        }

        // Update associated task if delivery time changes
        if (orderUpdates.assembly_window_start || orderUpdates.assembly_window_end) {
            const taskUpdates: Record<string, any> = {};

            if (orderUpdates.assembly_window_start) {
                taskUpdates.scheduled_start = orderUpdates.assembly_window_start;
            }
            if (orderUpdates.assembly_window_end) {
                taskUpdates.scheduled_end = orderUpdates.assembly_window_end;
            }

            const { error: taskError } = await supabase
                .from('tasks')
                .update(taskUpdates)
                .eq('order_id', id);

            if (taskError) {
                console.error('Error updating task:', taskError);
                // Don't fail the whole request, just log it
            }
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Failed to update order (catch block):', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown server error' },
            { status: 500 }
        );
    }
}
