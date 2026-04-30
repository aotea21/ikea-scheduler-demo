/**
 * Task Status Finite State Machine (FSM)
 *
 * Task Flow (Happy Path):
 * CREATED → SCHEDULING → ASSIGNED → CONFIRMED → EN_ROUTE → ARRIVED → IN_PROGRESS → COMPLETED → VERIFIED
 *
 * Exception States:
 * ANY → ISSUE (assembler)
 * ANY → CANCELLED (admin)
 * ISSUE → ASSIGNED (admin resolves)
 */

import { TaskStatus, TaskActorType } from './types';

/**
 * Valid state transitions: from → [to...]
 */
export const TASK_STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
    CREATED:              ['SCHEDULING', 'CANCELLED'],
    SCHEDULING:           ['ASSIGNED', 'CANCELLED'],
    ASSIGNED:             ['CONFIRMED', 'CANCELLED'],
    CONFIRMED:            ['EN_ROUTE', 'CANCELLED'],
    EN_ROUTE:             ['ARRIVED', 'ISSUE', 'CANCELLED'],
    ARRIVED:              ['MATERIALS_VERIFIED', 'IN_PROGRESS', 'ISSUE'],
    MATERIALS_VERIFIED:   ['IN_PROGRESS', 'ISSUE'],
    IN_PROGRESS:          ['COMPLETED', 'ISSUE'],
    COMPLETED:            ['VERIFIED'],
    VERIFIED:             [],
    ISSUE:                ['ASSIGNED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'CANCELLED'],
    CANCELLED:            [],
};

/**
 * Which actor types can trigger each transition
 * Key: "FROM→TO", Value: allowed actor types
 */
export const TASK_TRANSITION_ACTORS: Record<string, TaskActorType[]> = {
    'CREATED→SCHEDULING':            ['system', 'admin'],
    'SCHEDULING→ASSIGNED':           ['system', 'admin'],
    'ASSIGNED→CONFIRMED':            ['assembler', 'admin'],
    'ASSIGNED→CANCELLED':            ['admin'],
    'CONFIRMED→EN_ROUTE':            ['assembler', 'admin'],
    'CONFIRMED→CANCELLED':           ['admin'],
    'EN_ROUTE→ARRIVED':              ['assembler', 'admin'],
    'EN_ROUTE→ISSUE':                ['assembler', 'admin'],
    'EN_ROUTE→CANCELLED':            ['admin'],
    'ARRIVED→MATERIALS_VERIFIED':    ['assembler', 'admin'],  // Kitchen: verify materials on-site
    'ARRIVED→IN_PROGRESS':           ['assembler', 'admin'],  // Non-kitchen: direct start
    'ARRIVED→ISSUE':                 ['assembler', 'admin'],
    'MATERIALS_VERIFIED→IN_PROGRESS':['assembler', 'admin'],  // Kitchen: start after materials OK
    'MATERIALS_VERIFIED→ISSUE':      ['assembler', 'admin'],
    'IN_PROGRESS→COMPLETED':         ['assembler', 'admin'],
    'IN_PROGRESS→ISSUE':             ['assembler', 'admin'],
    'COMPLETED→VERIFIED':            ['admin'],
    'ISSUE→ASSIGNED':                ['admin'],
    'ISSUE→EN_ROUTE':                ['admin'],
    'ISSUE→ARRIVED':                 ['admin'],
    'ISSUE→IN_PROGRESS':             ['admin'],
    'ISSUE→CANCELLED':               ['admin'],
    // Fallback: admin can always cancel
    'CREATED→CANCELLED':             ['admin'],
    'SCHEDULING→CANCELLED':          ['admin'],
};

/**
 * Check if a status transition is valid
 */
export function canTaskTransition(from: TaskStatus, to: TaskStatus): boolean {
    return TASK_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Check if an actor is allowed to perform a specific transition
 */
export function canActorTransition(
    from: TaskStatus,
    to: TaskStatus,
    actorType: TaskActorType
): boolean {
    if (!canTaskTransition(from, to)) return false;
    const key = `${from}→${to}`;
    const allowed = TASK_TRANSITION_ACTORS[key];
    // If not explicitly restricted, default to admin only
    if (!allowed) return actorType === 'admin';
    return allowed.includes(actorType);
}

/**
 * Validate a transition and throw if invalid
 */
export function validateTaskTransition(
    from: TaskStatus,
    to: TaskStatus,
    actorType?: TaskActorType,
    taskId?: string
): void {
    const id = taskId ? ` (Task: ${taskId})` : '';

    if (!canTaskTransition(from, to)) {
        const valid = TASK_STATUS_TRANSITIONS[from].join(', ') || '(none)';
        throw new Error(
            `Invalid task transition${id}: ${from} → ${to}. ` +
            `Valid transitions from ${from}: ${valid}`
        );
    }

    if (actorType && !canActorTransition(from, to, actorType)) {
        throw new Error(
            `Actor type '${actorType}' is not authorized to transition task${id} from ${from} → ${to}`
        );
    }
}

/**
 * Get valid next statuses for the current status
 */
export function getValidTaskTransitions(current: TaskStatus): TaskStatus[] {
    return TASK_STATUS_TRANSITIONS[current] ?? [];
}

/**
 * Get valid next statuses for a specific actor
 */
export function getActorValidTransitions(
    current: TaskStatus,
    actorType: TaskActorType
): TaskStatus[] {
    return getValidTaskTransitions(current).filter(
        (to) => canActorTransition(current, to, actorType)
    );
}

/**
 * Check whether a task status is terminal (no further transitions possible)
 */
export function isTerminalStatus(status: TaskStatus): boolean {
    return TASK_STATUS_TRANSITIONS[status].length === 0;
}

/**
 * Check if a task is actively being worked on by an assembler
 */
export function isActiveTask(status: TaskStatus): boolean {
    return ['CONFIRMED', 'EN_ROUTE', 'ARRIVED', 'MATERIALS_VERIFIED', 'IN_PROGRESS'].includes(status);
}

/**
 * Normalize legacy DB status values to current TaskStatus
 */
export function normalizeTaskStatus(raw: string): TaskStatus {
    const map: Record<string, TaskStatus> = {
        OPEN: 'CREATED',
        IN_PROGRESS: 'IN_PROGRESS',
    };
    return (map[raw] ?? raw) as TaskStatus;
}
