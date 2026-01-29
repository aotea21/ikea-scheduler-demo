import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient();

    try {
        // Fetch orders with GeoJSON conversion for location
        const { data: orders, error: ordersError } = await supabase
            .rpc('get_orders_with_location')

        if (ordersError) {
            console.warn('RPC get_orders_with_location failed, falling back to basic query:', ordersError)
            // Fallback: fetch without location conversion
            const { data: fallback, error: fallbackError } = await supabase
                .from('orders')
                .select('*')

            if (fallbackError) throw fallbackError

            return NextResponse.json(fallback?.map(order => ({
                id: order.id,
                customerName: order.customer_name,
                customerPhone: order.customer_phone,
                email: order.customer_email,
                deliveryDate: order.delivery_date,
                assemblyWindow: `${order.assembly_window_start || ''} - ${order.assembly_window_end || ''}`,
                address: {
                    lat: -36.8485,
                    lng: 174.7633,
                    address: order.address_line || 'Unknown'
                },
                items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
                serviceFee: order.service_fee,
                notes: order.notes,
                status: order.status,
                estimatedTime: 120
            })))
        }

        // Map database format to frontend format
        const ordersFormatted = orders?.map((order: Record<string, unknown>) => ({
            id: order.id,
            customerName: order.customer_name,
            customerPhone: order.customer_phone,
            email: order.customer_email,
            deliveryDate: order.delivery_date,
            assemblyWindow: `${order.assembly_window_start || ''} - ${order.assembly_window_end || ''}`,
            address: order.location_json
                ? parseGeoJSON(order.location_json as string | Record<string, unknown>, order.address_line as string)
                : {
                    lat: -36.8485,
                    lng: 174.7633,
                    address: (order.address_line as string) || 'Unknown'
                },
            items: typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []),
            serviceFee: (order.service_fee as number) || 0,
            notes: order.notes,
            status: order.status,
            estimatedTime: 120
        }))

        return NextResponse.json(ordersFormatted)
    } catch (error) {
        console.error('Error fetching orders:', error)
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }
}

// Helper to parse GeoJSON
function parseGeoJSON(geoJson: string | Record<string, unknown>, address: string = ''): { lat: number; lng: number; address: string } {
    if (typeof geoJson === 'string') {
        try {
            geoJson = JSON.parse(geoJson)
        } catch {
            return { lat: 0, lng: 0, address }
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const coords = (geoJson as any)?.coordinates || [0, 0]
    return { lng: coords[0], lat: coords[1], address }
}
