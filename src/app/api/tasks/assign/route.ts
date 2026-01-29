import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const supabase = await createClient();

    try {
        const body = await request.json()
        console.log('Assign Task Request Body:', body);
        const { taskId, assemblerIds } = body

        if (!taskId || !assemblerIds || !Array.isArray(assemblerIds)) {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
        }

        const { error } = await supabase.rpc('assign_task_to_assemblers', {
            p_task_id: taskId,
            p_assembler_ids: assemblerIds
        })

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error assigning task:', error)

        // Robust error serialization
        let errorMessage = 'Unknown error';
        let errorDetails = null;

        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null) {
            // Handle Supabase error object or other objects
            errorMessage = (error as any).message || 'Unknown error occurred';
            errorDetails = error;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }

        return NextResponse.json(
            {
                error: 'Failed to assign task',
                message: errorMessage,
                details: errorDetails
            },
            { status: 500 }
        )
    }
}
