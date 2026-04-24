"use client";

import { useStore } from "@/lib/store";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    CheckCircle2,
    Circle,
    Clock,
    AlertCircle,
    Truck,
    RefreshCw,
    MapPin,
    Wrench,
    Flag,
    Package,
    Phone,
    Navigation,
    CalendarClock,
    ChevronDown,
    ChevronUp,
    Search,
} from "lucide-react";
import { JobEventType, TaskStatus } from "@/lib/types";
import {
    ASSEMBLER_TASK_ACTIONS,
    TASK_STATUS_LABELS,
    TASK_STATUS_COLORS,
    TaskFSMAction,
} from "@/lib/task-fsm-config";
import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";

// ─── Event helpers ─────────────────────────────────────────────────────────────

const getEventIcon = (type: JobEventType) => {
    switch (type) {
        case 'ASSIGNED':       return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
        case 'CONFIRMED':      return <CheckCircle2 className="w-4 h-4 text-indigo-500" />;
        case 'EN_ROUTE':       return <Truck className="w-4 h-4 text-orange-500" />;
        case 'ARRIVED':        return <MapPin className="w-4 h-4 text-yellow-500" />;
        case 'STARTED':        return <Wrench className="w-4 h-4 text-purple-500" />;
        case 'COMPLETED':      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
        case 'VERIFIED':       return <CheckCircle2 className="w-4 h-4 text-green-700" />;
        case 'ISSUE_REPORTED': return <AlertCircle className="w-4 h-4 text-red-500" />;
        case 'CANCELLED':      return <Flag className="w-4 h-4 text-gray-400" />;
        case 'STATUS_CHANGED': return <RefreshCw className="w-4 h-4 text-gray-400" />;
        default:               return <Circle className="w-4 h-4 text-gray-300" />;
    }
};

const EVENT_LABEL: Record<JobEventType, string> = {
    STATUS_CHANGED:  'Status Updated',
    ASSIGNED:        'Worker Assigned',
    CONFIRMED:       'Job Accepted',
    EN_ROUTE:        'En Route',
    ARRIVED:         'Arrived at Site',
    STARTED:         'Assembly Started',
    COMPLETED:       'Job Completed',
    VERIFIED:        'Verified by Admin',
    ISSUE_REPORTED:  'Issue Reported',
    CANCELLED:       'Task Cancelled',
    REASSIGNED:      'Reassigned',
};

// ─── Shared Sub-components ─────────────────────────────────────────────────────

function TaskStatusBadge({ status }: { status: TaskStatus }) {
    const colors = TASK_STATUS_COLORS[status] ?? { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
            {TASK_STATUS_LABELS[status] ?? status}
        </span>
    );
}

function AssemblerActionButton({ action, onClick }: { action: TaskFSMAction; onClick: () => void }) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant={action.variant ?? 'default'}
                    className="flex-1 h-12 text-sm font-semibold rounded-xl"
                >
                    {action.icon && <span className="mr-1.5">{action.icon}</span>}
                    {action.label}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{action.confirmTitle}</AlertDialogTitle>
                    <AlertDialogDescription>{action.confirmMessage}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onClick}
                        className={action.variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#0058a3] hover:bg-[#004f94]'}
                    >
                        {action.confirmButtonText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

// ─── Task Card (shared) ─────────────────────────────────────────────────────────

type StoreTasks = ReturnType<typeof useStore.getState>['tasks'];
type StoreOrders = ReturnType<typeof useStore.getState>['orders'];
type StoreTransition = ReturnType<typeof useStore.getState>['transitionTaskStatus'];

function TaskCard({
    task,
    order,
    assemblerActorId,
    onTransition,
    compact = false,
}: {
    task: StoreTasks[number];
    order: StoreOrders[number] | undefined;
    assemblerActorId: string;
    onTransition: StoreTransition;
    compact?: boolean;
}) {
    const [showHistory, setShowHistory] = useState(false);
    const actions = ASSEMBLER_TASK_ACTIONS[task.status] ?? [];
    const history = useMemo(
        () => [...(task.history ?? [])].sort((a, b) =>
            new Date(b.eventTime).getTime() - new Date(a.eventTime).getTime()
        ),
        [task.history]
    );

    const borderColor =
        task.status === 'ISSUE'      ? 'border-l-red-500' :
        task.status === 'COMPLETED' || task.status === 'VERIFIED' ? 'border-l-green-500' :
        task.status === 'EN_ROUTE'   ? 'border-l-orange-400' :
        'border-l-[#0058a3]';

    if (compact) {
        // Compact row for Admin/Dispatcher view
        return (
            <div className={`flex items-center gap-3 py-3 px-4 border-l-4 ${borderColor} bg-white hover:bg-gray-50 transition-colors`}>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-800">
                            Order #{(order?.id ?? task.orderId).slice(0, 7).toUpperCase()}
                        </span>
                        {order && <span className="text-xs text-gray-500">{order.customerName}</span>}
                    </div>
                    {order?.address?.address && (
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{order.address.address}</span>
                        </p>
                    )}
                    {task.scheduledStart && (
                        <p className="text-xs text-blue-500 mt-0.5" suppressHydrationWarning>
                            {new Date(task.scheduledStart).toLocaleString('en-NZ', {
                                weekday: 'short', month: 'short', day: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                            })}
                        </p>
                    )}
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <TaskStatusBadge status={task.status} />
                    {actions.length > 0 && (
                        <div className="flex gap-1 flex-wrap justify-end">
                            {actions.map(action => (
                                <AssemblerActionButton
                                    key={action.targetStatus}
                                    action={action}
                                    onClick={() => onTransition(task.id, action.targetStatus, 'admin', assemblerActorId)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Full card for Assembler view
    return (
        <Card className={`overflow-hidden border-t-4 ${borderColor.replace('border-l-', 'border-t-')} shadow-sm`}>
            <CardHeader className="pb-3 bg-gray-50/70 border-b">
                <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-base">
                            Order #{(order?.id ?? task.orderId).slice(0, 7).toUpperCase()}
                        </CardTitle>
                        {order && (
                            <p className="text-sm font-medium text-gray-700 mt-0.5">{order.customerName}</p>
                        )}
                        {order?.address?.address && (
                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{order.address.address}</span>
                            </p>
                        )}
                    </div>
                    <TaskStatusBadge status={task.status} />
                </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5">
                        <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Est. Time</p>
                            <p className="text-sm font-semibold text-gray-800">{task.estimatedDurationMinutes} min</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5">
                        <Wrench className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Skills</p>
                            <p className="text-sm font-semibold text-gray-800">{task.requiredSkills?.join(', ')}</p>
                        </div>
                    </div>
                    {task.scheduledStart && (
                        <div className="flex items-center gap-2 bg-blue-50 rounded-lg p-2.5 col-span-2">
                            <CalendarClock className="w-4 h-4 text-blue-400 flex-shrink-0" />
                            <div>
                                <p className="text-[10px] text-blue-400 uppercase tracking-wide">Scheduled</p>
                                <p className="text-sm font-semibold text-blue-800" suppressHydrationWarning>
                                    {new Date(task.scheduledStart).toLocaleString('en-NZ', {
                                        weekday: 'short', month: 'short', day: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {order?.items && order.items.length > 0 && (
                    <div className="border rounded-lg p-3 space-y-1.5">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                            <Package className="w-3 h-3" /> Items
                        </p>
                        {order.items.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                                <span className="text-gray-700 truncate">{item.name}</span>
                                <span className="text-gray-400 ml-2 flex-shrink-0">×{item.quantity}</span>
                            </div>
                        ))}
                        {order.items.length > 3 && (
                            <p className="text-xs text-gray-400">+{order.items.length - 3} more items</p>
                        )}
                    </div>
                )}

                {order?.customerPhone && (
                    <a href={`tel:${order.customerPhone}`} className="flex items-center gap-2 text-[#0058a3] text-sm font-medium hover:underline">
                        <Phone className="w-4 h-4" />
                        {order.customerPhone}
                    </a>
                )}

                {order?.address?.address && (
                    <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(order.address.address)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors"
                    >
                        <Navigation className="w-4 h-4 text-[#0058a3]" />
                        Navigate to Site
                    </a>
                )}

                {actions.length > 0 && (
                    <div className="flex gap-2 flex-wrap pt-1">
                        {actions.map(action => (
                            <AssemblerActionButton
                                key={action.targetStatus}
                                action={action}
                                onClick={() => onTransition(task.id, action.targetStatus, 'assembler', assemblerActorId)}
                            />
                        ))}
                    </div>
                )}

                {history.length > 0 && (
                    <div className="border-t pt-3">
                        <button
                            onClick={() => setShowHistory(v => !v)}
                            className="flex items-center justify-between w-full text-[10px] font-semibold text-gray-400 uppercase tracking-wide"
                        >
                            <span>Timeline ({history.length})</span>
                            {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        {showHistory && (
                            <div className="space-y-3 mt-3">
                                {history.map((event, idx) => (
                                    <div key={idx} className="flex gap-3 relative">
                                        {idx !== history.length - 1 && (
                                            <div className="absolute left-[8px] top-5 bottom-[-12px] w-[1px] bg-gray-100" />
                                        )}
                                        <div className="flex-shrink-0 z-10 bg-white">
                                            {getEventIcon(event.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center">
                                                <h4 className="text-xs font-semibold text-gray-800">
                                                    {EVENT_LABEL[event.type] ?? event.type.replace(/_/g, ' ')}
                                                </h4>
                                                <span className="text-[10px] text-gray-400 ml-2" suppressHydrationWarning>
                                                    {new Date(event.eventTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            {event.description && (
                                                <p className="text-[11px] text-gray-500 mt-0.5">{event.description}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ─── Admin/Dispatcher: Assembler Group Card ─────────────────────────────────────

const STATUS_ORDER: TaskStatus[] = ['ISSUE', 'IN_PROGRESS', 'EN_ROUTE', 'CONFIRMED', 'ASSIGNED', 'CREATED', 'COMPLETED', 'VERIFIED', 'CANCELLED'];

function AssemblerGroupCard({
    assembler,
    tasks,
    orders,
    onTransition,
}: {
    assembler: StoreTasks[number] extends { id: string } ? { id: string; name: string; status: string; avatar?: string } : never;
    tasks: StoreTasks;
    orders: StoreOrders;
    onTransition: StoreTransition;
}) {
    const [expanded, setExpanded] = useState(true);
    const sorted = [...tasks].sort((a, b) =>
        STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
    );
    const issueCount = tasks.filter(t => t.status === 'ISSUE').length;
    const activeCount = tasks.filter(t => ['ASSIGNED', 'CONFIRMED', 'EN_ROUTE', 'IN_PROGRESS', 'MATERIALS_VERIFIED'].includes(t.status)).length;

    const statusColor =
        issueCount > 0 ? 'bg-red-50 border-red-200' :
        assembler.status === 'WORKING' || assembler.status === 'IN_PROGRESS' ? 'bg-purple-50 border-purple-200' :
        assembler.status === 'EN_ROUTE' ? 'bg-orange-50 border-orange-200' :
        assembler.status === 'AVAILABLE' ? 'bg-green-50 border-green-200' :
        'bg-gray-50 border-gray-200';

    return (
        <Card className={`overflow-hidden border ${statusColor}`}>
            <button
                onClick={() => setExpanded(v => !v)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-black/5 transition-colors"
            >
                {/* Avatar */}
                <div className="h-10 w-10 rounded-full bg-[#0058a3] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">
                        {assembler.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{assembler.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                            assembler.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                            assembler.status === 'WORKING' ? 'bg-purple-100 text-purple-700' :
                            assembler.status === 'EN_ROUTE' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-600'
                        )}>
                            {assembler.status}
                        </span>
                        {issueCount > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">
                                ⚠ {issueCount} issue{issueCount > 1 ? 's' : ''}
                            </span>
                        )}
                        <span className="text-xs text-gray-400">{activeCount} active · {tasks.length} total</span>
                    </div>
                </div>

                {/* Chevron */}
                <div className="text-gray-400 flex-shrink-0">
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
            </button>

            {expanded && tasks.length > 0 && (
                <div className="border-t divide-y">
                    {sorted.map(task => {
                        const order = orders.find(o => o.id === task.orderId);
                        return (
                            <TaskCard
                                key={task.id}
                                task={task}
                                order={order}
                                assemblerActorId={assembler.id}
                                onTransition={onTransition}
                                compact
                            />
                        );
                    })}
                </div>
            )}

            {expanded && tasks.length === 0 && (
                <div className="border-t px-4 py-6 text-center text-xs text-gray-400">
                    No tasks assigned
                </div>
            )}
        </Card>
    );
}

// ─── Admin/Dispatcher: Full Status View ────────────────────────────────────────

function AdminStatusView() {
    const { tasks, orders, assemblers, transitionTaskStatus, fetchData, subscribeToChanges } = useStore();
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchData();
        const unsubscribe = subscribeToChanges();
        return unsubscribe;
    }, [fetchData, subscribeToChanges]);
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'issue'>('active');

    const ACTIVE_STATUSES = useMemo<TaskStatus[]>(() => ['ASSIGNED', 'CONFIRMED', 'EN_ROUTE', 'IN_PROGRESS', 'MATERIALS_VERIFIED', 'ISSUE'], []);

    // Build per-assembler task map
    const assemblerTaskMap = useMemo(() => {
        const map = new Map<string, StoreTasks>();
        for (const asm of assemblers) {
            const asmTasks = tasks.filter(t =>
                t.assignedAssemblerIds?.includes(asm.id)
            );
            // Apply status filter
            const filtered = statusFilter === 'all' ? asmTasks :
                statusFilter === 'active' ? asmTasks.filter(t => ACTIVE_STATUSES.includes(t.status)) :
                asmTasks.filter(t => t.status === 'ISSUE');
            map.set(asm.id, filtered);
        }
        return map;
    }, [tasks, assemblers, statusFilter, ACTIVE_STATUSES]);

    // Unassigned tasks
    const unassignedTasks = useMemo(() =>
        tasks.filter(t => !t.assignedAssemblerIds?.length),
        [tasks]
    );

    // Summary counters - compute from all tasks (not filtered)
    const allActiveTasks = tasks.filter(t => ACTIVE_STATUSES.includes(t.status));
    const issueTasks = tasks.filter(t => t.status === 'ISSUE');

    const filteredAssemblers = assemblers.filter(a =>
        !search || a.name.toLowerCase().includes(search.toLowerCase())
    );

    // Sort: issues first, then active, then idle
    const sortedAssemblers = [...filteredAssemblers].sort((a, b) => {
        const aIssue = (assemblerTaskMap.get(a.id) ?? []).some(t => t.status === 'ISSUE');
        const bIssue = (assemblerTaskMap.get(b.id) ?? []).some(t => t.status === 'ISSUE');
        if (aIssue !== bIssue) return aIssue ? -1 : 1;
        const aActive = (assemblerTaskMap.get(a.id) ?? []).length;
        const bActive = (assemblerTaskMap.get(b.id) ?? []).length;
        return bActive - aActive;
    });

    return (
        <div className="max-w-4xl mx-auto w-full">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b px-4 pt-5 pb-3 md:px-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-xl font-bold text-[#111111]">Job Status</h1>
                        <p className="text-xs text-gray-500 mt-0.5" suppressHydrationWarning>
                            {new Date().toLocaleDateString('en-NZ', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    {/* Summary pills */}
                    <div className="flex gap-2">
                        <div className="text-center bg-blue-50 px-3 py-1.5 rounded-lg">
                            <p className="text-lg font-bold text-[#0058a3]">{allActiveTasks.length}</p>
                            <p className="text-[10px] text-blue-400 font-medium">Active</p>
                        </div>
                        {issueTasks.length > 0 && (
                            <div className="text-center bg-red-50 px-3 py-1.5 rounded-lg">
                                <p className="text-lg font-bold text-red-600">{issueTasks.length}</p>
                                <p className="text-[10px] text-red-400 font-medium">Issues</p>
                            </div>
                        )}
                        <div className="text-center bg-gray-50 px-3 py-1.5 rounded-lg">
                            <p className="text-lg font-bold text-gray-700">{assemblers.length}</p>
                            <p className="text-[10px] text-gray-400 font-medium">Assemblers</p>
                        </div>
                    </div>
                </div>

                {/* Search + Filter bar */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search assembler…"
                            className="w-full pl-8 pr-3 py-2 text-sm border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        {([
                            { key: 'active' as const, label: 'Active' },
                            { key: 'issue'  as const, label: '⚠ Issues' },
                            { key: 'all'    as const, label: 'All' },
                        ]).map(f => (
                            <button
                                key={f.key}
                                onClick={() => setStatusFilter(f.key)}
                                className={cn(
                                    "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                                    statusFilter === f.key
                                        ? "bg-white text-[#0058a3] shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Assembler list */}
            <div className="p-4 md:p-6 space-y-3 pb-8">
                {/* Unassigned tasks warning */}
                {unassignedTasks.length > 0 && statusFilter === 'all' && (
                    <Card className="border border-yellow-200 bg-yellow-50">
                        <div className="flex items-center gap-3 p-4">
                            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-yellow-800">
                                    {unassignedTasks.length} unassigned task{unassignedTasks.length > 1 ? 's' : ''}
                                </p>
                                <p className="text-xs text-yellow-600">These tasks have no assembler assigned</p>
                            </div>
                        </div>
                    </Card>
                )}

                {sortedAssemblers.map(asm => {
                    const asmTasks = assemblerTaskMap.get(asm.id) ?? [];
                    // Show all assemblers in 'all' mode, otherwise only those with tasks
                    if (statusFilter !== 'all' && asmTasks.length === 0) return null;
                    return (
                        <AssemblerGroupCard
                            key={asm.id}
                            assembler={asm as Parameters<typeof AssemblerGroupCard>[0]['assembler']}
                            tasks={asmTasks}
                            orders={orders}
                            onTransition={transitionTaskStatus}
                        />
                    );
                })}
            </div>
        </div>
    );
}

// ─── Assembler: My Jobs View ─────────────────────────────────────────────────────

type TabFilter = 'active' | 'done';

function AssemblerStatusView() {
    const { tasks, orders, assemblers, transitionTaskStatus, fetchData, subscribeToChanges } = useStore();
    const { profile, isLoading: authLoading } = useAuth();

    useEffect(() => {
        fetchData();
        const unsubscribe = subscribeToChanges();
        return unsubscribe;
    }, [fetchData, subscribeToChanges]);
    const [tab, setTab] = useState<TabFilter>('active');

    const { assembler, assemblerTasks } = useMemo(() => {
        if (!profile) return { assembler: null, assemblerTasks: [] };
        if (profile.role === 'ASSEMBLER' && profile.assembler_id) {
            const asm = assemblers.find(a => a.id === profile.assembler_id);
            const myTasks = tasks.filter(t =>
                t.assignedAssemblerIds?.includes(profile.assembler_id!) ?? false
            );
            return { assembler: asm ?? null, assemblerTasks: myTasks };
        }
        return { assembler: assemblers[0] ?? null, assemblerTasks: tasks };
    }, [profile, tasks, assemblers]);

    const ACTIVE_STATUSES = useMemo<TaskStatus[]>(() => ['ASSIGNED', 'CONFIRMED', 'EN_ROUTE', 'MATERIALS_VERIFIED', 'IN_PROGRESS', 'ISSUE'], []);
    const DONE_STATUSES = useMemo<TaskStatus[]>(() => ['COMPLETED', 'VERIFIED', 'CANCELLED', 'CREATED'], []);

    const filteredTasks = useMemo(() => {
        const statusSet = tab === 'active' ? ACTIVE_STATUSES : DONE_STATUSES;
        return assemblerTasks.filter(t => statusSet.includes(t.status));
    }, [assemblerTasks, tab, ACTIVE_STATUSES, DONE_STATUSES]);

    const activeCount = assemblerTasks.filter(t => ACTIVE_STATUSES.includes(t.status)).length;
    const doneCount = assemblerTasks.filter(t => DONE_STATUSES.includes(t.status)).length;
    const actorId = profile?.assembler_id ?? assembler?.id ?? 'unknown';

    return (
        <div className="max-w-2xl mx-auto w-full">
            <div className="sticky top-0 z-10 bg-white border-b px-4 pt-5 pb-3 md:px-8">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h1 className="text-xl font-bold text-[#111111]">My Jobs</h1>
                        {authLoading ? (
                            <p className="text-xs text-gray-400 mt-0.5">Loading…</p>
                        ) : assembler ? (
                            <p className="text-xs text-gray-500 mt-0.5">
                                {assembler.name} · {assemblerTasks.length} task{assemblerTasks.length !== 1 ? 's' : ''}
                            </p>
                        ) : profile ? (
                            <p className="text-xs text-gray-500 mt-0.5">{profile.name}</p>
                        ) : null}
                    </div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide" suppressHydrationWarning>
                        {new Date().toLocaleDateString('en-NZ', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                </div>
                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                    {([
                        { key: 'active' as const, label: 'Active', count: activeCount },
                        { key: 'done'   as const, label: 'Completed', count: doneCount },
                    ]).map(t => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-all",
                                tab === t.key
                                    ? "bg-white text-[#0058a3] shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            {t.label}
                            <span className={cn(
                                "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                                tab === t.key ? "bg-blue-50 text-[#0058a3]" : "bg-gray-200 text-gray-500"
                            )}>
                                {t.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-4 md:p-6 space-y-4 pb-24 md:pb-6">
                {authLoading && (
                    <div className="space-y-4">
                        {[1, 2].map(i => (
                            <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
                        ))}
                    </div>
                )}
                {!authLoading && filteredTasks.length === 0 && (
                    <div className="py-16 text-center">
                        <Clock className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                        <p className="text-sm font-medium text-gray-400">
                            {tab === 'active' ? 'No active jobs right now' : 'No completed jobs yet'}
                        </p>
                    </div>
                )}
                {!authLoading && filteredTasks.map(task => {
                    const order = orders.find(o => o.id === task.orderId);
                    return (
                        <TaskCard
                            key={task.id}
                            task={task}
                            order={order}
                            assemblerActorId={actorId}
                            onTransition={transitionTaskStatus}
                        />
                    );
                })}
            </div>
        </div>
    );
}

// ─── Main Page: role-based routing ─────────────────────────────────────────────

export default function StatusPage() {
    const { profile, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="p-8 space-y-4 max-w-4xl mx-auto">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                </div>
            );
    }

    const isAdminOrDispatcher = profile?.role === 'ADMIN' || profile?.role === 'DISPATCHER';

    return isAdminOrDispatcher ? <AdminStatusView /> : <AssemblerStatusView />;
}
