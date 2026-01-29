import { createBrowserClient } from '@supabase/ssr';

/**
 * Client-side Supabase instance
 * 
 * Use this in:
 * - Client Components (with "use client")
 * - Browser-side logic
 * - React hooks and state management (e.g., Zustand store)
 */
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}
