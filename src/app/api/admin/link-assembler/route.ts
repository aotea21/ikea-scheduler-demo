import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * POST /api/admin/link-assembler
 * Body: { authId?: string, authEmail?: string, name: string, role: string, assemblerId: string, region?: string }
 * 
 * Upserts a profile row and links it to an assembler record.
 * Admin only.
 */
export async function POST(request: Request) {
    const supabase = await createClient();

    // Verify caller is ADMIN
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: callerProfile } = await supabase
        .from('profiles').select('role').eq('id', user.id).single();
    if (callerProfile?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden — Admin only' }, { status: 403 });
    }

    const { authId, authEmail, name, role, assemblerId, region } = await request.json();

    // Resolve the auth UUID
    const targetId = authId ?? null;
    if (!targetId && !authEmail) {
        return NextResponse.json({ error: 'authId or authEmail required' }, { status: 400 });
    }

    // If no authId, we'd need service_role to look up by email — so authId is preferred
    const id = targetId;
    if (!id) {
        return NextResponse.json({ error: 'authId (UUID) is required' }, { status: 400 });
    }

    // Upsert the profile (create if missing, update if exists)
    const { data, error } = await supabase
        .from('profiles')
        .upsert({
            id,
            email: authEmail ?? '',
            name: name ?? 'Assembler',
            role: role ?? 'ASSEMBLER',
            region: region ?? 'Auckland',
            assembler_id: assemblerId,
        }, { onConflict: 'id' })
        .select('id, email, name, role, assembler_id, region')
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, profile: data });
}
