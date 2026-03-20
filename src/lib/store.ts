import { create } from 'zustand';
import { Assembler, AssemblyTask, Order, TaskStatus, TaskActorType } from './types';
import { normalizeTaskStatus } from './task-fsm';
import { formatNZTime, formatNZDate } from './utils';

interface AppStore {
    assemblers: Assembler[];
    tasks: AssemblyTask[];
    orders: Order[];
    isLoading: boolean;
    error: string | null;
    selectedTaskId: string | null;

    // Actions
    fetchData: () => Promise<void>;
    fetchOrders: () => Promise<void>;
    fetchTasks: () => Promise<void>;
    selectTask: (taskId: string | null) => void;
    
    // Assembler CRUD
    addAssembler: (data: Partial<Assembler>) => Promise<boolean>;
    updateAssembler: (id: string, data: Partial<Assembler>) => Promise<boolean>;
    deleteAssembler: (id: string) => Promise<boolean>;

    assignAssembler: (taskId: string, assemblerIds: string[]) => void;
    updateTaskStatus: (taskId: string, status: string) => void;
    transitionTaskStatus: (
        taskId: string,
        newStatus: TaskStatus,
        actorType: TaskActorType,
        actorId: string,
        notes?: string
    ) => Promise<void>;
    subscribeToChanges: () => () => void;
    resetDemo: () => void;
    clearError: () => void;
}

import { createClient } from '@/lib/supabase/client';

// Create a singleton client instance for the store
const supabase = createClient();

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

            if (!assemblersRes.ok) console.error('Assemblers API failed', await assemblersRes.text());
            if (!tasksRes.ok) console.error('Tasks API failed', await tasksRes.text());
            if (!ordersRes.ok) console.error('Orders API failed', await ordersRes.text());

            if (!assemblersRes.ok || !tasksRes.ok || !ordersRes.ok) {
                const failed = [];
                if (!assemblersRes.ok) failed.push('assemblers');
                if (!tasksRes.ok) failed.push('tasks');
                if (!ordersRes.ok) failed.push('orders');
                throw new Error(`Failed to fetch data: ${failed.join(', ')} failed`);
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

    addAssembler: async (data) => {
        try {
            const res = await fetch('/api/assemblers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to add assembler');
            }
            // Fetch fresh data to ensure connections (profiles) are synced
            await get().fetchData();
            return true;
        } catch (error: unknown) {
            set({ error: (error as Error).message });
            return false;
        }
    },

    updateAssembler: async (id, data) => {
        try {
            const res = await fetch(`/api/assemblers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to update assembler');
            }
            await get().fetchData();
            return true;
        } catch (error: unknown) {
            set({ error: (error as Error).message });
            return false;
        }
    },

    deleteAssembler: async (id) => {
        try {
            const res = await fetch(`/api/assemblers/${id}`, {
                method: 'DELETE'
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to deactivate assembler');
            }
            await get().fetchData();
            return true;
        } catch (error: unknown) {
            set({ error: (error as Error).message });
            return false;
        }
    },

    assignAssembler: async (taskId, assemblerIds) => {
        // Save snapshot for rollback
        const snapshot = { tasks: get().tasks, assemblers: get().assemblers };

        // Optimistic Update
        set((state) => ({
            tasks: state.tasks.map((task) =>
                task.id === taskId
                    ? {
                        ...task,
                        assignedAssemblerIds: assemblerIds,
                        status: 'ASSIGNED' as const,
                        scheduledStart: new Date()
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
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || errorData.error || 'Failed to assign task');
            }
        } catch (error) {
            // Rollback optimistic update on failure
            set({
                tasks: snapshot.tasks,
                assemblers: snapshot.assemblers,
                error: error instanceof Error ? error.message : 'Failed to save assignment to database'
            });
        }
    },

    fetchOrders: async () => {
        try {
            const response = await fetch('/api/orders');
            if (!response.ok) throw new Error('Failed to fetch orders');
            const orders = await response.json();
            set({ orders });
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        }
    },

    fetchTasks: async () => {
        try {
            const response = await fetch('/api/tasks');
            if (!response.ok) throw new Error('Failed to fetch tasks');
            const tasks = await response.json();
            set({ tasks });
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        }
    },

    // Local-only optimistic update (kept for non-critical UI use)
    updateTaskStatus: (taskId, status) => set((state) => ({
        tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, status: status as TaskStatus } : task
        )
    })),

    // FSM-validated, DB-persisted status transition
    transitionTaskStatus: async (taskId, newStatus, actorType, actorId, notes) => {
        const snapshot = { tasks: get().tasks, assemblers: get().assemblers };

        // Optimistic UI update
        set((state) => ({
            tasks: state.tasks.map((task) =>
                task.id === taskId ? { ...task, status: newStatus } : task
            ),
            // Sync assembler status locally
            assemblers: state.assemblers.map((assembler) => {
                const task = state.tasks.find(t => t.id === taskId);
                if (!task?.assignedAssemblerIds.includes(assembler.id)) return assembler;
                let assemblerStatus = assembler.status;
                if (newStatus === 'EN_ROUTE') assemblerStatus = 'EN_ROUTE';
                else if (newStatus === 'ARRIVED' || newStatus === 'IN_PROGRESS') assemblerStatus = 'WORKING';
                else if (['COMPLETED', 'VERIFIED', 'CANCELLED'].includes(newStatus)) assemblerStatus = 'AVAILABLE';
                return { ...assembler, status: assemblerStatus };
            }),
        }));

        try {
            const response = await fetch(`/api/tasks/${taskId}/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newStatus, actorType, actorId, notes }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));

                // 404 = task not in DB (likely mock/demo data) → keep optimistic update, no rollback
                if (response.status === 404) {
                    console.info(`Task ${taskId} not found in DB (mock data) — status changed locally only`);
                    return;
                }

                // 422 = FSM validation error → rollback, show error
                if (response.status === 422) {
                    set({
                        tasks: snapshot.tasks,
                        assemblers: snapshot.assemblers,
                        error: errData.message || 'Invalid status transition',
                    });
                    return;
                }

                // Other errors → rollback
                throw new Error(errData.message || errData.error || 'Failed to change task status');
            }
        } catch (error) {
            // Rollback on unexpected failure
            set({
                tasks: snapshot.tasks,
                assemblers: snapshot.assemblers,
                error: error instanceof Error ? error.message : 'Failed to change task status',
            });
        }

    },

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
    },

    clearError: () => set({ error: null }),
}));

// Helpers for Real-time Data Mapping
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTask(data: any): AssemblyTask {
    return {
        id: data.id,
        orderId: data.order_id,
        status: normalizeTaskStatus(data.status ?? 'CREATED'),
        skillRequired: data.skill_required || 'EASY',
        scheduledStart: data.scheduled_start ? new Date(data.scheduled_start) : undefined,
        scheduledEnd: data.scheduled_end ? new Date(data.scheduled_end) : undefined,
        assignedAssemblerIds: data.assigned_assembler_ids || [],
        createdAt: new Date(data.created_at),
        estimatedDurationMinutes: data.estimated_duration_minutes || 60,
        history: (data.history || []).map((h: Record<string, unknown>) => ({
            id: h.id,
            taskId: h.task_id || data.id,
            type: h.type || h.event_type,
            eventTime: new Date(h.event_time as string | number | Date),
            location: h.location,
            metadata: h.metadata,
            description: h.description,
        }))
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
        assemblyWindow: (data.assembly_window_start && data.assembly_window_end)
            ? `${formatNZTime(data.assembly_window_start)} - ${formatNZTime(data.assembly_window_end)}`
            : (data.assembly_window_start || data.assembly_window_end || ''),
        estimatedTime: 120, // Default
        serviceFee: data.service_fee || 0,
        notes: data.notes,
        deliveryDate: formatNZDate(data.delivery_date) || data.delivery_date || ''
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
