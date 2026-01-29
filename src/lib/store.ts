import { create } from 'zustand';
import { Assembler, AssemblyTask, Order, TaskStatus } from './types';

interface AppStore {
    assemblers: Assembler[];
    tasks: AssemblyTask[];
    orders: Order[];
    isLoading: boolean;
    error: string | null;
    selectedTaskId: string | null;

    // Actions
    fetchData: () => Promise<void>;
    selectTask: (taskId: string | null) => void;
    assignAssembler: (taskId: string, assemblerIds: string[]) => void;
    updateTaskStatus: (taskId: string, status: string) => void;
    subscribeToChanges: () => () => void;
    resetDemo: () => void;
}

import { supabase } from '@/lib/supabase';

export const useStore = create<AppStore>((set, get) => ({
    assemblers: [],
    tasks: [],
    orders: [],
    isLoading: false,
    error: null,
    selectedTaskId: null,

    fetchData: async () => {
        set({ isLoading: true, error: null });
        try {
            // Fetch all data in parallel
            const [assemblersRes, tasksRes, ordersRes] = await Promise.all([
                fetch('/api/assemblers'),
                fetch('/api/tasks'),
                fetch('/api/orders')
            ]);

            if (!assemblersRes.ok || !tasksRes.ok || !ordersRes.ok) {
                throw new Error('Failed to fetch data');
            }

            const [assemblers, tasks, orders] = await Promise.all([
                assemblersRes.json(),
                tasksRes.json(),
                ordersRes.json()
            ]);

            set({
                assemblers,
                tasks,
                orders,
                isLoading: false
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch data',
                isLoading: false
            });
        }
    },

    selectTask: (selectedTaskId) => set({ selectedTaskId }),

    assignAssembler: async (taskId, assemblerIds) => {
        // Optimistic Update
        set((state) => ({
            tasks: state.tasks.map((task) =>
                task.id === taskId
                    ? {
                        ...task,
                        assignedAssemblerIds: assemblerIds,
                        status: 'ASSIGNED' as const,
                        scheduledTime: new Date()
                    }
                    : task
            ),
            assemblers: state.assemblers.map((assembler) => {
                const isAssigned = assemblerIds.includes(assembler.id);
                return isAssigned
                    ? { ...assembler, activeTaskId: taskId, isActive: false }
                    : assembler;
            }),
            selectedTaskId: null
        }));

        try {
            const response = await fetch('/api/tasks/assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskId, assemblerIds })
            });

            if (!response.ok) {
                console.error(`Assignment API Error Status: ${response.status} ${response.statusText}`);
                const errorData = await response.json();
                console.error('Assignment API Error Body:', errorData);
                throw new Error(errorData.message || errorData.error || 'Failed to assign task');
            }
        } catch (error) {
            console.error('Failed to persist assignment:', error);
            // Revert changes or show toast (for now just log)
            set({ error: 'Failed to save assignment to database' });
        }
    },

    updateTaskStatus: (taskId, status) => set((state) => ({
        tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, status: status as TaskStatus } : task
        )
    })),

    subscribeToChanges: () => {
        const channel = supabase
            .channel('realtime-updates')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'tasks' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const newTask = mapTask(payload.new);
                        set((state) => ({ tasks: [...state.tasks, newTask] }));
                    } else if (payload.eventType === 'UPDATE') {
                        const existingTask = get().tasks.find(t => t.id === payload.new.id);
                        const updatedTask = mapTask(payload.new);
                        set((state) => ({
                            tasks: state.tasks.map((t) =>
                                t.id === updatedTask.id ? { ...t, ...updatedTask } : t
                            ),
                        }));
                    } else if (payload.eventType === 'DELETE') {
                        const deletedTaskId = payload.old.id;
                        set((state) => ({
                            tasks: state.tasks.filter((t) => t.id !== deletedTaskId),
                        }));
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'assemblers' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const newAssembler = mapAssembler(payload.new);
                        set((state) => ({ assemblers: [...state.assemblers, newAssembler] }));
                    } else if (payload.eventType === 'UPDATE') {
                        const existingAssembler = get().assemblers.find(a => a.id === payload.new.user_id);
                        const updatedAssembler = mapAssembler(payload.new, existingAssembler);
                        set((state) => ({
                            assemblers: state.assemblers.map((a) =>
                                a.id === updatedAssembler.id ? { ...a, ...updatedAssembler } : a
                            ),
                        }));
                    } else if (payload.eventType === 'DELETE') {
                        const deletedAssemblerId = payload.old.id;
                        set((state) => ({
                            assemblers: state.assemblers.filter((a) => a.id !== deletedAssemblerId),
                        }));
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const newOrder = mapOrder(payload.new);
                        set((state) => ({ orders: [...state.orders, newOrder] }));
                    } else if (payload.eventType === 'UPDATE') {
                        const existingOrder = get().orders.find(o => o.id === payload.new.id);
                        const updatedOrder = mapOrder(payload.new, existingOrder);
                        set((state) => ({
                            orders: state.orders.map((o) =>
                                o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o
                            ),
                        }));
                    } else if (payload.eventType === 'DELETE') {
                        const deletedOrderId = payload.old.id;
                        set((state) => ({
                            orders: state.orders.filter((o) => o.id !== deletedOrderId),
                        }));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    },

    resetDemo: () => {
        set({
            assemblers: [],
            tasks: [],
            orders: [],
            selectedTaskId: null
        });
        get().fetchData();
    }
}));

// Helpers for Real-time Data Mapping
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTask(data: any): AssemblyTask {
    return {
        id: data.id,
        orderId: data.order_id,
        status: data.status,
        skillRequired: data.skill_required, // Assuming basic mapping
        scheduledStart: data.scheduled_start ? new Date(data.scheduled_start) : undefined,
        scheduledEnd: data.scheduled_end ? new Date(data.scheduled_end) : undefined,
        assignedAssemblerIds: data.assigned_assembler_ids || [],
        createdAt: new Date(data.created_at),
        // Legacy/UI fallbacks
        requiredSkills: data.skill_required || 'EASY',
        estimatedDurationMinutes: 60, // Default if not in DB
        scheduledTime: data.scheduled_start ? new Date(data.scheduled_start) : null,
        history: []
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapAssembler(data: any, existingAssembler?: Assembler): Assembler {
    const newLocation = parseGeoJSON(data.location_json || data.location, data.address_line);
    const finalLocation = (newLocation.lat === 0 && existingAssembler)
        ? existingAssembler.currentLocation
        : newLocation;

    return {
        id: data.user_id,
        name: data.name,
        avatarUrl: data.avatar_url || data.avatar || '',
        rating: data.rating || 0,
        ratingCount: data.rating_count || 0,
        currentLocation: finalLocation,
        skills: data.skills || (existingAssembler?.skills) || ['EASY', 'MEDIUM'],
        availability: [],
        activeTaskId: data.active_task_uuid || data.active_task_id,
        isActive: data.status === 'AVAILABLE',
        status: data.status || 'OFFLINE',
        lastSeenAt: new Date(),
        mobileNumberPrimary: data.phone_primary || '',
        mobileNumberSecondary: data.phone_secondary
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapOrder(data: any, existingOrder?: Order): Order {
    const newLocation = parseGeoJSON(data.location_json || data.location, data.address_line);
    const finalLocation = (newLocation.lat === 0 && existingOrder)
        ? existingOrder.address
        : newLocation;

    return {
        id: data.id,
        customerName: data.customer_name,
        address: finalLocation,
        items: typeof data.items === 'string' ? JSON.parse(data.items) : (data.items || []),
        customerPhone: data.customer_phone || '',
        deliveryFrom: data.delivery_date ? new Date(data.delivery_date) : new Date(),
        deliveryTo: data.delivery_date ? new Date(data.delivery_date) : new Date(),
        location: finalLocation,
        status: data.status,
        email: data.customer_email || '',
        assemblyWindow: `${data.assembly_window_start || ''} - ${data.assembly_window_end || ''}`,
        estimatedTime: 120, // Default
        serviceFee: data.service_fee || 0,
        notes: data.notes,
        deliveryDate: data.delivery_date || ''
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseGeoJSON(geoJson: any, address: string = ''): { lat: number; lng: number; address: string } {
    if (typeof geoJson === 'string') {
        try {
            geoJson = JSON.parse(geoJson);
        } catch {
            return { lat: 0, lng: 0, address };
        }
    }
    const coords = geoJson?.coordinates || [0, 0];
    return { lng: coords[0], lat: coords[1], address: address };
}
