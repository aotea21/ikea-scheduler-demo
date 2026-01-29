/**
 * Assembler Status Finite State Machine (FSM)
 * 
 * Status Flow:
 * AVAILABLE → ASSIGNED → EN_ROUTE → WORKING → AVAILABLE
 * 
 * Triggers:
 * - assignTask(): AVAILABLE → ASSIGNED
 * - startTravel(): ASSIGNED → EN_ROUTE
 * - arriveAtSite(): EN_ROUTE → WORKING
 * - completeTask(): WORKING → AVAILABLE
 * - cancelTask(): ASSIGNED/EN_ROUTE → AVAILABLE
 * - abortTask(): WORKING → AVAILABLE
 */

import { AssemblerStatus } from './types';

/**
 * Defines valid status transitions for each state
 */
export const STATUS_TRANSITIONS: Record<AssemblerStatus, AssemblerStatus[]> = {
    AVAILABLE: ['ASSIGNED'],
    ASSIGNED: ['EN_ROUTE', 'AVAILABLE'], // EN_ROUTE (normal flow) or AVAILABLE (cancel)
    EN_ROUTE: ['WORKING', 'AVAILABLE'],  // WORKING (arrive) or AVAILABLE (cancel)
    WORKING: ['AVAILABLE'],              // Only AVAILABLE (complete or abort)
};

/**
 * Check if a status transition is valid according to FSM rules
 * @param from - Current status
 * @param to - Target status
 * @returns true if transition is allowed, false otherwise
 */
export function canTransition(
    from: AssemblerStatus,
    to: AssemblerStatus
): boolean {
    return STATUS_TRANSITIONS[from].includes(to);
}

/**
 * Validates a status transition and throws an error if invalid
 * @param from - Current status
 * @param to - Target status
 * @param assemblerId - Optional assembler ID for error message
 * @throws Error if transition is not allowed
 */
export function validateTransition(
    from: AssemblerStatus,
    to: AssemblerStatus,
    assemblerId?: string
): void {
    if (!canTransition(from, to)) {
        const id = assemblerId ? ` (Assembler: ${assemblerId})` : '';
        throw new Error(
            `Invalid status transition${id}: ${from} → ${to}. ` +
            `Valid transitions from ${from}: ${STATUS_TRANSITIONS[from].join(', ')}`
        );
    }
}

/**
 * Get all valid next statuses for the current status
 * @param current - Current status
 * @returns Array of valid next statuses
 */
export function getValidNextStatuses(current: AssemblerStatus): AssemblerStatus[] {
    return STATUS_TRANSITIONS[current];
}

/**
 * Check if an assembler can be assigned a task based on their current status
 * @param status - Current assembler status
 * @returns true if assembler is available for assignment
 */
export function canAssignTask(status: AssemblerStatus): boolean {
    return status === 'AVAILABLE';
}

/**
 * Check if an assembler should have an active task ID
 * @param status - Current assembler status
 * @returns true if status requires an active task
 */
export function requiresActiveTask(status: AssemblerStatus): boolean {
    return status !== 'AVAILABLE';
}

/**
 * Validate that the activeTaskId matches the status requirement
 * @param status - Current status
 * @param activeTaskId - Current active task ID
 * @throws Error if the combination is invalid
 */
export function validateTaskAssignment(
    status: AssemblerStatus,
    activeTaskId: string | null
): void {
    if (status === 'AVAILABLE' && activeTaskId !== null) {
        throw new Error(
            `Assembler with status AVAILABLE should not have an active task (found: ${activeTaskId})`
        );
    }
    if (status !== 'AVAILABLE' && activeTaskId === null) {
        throw new Error(
            `Assembler with status ${status} must have an active task assigned`
        );
    }
}
