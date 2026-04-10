"use client";

import { createClient } from '@/lib/supabase/client';
import { UserProfile } from '@/lib/types';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

interface AuthState {
    user: User | null;
    profile: UserProfile | null;
    isLoading: boolean;
}

/**
 * Hook that provides current user session, profile (with role), and signOut.
 * Subscribes to auth changes automatically.
 */
export function useAuth() {
    const router = useRouter();
    const supabase = createClient();

    const [state, setState] = useState<AuthState>({
        user: null,
        profile: null,
        isLoading: true,
    });

    const fetchProfile = useCallback(async (userId: string) => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        return data as UserProfile | null;
    }, [supabase]);

    useEffect(() => {
        // Get initial session
        supabase.auth.getUser().then(async ({ data: { user } }) => {
            if (user) {
                const profile = await fetchProfile(user.id);
                setState({ user, profile, isLoading: false });
            } else {
                setState({ user: null, profile: null, isLoading: false });
            }
        });

        // Subscribe to auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session?.user) {
                    const profile = await fetchProfile(session.user.id);
                    setState({ user: session.user, profile, isLoading: false });
                } else {
                    setState({ user: null, profile: null, isLoading: false });
                }
            }
        );

        return () => subscription.unsubscribe();
    }, [fetchProfile, supabase.auth]);

    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
        router.push('/login');
    }, [supabase.auth, router]);

    return {
        ...state,
        signOut,
        isAdmin:      state.profile?.role === 'ADMIN',
        isDispatcher: state.profile?.role === 'DISPATCHER',
        isAssembler:  state.profile?.role === 'ASSEMBLER',
    };
}
