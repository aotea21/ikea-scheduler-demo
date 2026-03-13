/**
 * Task FSM UI Configuration
 *
 * Defines the buttons and confirmations shown to each actor type
 * for every task status state.
 */

import { TaskStatus, TaskActorType } from './types';

export interface TaskFSMAction {
    targetStatus: TaskStatus;
    label: string;
    confirmTitle: string;
    confirmMessage: string;
    confirmButtonText: string;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
    icon?: string; // emoji or icon name
}

/**
 * Actions available to ASSEMBLER for each task status
 */
export const ASSEMBLER_TASK_ACTIONS: Partial<Record<TaskStatus, TaskFSMAction[]>> = {
    ASSIGNED: [
        {
            targetStatus: 'CONFIRMED',
            label: 'Accept Job',
            confirmTitle: 'Accept this Job?',
            confirmMessage: 'You are confirming that you will complete this assembly task.',
            confirmButtonText: 'Accept Job',
            variant: 'default',
            icon: '✅',
        },
    ],
    CONFIRMED: [
        {
            targetStatus: 'EN_ROUTE',
            label: 'Start Travel',
            confirmTitle: 'Starting Travel',
            confirmMessage: 'Are you leaving for the customer location now?',
            confirmButtonText: 'Start Travel',
            variant: 'default',
            icon: '🚗',
        },
    ],
    EN_ROUTE: [
        {
            targetStatus: 'ARRIVED',
            label: 'I Have Arrived',
            confirmTitle: 'Confirm Arrival',
            confirmMessage: 'Have you arrived at the customer location?',
            confirmButtonText: 'Confirm Arrival',
            variant: 'default',
            icon: '📍',
        },
        {
            targetStatus: 'ISSUE',
            label: 'Report Issue',
            confirmTitle: 'Report an Issue',
            confirmMessage: 'Please describe the issue in the notes field. This will alert the admin.',
            confirmButtonText: 'Report Issue',
            variant: 'destructive',
            icon: '⚠️',
        },
    ],
    ARRIVED: [
        {
            targetStatus: 'IN_PROGRESS',
            label: 'Start Assembly',
            confirmTitle: 'Start Assembly',
            confirmMessage: 'Confirm that you have started assembly work.',
            confirmButtonText: 'Start Assembly',
            variant: 'default',
            icon: '🔧',
        },
        {
            targetStatus: 'ISSUE',
            label: 'Report Issue',
            confirmTitle: 'Report an Issue',
            confirmMessage: 'Please describe the issue. This will alert the admin team.',
            confirmButtonText: 'Report Issue',
            variant: 'destructive',
            icon: '⚠️',
        },
    ],
    IN_PROGRESS: [
        {
            targetStatus: 'COMPLETED',
            label: 'Complete Job',
            confirmTitle: 'Complete This Job?',
            confirmMessage: 'Please confirm that all items have been assembled and inspected by the customer.',
            confirmButtonText: 'Complete Job',
            variant: 'default',
            icon: '🎉',
        },
        {
            targetStatus: 'ISSUE',
            label: 'Report Issue',
            confirmTitle: 'Report an Issue',
            confirmMessage: 'Please describe the problem. Admin will be notified immediately.',
            confirmButtonText: 'Report Issue',
            variant: 'destructive',
            icon: '⚠️',
        },
    ],
};

/**
 * Actions available to ADMIN for each task status
 */
export const ADMIN_TASK_ACTIONS: Partial<Record<TaskStatus, TaskFSMAction[]>> = {
    CREATED: [
        {
            targetStatus: 'SCHEDULING',
            label: 'Begin Scheduling',
            confirmTitle: 'Begin Scheduling',
            confirmMessage: 'Start the scheduling process for this task.',
            confirmButtonText: 'Begin Scheduling',
            variant: 'default',
        },
        {
            targetStatus: 'CANCELLED',
            label: 'Cancel Task',
            confirmTitle: 'Cancel Task',
            confirmMessage: 'This task will be cancelled. This action cannot be undone.',
            confirmButtonText: 'Cancel',
            variant: 'destructive',
        },
    ],
    SCHEDULING: [
        {
            targetStatus: 'ASSIGNED',
            label: 'Assign Assembler',
            confirmTitle: 'Assign Assembler',
            confirmMessage: 'Manually assign an assembler to this task.',
            confirmButtonText: 'Assign',
            variant: 'default',
        },
        {
            targetStatus: 'CANCELLED',
            label: 'Cancel Task',
            confirmTitle: 'Cancel Task',
            confirmMessage: 'This task will be cancelled.',
            confirmButtonText: 'Cancel',
            variant: 'destructive',
        },
    ],
    ASSIGNED: [
        {
            targetStatus: 'CANCELLED',
            label: 'Cancel Task',
            confirmTitle: 'Cancel Task',
            confirmMessage: 'Cancelling will free the assembler. The customer will need to be notified.',
            confirmButtonText: 'Cancel Task',
            variant: 'destructive',
        },
    ],
    CONFIRMED: [
        {
            targetStatus: 'CANCELLED',
            label: 'Cancel Task',
            confirmTitle: 'Cancel Task',
            confirmMessage: 'The assembler has already accepted this task. Are you sure you want to cancel?',
            confirmButtonText: 'Cancel Task',
            variant: 'destructive',
        },
    ],
    EN_ROUTE: [
        {
            targetStatus: 'CANCELLED',
            label: 'Cancel Task',
            confirmTitle: 'Cancel Task',
            confirmMessage: 'Assembler is already en route. Are you sure you want to cancel?',
            confirmButtonText: 'Cancel Task',
            variant: 'destructive',
        },
    ],
    COMPLETED: [
        {
            targetStatus: 'VERIFIED',
            label: 'Verify & Close',
            confirmTitle: 'Verify Job Completion',
            confirmMessage: 'Confirm that this job was completed satisfactorily. This will close the task.',
            confirmButtonText: 'Verify & Close',
            variant: 'default',
            icon: '✅',
        },
    ],
    ISSUE: [
        {
            targetStatus: 'ASSIGNED',
            label: 'Resolve & Reassign',
            confirmTitle: 'Resolve Issue & Reassign',
            confirmMessage: 'Mark the issue as resolved and put the task back to ASSIGNED for a new assembler.',
            confirmButtonText: 'Resolve & Reassign',
            variant: 'default',
        },
        {
            targetStatus: 'CANCELLED',
            label: 'Cancel Task',
            confirmTitle: 'Cancel Task',
            confirmMessage: 'Cancel this task due to the reported issue.',
            confirmButtonText: 'Cancel Task',
            variant: 'destructive',
        },
    ],
};

/**
 * Get the actions for a given actor type and current status
 */
export function getTaskActions(
    status: TaskStatus,
    actorType: TaskActorType
): TaskFSMAction[] {
    if (actorType === 'assembler') {
        return ASSEMBLER_TASK_ACTIONS[status] ?? [];
    }
    if (actorType === 'admin') {
        return ADMIN_TASK_ACTIONS[status] ?? [];
    }
    return [];
}

/**
 * Human-readable label for each TaskStatus
 */
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
    CREATED:     'Created',
    SCHEDULING:  'Scheduling',
    ASSIGNED:    'Assigned',
    CONFIRMED:   'Confirmed',
    EN_ROUTE:    'En Route',
    ARRIVED:     'Arrived',
    IN_PROGRESS: 'In Progress',
    COMPLETED:   'Completed',
    VERIFIED:    'Verified',
    ISSUE:       'Issue',
    CANCELLED:   'Cancelled',
};

/**
 * Badge color style for each TaskStatus (Tailwind classes)
 */
export const TASK_STATUS_COLORS: Record<TaskStatus, { bg: string; text: string; dot: string }> = {
    CREATED:     { bg: 'bg-gray-100',   text: 'text-gray-600',  dot: 'bg-gray-400' },
    SCHEDULING:  { bg: 'bg-blue-50',    text: 'text-blue-600',  dot: 'bg-blue-400' },
    ASSIGNED:    { bg: 'bg-blue-100',   text: 'text-blue-700',  dot: 'bg-blue-500' },
    CONFIRMED:   { bg: 'bg-indigo-100', text: 'text-indigo-700',dot: 'bg-indigo-500' },
    EN_ROUTE:    { bg: 'bg-orange-100', text: 'text-orange-700',dot: 'bg-orange-400' },
    ARRIVED:     { bg: 'bg-yellow-100', text: 'text-yellow-700',dot: 'bg-yellow-400' },
    IN_PROGRESS: { bg: 'bg-purple-100', text: 'text-purple-700',dot: 'bg-purple-500' },
    COMPLETED:   { bg: 'bg-green-100',  text: 'text-green-700', dot: 'bg-green-500' },
    VERIFIED:    { bg: 'bg-green-200',  text: 'text-green-800', dot: 'bg-green-600' },
    ISSUE:       { bg: 'bg-red-100',    text: 'text-red-700',   dot: 'bg-red-500' },
    CANCELLED:   { bg: 'bg-gray-200',   text: 'text-gray-500',  dot: 'bg-gray-400' },
};
