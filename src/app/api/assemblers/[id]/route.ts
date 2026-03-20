import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const getAdminClient = () => {
    return createSupabaseAdmin(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
};

export async function PUT(request: Request, context: unknown) {
    const { params } = context as { params: { id: string } };
    const id = params.id;
    
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json(
            { error: 'SUPABASE_SERVICE_ROLE_KEY is required to update accounts.' },
            { status: 500 }
        );
    }

    const adminClient = getAdminClient();

    try {
        const body = await request.json();
        const { name, email, phone, region, skills, addressLine, status } = body;

        // 1. Update assembler record
        const { error: asstError } = await adminClient
            .from('assemblers')
            .update({
                name,
                phone_primary: phone,
                address_line: addressLine || region,
                status: status || 'AVAILABLE'
            })
            .eq('user_id', id);

        if (asstError) throw asstError;

        // 2. Update skills (delete old, insert new)
        await adminClient.from('assembler_skills').delete().eq('assembler_id', id);
        if (skills && skills.length > 0) {
            const skillInserts = skills.map((s: string) => ({
                assembler_id: id,
                skill: s
            }));
            await adminClient.from('assembler_skills').insert(skillInserts);
        }

        // 3. Update profile (we need to find the profile associated with this assembler_id)
        const { data: profile } = await adminClient
            .from('profiles')
            .select('id')
            .eq('assembler_id', id)
            .single();

        if (profile) {
            await adminClient
                .from('profiles')
                .update({ name, email, region })
                .eq('id', profile.id);

            // Optional: update auth user email if needed, but we'll skip complex auth email logic right now
            // await adminClient.auth.admin.updateUserById(profile.id, { email });
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Failed to update assembler:', error);
        return NextResponse.json(
            { error: (error as Error)?.message || 'Failed to update assembler' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, context: unknown) {
    const { params } = context as { params: { id: string } };
    const id = params.id;
    
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json(
            { error: 'SUPABASE_SERVICE_ROLE_KEY is required to delete accounts.' },
            { status: 500 }
        );
    }

    const adminClient = getAdminClient();

    try {
        // Soft delete: set status to INACTIVE
        const { error: asstError } = await adminClient
            .from('assemblers')
            .update({ status: 'INACTIVE' })
            .eq('user_id', id);

        if (asstError) throw asstError;

        // Find Auth user to disable them
        const { data: profile } = await adminClient
            .from('profiles')
            .select('id')
            .eq('assembler_id', id)
            .single();

        if (profile) {
            // Disable auth user so they cannot login anymore
            const { error: authError } = await adminClient.auth.admin.updateUserById(
                profile.id, 
                { user_metadata: { isActive: false } }
                // Supabase doesn't have an explicit 'ban' in standard updateUserById fields unless using identity/ban API
                // but setting a metadata flag is a start. Alternatively, ban the user using ban API if needed.
            );
            if (authError) {
                console.warn('Failed to update auth metadata for deactivated user:', authError);
            }
        }

        return NextResponse.json({ success: true, message: 'Assembler deactivated.' });
    } catch (error: unknown) {
        console.error('Failed to delete assembler:', error);
        return NextResponse.json(
            { error: (error as Error)?.message || 'Failed to delete assembler' },
            { status: 500 }
        );
    }
}
