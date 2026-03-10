import { useState, useCallback, useEffect, useMemo } from 'react';
import { AssemblerStatus } from '@/lib/types';
import { validateTransition, getValidNextStatuses } from '@/lib/assembler-fsm';
import { FSM_CONFIG, FSMTransitionConfig } from '@/lib/fsm-config';

interface UseAssemblerFSMReturn {
    currentStatus: AssemblerStatus;
    isTransitioning: boolean;
    error: string | null;
    validTransitions: FSMTransitionConfig[];

    // Actions
    initiateTransition: (targetStatus: AssemblerStatus) => void;
    confirmTransition: () => Promise<void>;
    cancelTransition: () => void;

    // State for the confirmation dialog
    pendingTransition: FSMTransitionConfig | null;
}

export function useAssemblerFSM(
    initialStatus: AssemblerStatus,
    onStatusChange?: (newStatus: AssemblerStatus) => Promise<void> | void
): UseAssemblerFSMReturn {
    const [status, setStatus] = useState<AssemblerStatus>(initialStatus);
    const [pendingTransition, setPendingTransition] = useState<FSMTransitionConfig | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Sync external status changes (e.g. dispatcher assigns a task server-side)
    // Only update when not mid-transition to avoid UI flicker
    useEffect(() => {
        if (!pendingTransition && !isTransitioning) {
            setStatus(initialStatus);
        }
    }, [initialStatus]); // eslint-disable-line react-hooks/exhaustive-deps

    // Get valid next statuses based on FSM rules
    // Map them to UI config, memoized to avoid unnecessary recalculation
    const validTransitions = useMemo(() => {
        const validContexts = getValidNextStatuses(status);
        return (FSM_CONFIG[status] || []).filter(config =>
            validContexts.includes(config.targetStatus)
        );
    }, [status]);

    const initiateTransition = useCallback((targetStatus: AssemblerStatus) => {
        setError(null);
        try {
            // Validate logic first
            validateTransition(status, targetStatus);

            // Find the config for this transition
            const config = FSM_CONFIG[status]?.find(c => c.targetStatus === targetStatus);

            if (!config) {
                // Fallback if config is missing but transition is valid logic-wise (shouldn't happen with proper config)
                console.warn(`Missing FSM Config for ${status} -> ${targetStatus}`);
                setPendingTransition({
                    targetStatus,
                    label: 'Confirm Change',
                    confirmTitle: 'Confirm Status Change',
                    confirmMessage: `Change status to ${targetStatus}?`,
                    confirmButtonText: 'Confirm',
                    variant: 'default'
                });
            } else {
                setPendingTransition(config);
            }
        } catch (err) {
            setError((err as Error).message);
        }
    }, [status]);

    const confirmTransition = useCallback(async () => {
        if (!pendingTransition) return;

        setIsTransitioning(true);
        setError(null);

        try {
            // Perform the actual update (this is where API calls would go in a real app)
            // For now we just update local state or call the callback
            if (onStatusChange) {
                await onStatusChange(pendingTransition.targetStatus);
            }

            setStatus(pendingTransition.targetStatus);
            setPendingTransition(null);
        } catch (err) {
            setError('Failed to update status. Please try again.');
            console.error(err);
        } finally {
            setIsTransitioning(false);
        }
    }, [pendingTransition, onStatusChange]);

    const cancelTransition = useCallback(() => {
        setPendingTransition(null);
        setError(null);
    }, []);

    return {
        currentStatus: status,
        isTransitioning,
        error,
        validTransitions,
        initiateTransition,
        confirmTransition,
        cancelTransition,
        pendingTransition
    };
}
