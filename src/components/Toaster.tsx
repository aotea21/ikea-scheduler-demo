'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { X, AlertCircle } from 'lucide-react';

export function Toaster() {
    const { error, clearError } = useStore();
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Auto-dismiss after 6 seconds
    useEffect(() => {
        if (error) {
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
                clearError();
            }, 6000);
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [error, clearError]);

    if (!error) return null;

    return (
        <div
            role="alert"
            aria-live="assertive"
            className={cn(
                'fixed bottom-6 right-6 z-[9999] flex items-start gap-3',
                'max-w-sm w-full bg-white border border-red-200 rounded-xl shadow-xl p-4',
                'animate-in slide-in-from-bottom-4 fade-in duration-300'
            )}
        >
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-red-700">Error</p>
                <p className="text-sm text-red-600 mt-0.5 break-words">{error}</p>
            </div>
            <button
                onClick={clearError}
                aria-label="Dismiss error"
                className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
