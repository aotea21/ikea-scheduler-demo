import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { MOCK_ASSEMBLERS } from '@/lib/mockData';

const getAdminClient = () => {
    return createSupabaseAdmin(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
};

export async function GET() {
    const supabase = await createClient();

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

        // Fetch skills (graceful fallback)
        const { data: skills, error: skillsError } = await supabase.from('assembler_skills').select('*')
        if (skillsError) {
            console.warn('Failed to fetch assembler_skills (table might be missing), continuing without skills:', skillsError.message)
        }

        // Fetch profiles to get email addresses
        let profilesData: { assembler_id: string; email: string }[] = [];
        try {
            const { data } = await supabase.from('profiles').select('assembler_id, email').eq('role', 'ASSEMBLER');
            profilesData = data || [];
        } catch (e) {
            console.warn('Failed to fetch profiles for emails', e);
        }

        // Combine assemblers with their skills, location, and email
        const assemblersWithSkills = assemblers?.map((assembler: Record<string, unknown>) => {
            const asmId = assembler.user_id as string;
            const profile = profilesData.find(p => p.assembler_id === asmId);
            
            return {
                id: asmId,
                email: profile?.email || '',
                name: assembler.name as string,
                avatar: (assembler.avatar_url as string) || '',
                phonePrimary: assembler.phone_primary as string,
                phoneSecondary: assembler.phone_secondary as string,
                skills: skills?.filter(s => s.assembler_id === asmId).map(s => s.skill) || [],
                rating: assembler.rating as number,
                ratingCount: assembler.rating_count as number,
                status: assembler.status as string,
                currentLocation: assembler.location_json
                    ? parseGeoJSON(assembler.location_json as string | Record<string, unknown>, assembler.address_line as string)
                    : { lat: -36.85, lng: 174.76, address: (assembler.address_line as string) || 'Auckland' },
                activeTaskId: (assembler.active_task_uuid as string) || (assembler.active_task_id as string),
                isActive: assembler.status === 'AVAILABLE' || assembler.status === 'WORKING' || assembler.status === 'EN_ROUTE'
            };
        });

        return NextResponse.json(assemblersWithSkills);
    } catch (error) {
        console.error('Error fetching assemblers:', error);
        console.warn('Falling back to MOCK_ASSEMBLERS due to error');

        // Return mock data on failure
        return NextResponse.json(MOCK_ASSEMBLERS);
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

export async function POST(request: Request) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json(
            { error: 'SUPABASE_SERVICE_ROLE_KEY is required to create assembler accounts.' },
            { status: 500 }
        );
    }

    const adminClient = getAdminClient();

    try {
        const body = await request.json();
        const { name, email, phone, phonePrimary, region, skills, addressLine, currentLocation } = body;

        const effectivePhone = phonePrimary || phone;
        const effectiveRegion = region || currentLocation?.address;
        const effectiveAddress = addressLine || currentLocation?.address || effectiveRegion;

        if (!name || !email || !effectivePhone || !skills || skills.length === 0) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Create Auth User
        const password = 'welcome1'; // Default temporary password
        const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { name, role: 'ASSEMBLER' }
        });

        if (authError || !authData.user) {
            console.error('Auth User creation failed:', authError);
            return NextResponse.json({ error: 'Failed to create user account: ' + authError?.message }, { status: 400 });
        }

        const authId = authData.user.id;
        const assemblerId = authId; // Use auth ID for assembler record

        // 2. Create Profile (must exist before assembler if FK depends on it)
        const { error: profileError } = await adminClient
            .from('profiles')
            .insert({
                id: authId,
                email,
                name,
                role: 'ASSEMBLER',
                region: effectiveRegion || 'Auckland',
                assembler_id: assemblerId
            });

        if (profileError) {
            console.error('Profile creation failed:', profileError);
            await adminClient.auth.admin.deleteUser(authId); // rollback
            throw profileError;
        }

        // 2.5 Create legacy Users record if FK depends on it
        const { error: legacyUserError } = await adminClient
            .from('users')
            .insert({
                id: authId,
                email,
                role: 'ASSEMBLER'
            });
            
        if (legacyUserError) {
            console.warn('Legacy users record creation failed (might already exist or be unused):', legacyUserError);
        }

        // 3. Insert into assemblers table
        const lat = -36.80 - Math.random() * 0.15;
        const lng = 174.70 + Math.random() * 0.20;
        const locationPoint = `POINT(${lng} ${lat})`;

        const { error: assemblerError } = await adminClient
            .from('assemblers')
            .insert({
                user_id: assemblerId,
                name,
                phone_primary: effectivePhone,
                rating: 5.0,
                rating_count: 0,
                current_location: locationPoint,
                address_line: effectiveAddress || 'Auckland, NZ',
                status: 'AVAILABLE'
            });

        if (assemblerError) {
            await adminClient.auth.admin.deleteUser(authId); // rollback
            throw assemblerError;
        }

        // 4. Insert Skills
        const skillInserts = skills.map((skill: string) => ({
            assembler_id: authId,
            skill: skill
        }));
        await adminClient.from('assembler_skills').insert(skillInserts);

        // Return the newly created assembler format
        return NextResponse.json({
            id: assemblerId,
            email,
            name,
            phonePrimary: effectivePhone,
            skills,
            rating: 5.0,
            ratingCount: 0,
            status: 'AVAILABLE',
            currentLocation: { lat, lng, address: effectiveAddress || 'Auckland, NZ' },
            isActive: true
        });

    } catch (error: unknown) {
        console.error('Failed to create assembler:', error);
        return NextResponse.json(
            { error: (error as Error)?.message || 'Failed to create assembler' },
            { status: 500 }
        );
    }
}
