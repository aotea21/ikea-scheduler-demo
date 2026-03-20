import { AssemblerStatus } from './types';

export interface FSMTransitionConfig {
    targetStatus: AssemblerStatus;
    label: string;
    confirmTitle: string;
    confirmMessage: string;
    confirmButtonText: string; // e.g., "Start Travel", "Complete Job"
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'; // For button styling
}

export const FSM_CONFIG: Record<AssemblerStatus, FSMTransitionConfig[]> = {
    OFFLINE: [
        {
            targetStatus: 'AVAILABLE',
            label: 'Go Online',
            confirmTitle: 'Go Online?',
            confirmMessage: 'You will be marked as available for new tasks.',
            confirmButtonText: 'Go Online',
            variant: 'default'
        }
    ],
    AVAILABLE: [
        {
            targetStatus: 'OFFLINE',
            label: 'Go Offline',
            confirmTitle: 'Go Offline?',
            confirmMessage: 'You will not receive any new task assignments.',
            confirmButtonText: 'Go Offline',
            variant: 'secondary'
        }
        // 'ASSIGNED' is usually system-triggered, but if manual:
        // { targetStatus: 'ASSIGNED', ... }
    ],
    ASSIGNED: [
        {
            targetStatus: 'EN_ROUTE',
            label: 'Start Travel',
            confirmTitle: 'Start Travel',
            confirmMessage: 'Are you leaving for the customer location now?',
            confirmButtonText: 'Start Travel',
            variant: 'default'
        },
        {
            targetStatus: 'AVAILABLE',
            label: 'Decline Task',
            confirmTitle: 'Decline Task',
            confirmMessage: 'Are you sure you want to decline this task? It will be reassigned.',
            confirmButtonText: 'Decline',
            variant: 'destructive'
        }
    ],
    EN_ROUTE: [
        {
            targetStatus: 'WORKING',
            label: 'Arrived at Site',
            confirmTitle: 'Confirm Arrival',
            confirmMessage: 'Have you arrived at the customer location?',
            confirmButtonText: 'I have arrived',
            variant: 'default'
        },
        {
            targetStatus: 'AVAILABLE',
            label: 'Cancel Travel',
            confirmTitle: 'Cancel Task',
            confirmMessage: 'Cancelling now will flag this task for review. Are you sure?',
            confirmButtonText: 'Cancel Task',
            variant: 'destructive'
        }
    ],
    WORKING: [
        {
            targetStatus: 'AVAILABLE',
            label: 'Complete Task',
            confirmTitle: 'Complete Task',
            confirmMessage: 'Please confirm that all items have been assembled and inspected.',
            confirmButtonText: 'Complete Job',
            variant: 'default'
        }
    ],
    BUSY: [
        {
            targetStatus: 'AVAILABLE',
            label: 'Complete Task',
            confirmTitle: 'Complete Task',
            confirmMessage: 'Please confirm that all items have been assembled and inspected.',
            confirmButtonText: 'Complete Job',
            variant: 'default'
        }
    ],
    INACTIVE: []
};
