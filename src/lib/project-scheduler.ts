import { Phase, ProjectTask, TaskDependency, ResourceAllocation } from './project-types';

/**
 * Perform a topological sort on a set of tasks given their dependencies.
 * Returns an array of task IDs in an order that respects dependencies.
 * Throws an error if a cycle is detected.
 */
export function topologicalSort(tasks: ProjectTask[], dependencies: TaskDependency[]): string[] {
    const adjList = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    // Initialize
    for (const task of tasks) {
        adjList.set(task.id, []);
        inDegree.set(task.id, 0);
    }

    // Build graph
    for (const dep of dependencies) {
        // dep.depends_on_task_id must complete before dep.task_id can start
        // Edge: depends_on -> task
        if (adjList.has(dep.depends_on_task_id) && adjList.has(dep.task_id)) {
            adjList.get(dep.depends_on_task_id)!.push(dep.task_id);
            inDegree.set(dep.task_id, inDegree.get(dep.task_id)! + 1);
        }
    }

    // Queue for nodes with in-degree 0
    const queue: string[] = [];
    for (const [taskId, degree] of inDegree.entries()) {
        if (degree === 0) {
            queue.push(taskId);
        }
    }

    const result: string[] = [];
    while (queue.length > 0) {
        const u = queue.shift()!;
        result.push(u);

        for (const v of adjList.get(u)!) {
            inDegree.set(v, inDegree.get(v)! - 1);
            if (inDegree.get(v) === 0) {
                queue.push(v);
            }
        }
    }

    if (result.length !== tasks.length) {
        throw new Error("Cycle detected in task dependencies");
    }

    return result;
}

/**
 * A stub for finding available resource capacity.
 * In a real system, this would query the DB to check assembler availability, skills, and existing allocations.
 */
export function findFirstAvailableSlot(
    task: ProjectTask,
    earliestStartDate: Date,
    allocations: ResourceAllocation[]
): { startDate: Date, endDate: Date, resourceId: string } | null {
    // Basic stub logic: assume we can start immediately on earliestStartDate 
    // and take the required duration.
    // Real implementation would check against 'allocations' and assembler working days.
    
    // YYYY-MM-DD to Date parsing logic would be needed. 
    // For this stub, we just return the earilest start date.
    const start = new Date(earliestStartDate.getTime());
    const end = new Date(start.getTime());
    end.setDate(end.getDate() + task.duration_days);

    return {
        startDate: start,
        endDate: end,
        resourceId: 'stub-resource-id' // We would select the best matching assembler ID here
    };
}
