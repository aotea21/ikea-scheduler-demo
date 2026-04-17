import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();

    try {
        const { data: projects, error } = await supabase
            .from('projects')
            .select(`
                *,
                phases:phases (*, project_tasks (*))
            `);

        if (error) {
            console.warn('Projects table might not exist yet:', error.message);
            return NextResponse.json([]); // Graceful fallback
        }

        return NextResponse.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
