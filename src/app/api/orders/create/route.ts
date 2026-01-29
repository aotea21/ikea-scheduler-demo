import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            customerName,
            customerPhone,
            email,
            addressLine,
            deliveryDate,
            assemblyWindowStart,
            assemblyWindowEnd,
            items,
            serviceFee,
            notes
        } = body;

        // Validation
        if (!customerName || !addressLine || !items || items.length === 0) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Demo Geocoding: Random point in Auckland
        // Lat: -36.80 to -36.95, Lng: 174.70 to 174.90
        const lat = -36.80 - Math.random() * 0.15;
        const lng = 174.70 + Math.random() * 0.20;
        const locationPoint = `POINT(${lng} ${lat})`;

        // Combine date and time for timestamps
        const startTimestamp = deliveryDate && assemblyWindowStart ? `${deliveryDate}T${assemblyWindowStart}:00` : null;
        const endTimestamp = deliveryDate && assemblyWindowEnd ? `${deliveryDate}T${assemblyWindowEnd}:00` : null;

        console.log('Inserting Order Payload:', {
            id: `ORD-${Date.now()}`,
            customer_name: customerName,
            delivery_date: deliveryDate,
            assembly_window_start: startTimestamp,
            assembly_window_end: endTimestamp,
        });

        const { data, error } = await supabase
            .from('orders')
            .insert({
                id: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                customer_name: customerName,
                customer_phone: customerPhone,
                customer_email: email,
                address_line: addressLine,
                delivery_date: deliveryDate || null,
                assembly_window_start: startTimestamp,
                assembly_window_end: endTimestamp,
                items: items,
                service_fee: parseFloat(serviceFee) || 0,
                notes: notes,
                status: 'PENDING',
                location: locationPoint,
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase error inserting order:', error);
            return NextResponse.json(
                { error: `Database error: ${error.message}`, details: error },
                { status: 500 }
            );
        }

        // Automatically create an 'OPEN' task for this order
        const { error: taskError } = await supabase
            .from('tasks')
            .insert({
                id: `t-${Date.now()}`,
                order_id: data.id,
                skill_required: 'MEDIUM', // Defaulting to MEDIUM for now
                status: 'OPEN',
                estimated_duration_minutes: 60, // Default to 1 hour
                uuid: crypto.randomUUID()
            });

        if (taskError) {
            console.error('Supabase error inserting task:', taskError);
            // We don't necessarily want to fail the whole order if the task creation fails,
            // but for this demo, it's better to ensure consistency.
            // Or we could just log it. For now, let's keep it robust.
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Failed to create order (catch block):', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown server error' },
            { status: 500 }
        );
    }
}
