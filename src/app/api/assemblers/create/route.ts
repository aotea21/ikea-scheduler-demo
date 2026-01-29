import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const supabase = await createClient();

    try {
        const body = await request.json();
        const {
            name,
            phone,
            rating,
            skills,
            addressLine
        } = body;

        // Validation
        if (!name || !phone || !skills || skills.length === 0) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // 1. Create User (Mock Auth for now, as Supabase requires a User ID for foreign keys usually)
        // We'll generate a UUID for the user_id.
        const userId = crypto.randomUUID();

        // Check if we need to insert into 'users' table specifically if it's a proprietary table or Supabase Auth.
        // Based on seed.ts, there is a public.users table.
        const { error: userError } = await supabase
            .from('users')
            .insert({
                id: userId,
                email: `${name.toLowerCase().replace(/\s+/g, '.')}@ikea.com`,
                role: 'ASSEMBLER',
                is_active: true
            });

        if (userError) throw userError;

        // 2. Demo Geocoding: Random point in Auckland
        const lat = -36.80 - Math.random() * 0.15;
        const lng = 174.70 + Math.random() * 0.20;
        const locationPoint = `POINT(${lng} ${lat})`;
        const finalAddress = addressLine || 'Auckland, NZ';

        // 3. Insert Assembler
        const { data: assembler, error: assemblerError } = await supabase
            .from('assemblers')
            .insert({
                user_id: userId,
                name: name,
                phone_primary: phone,
                rating: parseFloat(rating),
                rating_count: 0,
                current_location: locationPoint,
                address_line: finalAddress,
                status: 'AVAILABLE',
                active_task_uuid: null
            })
            .select()
            .single();

        if (assemblerError) throw assemblerError;

        // 4. Insert Skills
        const skillInserts = skills.map((skill: string) => ({
            assembler_id: userId,
            skill: skill
        }));

        const { error: skillsError } = await supabase
            .from('assembler_skills')
            .insert(skillInserts);

        if (skillsError) throw skillsError;

        return NextResponse.json(assembler);
    } catch (error) {
        console.error('Failed to create assembler:', error);
        return NextResponse.json(
            { error: 'Failed to create assembler' },
            { status: 500 }
        );
    }
}
