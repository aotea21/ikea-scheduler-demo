'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';

export function DataInitializer() {
    const fetchData = useStore((state) => state.fetchData);
    const subscribeToChanges = useStore((state) => state.subscribeToChanges);

    useEffect(() => {
        fetchData();
        const unsubscribe = subscribeToChanges();
        return () => {
            unsubscribe();
        };
    }, [fetchData, subscribeToChanges]);

    return null;
}
