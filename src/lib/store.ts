import { create } from 'zustand';
import { Assembler, AssemblyTask, Order } from './types';
import { MOCK_ASSEMBLERS, MOCK_ORDERS, MOCK_TASKS } from './mockData';

interface AppState {
    orders: Order[];
    tasks: AssemblyTask[];
    assemblers: Assembler[];
    selectedTaskId: string | null;

    // Actions
    setOrders: (orders: Order[]) => void;
    setTasks: (tasks: AssemblyTask[]) => void;
    setAssemblers: (assemblers: Assembler[]) => void;
    selectTask: (taskId: string | null) => void;
    assignAssembler: (taskId: string, assemblerId: string) => void;
    resetDemo: () => void;
}

export const useStore = create<AppState>((set) => ({
    orders: MOCK_ORDERS,
    tasks: MOCK_TASKS,
    assemblers: MOCK_ASSEMBLERS,
    selectedTaskId: null,

    setOrders: (orders) => set({ orders }),
    setTasks: (tasks) => set({ tasks }),
    setAssemblers: (assemblers) => set({ assemblers }),
    selectTask: (selectedTaskId) => set({ selectedTaskId }),

    assignAssembler: (taskId, assemblerId) => set((state) => {
        // 1. Update the Task
        const updatedTasks = state.tasks.map(t =>
            t.id === taskId
                ? { ...t, status: 'ASSIGNED' as const, assignedAssemblerId: assemblerId, scheduledTime: new Date() }
                : t
        );

        // 2. Update the Assembler (Mark as busy/active)
        const updatedAssemblers = state.assemblers.map(a =>
            a.id === assemblerId
                ? { ...a, activeTaskId: taskId }
                : a
        );

        return {
            tasks: updatedTasks,
            assemblers: updatedAssemblers,
            selectedTaskId: null // Close selection
        };
    }),

    resetDemo: () => set({
        orders: MOCK_ORDERS,
        tasks: MOCK_TASKS,
        assemblers: MOCK_ASSEMBLERS,
        selectedTaskId: null
    })
}));
