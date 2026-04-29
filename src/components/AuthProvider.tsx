'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface AuthContextValue {
    user: User | null;
    profile: UserProfile | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
    isAdmin: boolean;
    isDispatcher: boolean;
    isAssembler: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({
    children,
    initialUser,
    initialProfile,
}: {
    children: ReactNode;
    initialUser: User | null;
    initialProfile: UserProfile | null;
}) {
    const router = useRouter();
    const supabase = createClient();

    const [state, setState] = useState({
        user: initialUser,
        profile: initialProfile,
        isLoading: false, // Start false because we have initial state
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
        // Subscribe to auth state changes (e.g. login, logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'INITIAL_SESSION') return; // Handled by server initial state
                
                if (session?.user) {
                    // Only fetch and set loading if the user actually changed
                    if (session.user.id !== state.user?.id) {
                        setState(prev => ({ ...prev, isLoading: true }));
                        const profile = await fetchProfile(session.user.id);
                        setState({ user: session.user, profile, isLoading: false });
                    }
                } else {
                    setState({ user: null, profile: null, isLoading: false });
                }
            }
        );

        return () => subscription.unsubscribe();
    }, [fetchProfile, supabase.auth, state.user?.id]);

    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
        router.push('/login');
    }, [supabase.auth, router]);

    const value = {
        ...state,
        signOut,
        isAdmin: state.profile?.role === 'ADMIN',
        isDispatcher: state.profile?.role === 'DISPATCHER',
        isAssembler: state.profile?.role === 'ASSEMBLER',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}
