import { ProjectStatus, PhaseStatus, ExtendedTaskStatus, Phase, ProjectTask, TaskDependency } from './project-types';

export const PROJECT_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
    PLANNING: ['DESIGN_APPROVED', 'CLOSED'],
    DESIGN_APPROVED: ['MATERIAL_READY', 'CLOSED'],
    MATERIAL_READY: ['INSTALLING', 'CLOSED'],
    INSTALLING: ['FINISHING', 'CLOSED'],
    FINISHING: ['VERIFIED', 'CLOSED'],
    VERIFIED: ['CLOSED'],
    CLOSED: []
};

export const PHASE_TRANSITIONS: Record<PhaseStatus, PhaseStatus[]> = {
    PENDING: ['READY', 'BLOCKED'], 
    READY: ['IN_PROGRESS', 'BLOCKED'],
    IN_PROGRESS: ['BLOCKED', 'COMPLETED'],
    BLOCKED: ['READY', 'IN_PROGRESS'],
    COMPLETED: []
};

export const EXTENDED_TASK_TRANSITIONS: Record<ExtendedTaskStatus, ExtendedTaskStatus[]> = {
    CREATED: ['SCHEDULED'],
    SCHEDULED: ['ASSIGNED', 'DELAYED'],
    ASSIGNED: ['IN_PROGRESS', 'DELAYED'],
    IN_PROGRESS: ['BLOCKED', 'COMPLETED'],
    BLOCKED: ['IN_PROGRESS', 'DELAYED'],
    DELAYED: ['SCHEDULED', 'ASSIGNED'], 
    COMPLETED: ['VERIFIED'],
    VERIFIED: []
};

export function canPhaseStart(phaseId: string, allPhases: Phase[]): boolean {
    const phase = allPhases.find(p => p.id === phaseId);
    if (!phase) return false;
    
    // Check if all phases with a lower sequence order are COMPLETED
    const prevPhases = allPhases.filter(p => p.sequence_order < phase.sequence_order);
    return prevPhases.every(p => p.status === 'COMPLETED');
}

export function canTaskStart(taskId: string, dependencies: TaskDependency[], allTasks: ProjectTask[]): boolean {
    // A task can start if all its dependencies are COMPLETED
    const deps = dependencies.filter(d => d.task_id === taskId);
    return deps.every(d => {
        const depTask = allTasks.find(t => t.id === d.depends_on_task_id);
        return depTask?.status === 'COMPLETED';
    });
}
