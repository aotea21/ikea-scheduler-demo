"use client";

import { useAuthContext } from '@/components/AuthProvider';

/**
 * Hook that provides current user session, profile (with role), and signOut.
 * Re-exports useAuthContext for backwards compatibility and to avoid waterfall loading.
 */
export function useAuth() {
    return useAuthContext();
}
