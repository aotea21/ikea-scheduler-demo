import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        // Fetch assemblers with GeoJSON conversion for location
        const { data: assemblers, error: assemblersError } = await supabase
            .rpc('get_assemblers_with_location')

        if (assemblersError) {
            // Fallback: fetch without location conversion
            const fallback = await supabase.from('assemblers').select('*')
            if (fallback.error) throw fallback.error

            const { data: skills } = await supabase.from('assembler_skills').select('*')

            return NextResponse.json(fallback.data?.map(a => ({
                id: a.user_id,
                name: a.name,
                avatar: a.avatar_url || '',
                phonePrimary: a.phone_primary,
                phoneSecondary: a.phone_secondary,
                skills: skills?.filter(s => s.assembler_id === a.user_id).map(s => s.skill) || [],
                rating: a.rating,
                ratingCount: a.rating_count,
                status: a.status,
                currentLocation: { lat: -36.85, lng: 174.76, address: a.address_line || 'Auckland' },
                activeTaskId: a.active_task_uuid || a.active_task_id, // Map from new UUID column or legacy
                isActive: a.status === 'AVAILABLE'
            })))
        }

        // Fetch skills
        const { data: skills } = await supabase.from('assembler_skills').select('*')

        // Combine assemblers with their skills and parse location
        const assemblersWithSkills = assemblers?.map((assembler: Record<string, unknown>) => ({
            id: assembler.user_id as string,
            name: assembler.name as string,
            avatar: (assembler.avatar_url as string) || '',
            phonePrimary: assembler.phone_primary as string,
            phoneSecondary: assembler.phone_secondary as string,
            skills: skills?.filter(s => s.assembler_id === assembler.user_id).map(s => s.skill) || [],
            rating: assembler.rating as number,
            ratingCount: assembler.rating_count as number,
            status: assembler.status as string,
            currentLocation: assembler.location_json
                ? parseGeoJSON(assembler.location_json as string | Record<string, unknown>, assembler.address_line as string)
                : { lat: -36.85, lng: 174.76, address: (assembler.address_line as string) || 'Auckland' },
            activeTaskId: (assembler.active_task_uuid as string) || (assembler.active_task_id as string), // Fallback to ID if UUID null (migration safe)
            isActive: assembler.status === 'AVAILABLE'
        }))

        return NextResponse.json(assemblersWithSkills)
    } catch (error) {
        console.error('Error fetching assemblers:', error)
        return NextResponse.json({ error: 'Failed to fetch assemblers' }, { status: 500 })
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
