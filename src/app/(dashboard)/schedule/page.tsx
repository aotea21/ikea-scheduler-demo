"use client";

import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
    AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Users, Activity, Clock,
    Wrench, User, MapPin, ChevronDown, ChevronRight, X,
} from "lucide-react";
import { TaskStatus, AssemblerStatus } from "@/lib/types";
import { ADMIN_TASK_ACTIONS, TASK_STATUS_LABELS, TASK_STATUS_COLORS } from "@/lib/task-fsm-config";
import dynamic from "next/dynamic";
import React, { useState, useMemo } from "react";

const MapComponent = dynamic(() => import("@/components/features/MapComponent"), { ssr: false });

// ─── Utility sub-components ───────────────────────────────────────────────────

function StatusDot({ status }: { status: TaskStatus }) {
    const c = TASK_STATUS_COLORS[status];
    return <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${c?.dot ?? 'bg-gray-400'}`} />;
}

function TaskBadge({ status }: { status: TaskStatus }) {
    const c = TASK_STATUS_COLORS[status] ?? { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${c.bg} ${c.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
            {TASK_STATUS_LABELS[status] ?? status}
        </span>
    );
}

const ASSEMBLER_STATUS_CONFIG: Record<AssemblerStatus, { color: string; bg: string; label: string }> = {
    OFFLINE:   { color: 'text-gray-500',   bg: 'bg-gray-50',   label: 'Offline' },
    AVAILABLE: { color: 'text-green-700',  bg: 'bg-green-50',  label: 'Available' },
    ASSIGNED:  { color: 'text-blue-700',   bg: 'bg-blue-50',   label: 'Assigned' },
    EN_ROUTE:  { color: 'text-orange-700', bg: 'bg-orange-50', label: 'En Route' },
    WORKING:   { color: 'text-red-700',    bg: 'bg-red-50',    label: 'Working' },
    BUSY:      { color: 'text-red-700',    bg: 'bg-red-50',    label: 'Busy' },
    INACTIVE:  { color: 'text-gray-500',   bg: 'bg-gray-100',  label: 'Inactive' },
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SchedulePage() {
    const { tasks, assemblers, orders, transitionTaskStatus, selectedTaskId, selectTask } = useStore();

    const ADMIN_ID = 'admin-001';

    // Panel state
    const [activeQueueFilter, setActiveQueueFilter] = useState<'all' | 'pending' | 'active' | 'issues' | 'done'>('all');
    const [selectedAssemblerId, setSelectedAssemblerId] = useState<string | null>(null);
    const [queueCollapsed, setQueueCollapsed] = useState(false);

    // ── Aggregated counts (Summary Bar) ──────────────────────────────────────
    const counts = useMemo(() => ({
        available: assemblers.filter(a => a.status === 'AVAILABLE').length,
        assigned:  assemblers.filter(a => a.status === 'ASSIGNED').length,
        enRoute:   assemblers.filter(a => a.status === 'EN_ROUTE').length,
        working:   assemblers.filter(a => a.status === 'WORKING').length,
        pending:   tasks.filter(t => ['CREATED', 'SCHEDULING'].includes(t.status)).length,
        active:    tasks.filter(t => ['ASSIGNED', 'CONFIRMED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(t.status)).length,
        issues:    tasks.filter(t => t.status === 'ISSUE').length,
        done:      tasks.filter(t => ['COMPLETED', 'VERIFIED', 'CANCELLED'].includes(t.status)).length,
    }), [tasks, assemblers]);

    // ── Filtered task queue ───────────────────────────────────────────────────
    const queueTasks = useMemo(() => {
        switch (activeQueueFilter) {
            case 'pending': return tasks.filter(t => ['CREATED', 'SCHEDULING'].includes(t.status));
            case 'active':  return tasks.filter(t => ['ASSIGNED', 'CONFIRMED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(t.status));
            case 'issues':  return tasks.filter(t => t.status === 'ISSUE');
            case 'done':    return tasks.filter(t => ['COMPLETED', 'VERIFIED', 'CANCELLED'].includes(t.status));
            default:        return tasks;
        }
    }, [tasks, activeQueueFilter]);

    // ── Selected task detail ──────────────────────────────────────────────────
    const selectedTask     = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) : null;
    const selectedOrder    = selectedTask ? orders.find(o => o.id === selectedTask.orderId) : null;
    const assignedAssemblers = selectedTask
        ? assemblers.filter(a => selectedTask.assignedAssemblerIds.includes(a.id))
        : [];
    const selectedAssembler = selectedAssemblerId
        ? assemblers.find(a => a.id === selectedAssemblerId)
        : null;
    const adminActions = selectedTask ? (ADMIN_TASK_ACTIONS[selectedTask.status] ?? []) : [];

    const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
        await transitionTaskStatus(taskId, newStatus, 'admin', ADMIN_ID);
    };

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col h-full overflow-hidden bg-[#f8f9fa]">

                {/* ════════ SUMMARY BAR ════════ */}
                <div className="flex-none border-b bg-white px-5 py-3">
                    <div className="flex items-center justify-between">
                        <h1 className="text-base font-bold text-[#111111] tracking-tight">Operations Center</h1>
                        {/* Assembler Status Chips */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {([
                                { key: 'available', label: '🟢 Available', val: counts.available, cls: 'text-green-700 bg-green-50 border-green-200' },
                                { key: 'assigned',  label: '🔵 Assigned',  val: counts.assigned,  cls: 'text-blue-700 bg-blue-50 border-blue-200' },
                                { key: 'enRoute',   label: '🟠 En Route',  val: counts.enRoute,   cls: 'text-orange-700 bg-orange-50 border-orange-200' },
                                { key: 'working',   label: '🔴 Working',   val: counts.working,   cls: 'text-red-700 bg-red-50 border-red-200' },
                            ] as const).map(s => (
                                <span key={s.key} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${s.cls}`}>
                                    {s.label}: <strong>{s.val}</strong>
                                </span>
                            ))}
                            <span className="text-gray-300 text-sm mx-1">|</span>
                            {([
                                { label: 'Pending', val: counts.pending, cls: 'text-gray-600 bg-gray-50 border-gray-200', filter: 'pending' },
                                { label: 'Active',  val: counts.active,  cls: 'text-blue-600 bg-blue-50 border-blue-200', filter: 'active' },
                                { label: 'Issues',  val: counts.issues,  cls: 'text-red-600 bg-red-50 border-red-200',    filter: 'issues' },
                                { label: 'Done',    val: counts.done,    cls: 'text-green-600 bg-green-50 border-green-200', filter: 'done' },
                            ] as const).map(s => (
                                <button
                                    key={s.filter}
                                    onClick={() => setActiveQueueFilter(prev => prev === s.filter ? 'all' : s.filter)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${s.cls} ${activeQueueFilter === s.filter ? 'ring-2 ring-offset-1 ring-current' : 'opacity-70 hover:opacity-100'}`}
                                >
                                    {s.label} <strong>{s.val}</strong>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ════════ MAIN 3-PANEL AREA ════════ */}
                <div className="flex flex-1 overflow-hidden">

                    {/* ── LEFT: Task Queue ─────────────────────────────────── */}
                    <div className={`flex-none flex flex-col border-r bg-white transition-all duration-200 ${queueCollapsed ? 'w-10' : 'w-72'}`}>
                        <div
                            className="flex items-center justify-between p-3 border-b cursor-pointer select-none hover:bg-gray-50"
                            onClick={() => setQueueCollapsed(v => !v)}
                        >
                            {!queueCollapsed && (
                                <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                                    Task Queue ({queueTasks.length})
                                </span>
                            )}
                            {queueCollapsed ? <ChevronRight className="w-4 h-4 text-gray-400 mx-auto" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </div>

                        {!queueCollapsed && (
                            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                {queueTasks.length === 0 && (
                                    <div className="p-6 text-center text-gray-400 text-xs">No tasks</div>
                                )}
                                {queueTasks.map(task => {
                                    const order = orders.find(o => o.id === task.orderId);
                                    const isSelected = selectedTaskId === task.id;
                                    return (
                                        <button
                                            key={task.id}
                                            onClick={() => {
                                                selectTask(isSelected ? null : task.id);
                                                setSelectedAssemblerId(null);
                                            }}
                                            className={`w-full text-left rounded-lg p-2.5 transition-all border text-xs ${isSelected ? 'border-[#0058a3] bg-blue-50 ring-1 ring-[#0058a3]' : 'border-transparent hover:border-gray-200 hover:bg-gray-50'}`}
                                        >
                                            <div className="flex items-center justify-between gap-1 mb-1">
                                                <span className="font-semibold text-gray-800 truncate">
                                                    #{task.orderId.slice(0, 6).toUpperCase()}
                                                </span>
                                                <TaskBadge status={task.status} />
                                            </div>
                                            <div className="text-gray-500 truncate">{order?.customerName}</div>
                                            <div className="flex items-center gap-2 mt-1 text-gray-400">
                                                <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{task.estimatedDurationMinutes}m</span>
                                                <span className="flex items-center gap-0.5"><Wrench className="w-3 h-3" />{task.skillRequired}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* ── CENTER: Map View ──────────────────────────────────── */}
                    <div className="flex-1 relative min-w-0">
                        <MapComponent
                            selectedAssemblerId={selectedAssemblerId ?? undefined}
                            onAssemblerClick={(id) => {
                                setSelectedAssemblerId(prev => prev === id ? null : id);
                                selectTask(null);
                            }}
                            onTaskClick={(id) => {
                                selectTask(id);
                                setSelectedAssemblerId(null);
                            }}
                        />
                    </div>

                    {/* ── RIGHT: Assembler Table ────────────────────────────── */}
                    <div className="flex-none w-64 border-l bg-white flex flex-col">
                        <div className="p-3 border-b">
                            <span className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5" />
                                Assemblers ({assemblers.length})
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {assemblers.map(a => {
                                const cfg = ASSEMBLER_STATUS_CONFIG[a.status];
                                const isSelected = selectedAssemblerId === a.id;
                                const activeTasks = tasks.filter(t => t.assignedAssemblerIds.includes(a.id) && !['COMPLETED', 'VERIFIED', 'CANCELLED'].includes(t.status));
                                return (
                                    <button
                                        key={a.id}
                                        onClick={() => {
                                            setSelectedAssemblerId(prev => prev === a.id ? null : a.id);
                                            selectTask(null);
                                        }}
                                        className={`w-full text-left px-3 py-2.5 border-b text-xs transition-all ${isSelected ? 'bg-blue-50 border-l-2 border-l-[#0058a3]' : 'hover:bg-gray-50 border-l-2 border-l-transparent'}`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-semibold text-gray-800 truncate">{a.name}</span>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                                                {cfg.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <span>⭐ {a.rating}</span>
                                            <span>{a.skills?.join(', ')}</span>
                                        </div>
                                        {activeTasks.length > 0 && (
                                            <div className="mt-1 text-[10px] text-blue-600">
                                                {activeTasks.length} active task{activeTasks.length > 1 ? 's' : ''}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ════════ DETAIL PANEL (slides up at bottom) ════════ */}
                {(selectedTask || selectedAssembler) && (
                    <div className="flex-none border-t bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.08)] max-h-72 overflow-y-auto">
                        {selectedTask && selectedOrder && (
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-base font-bold text-[#111111]">
                                                Order #{selectedOrder.id.slice(0, 8).toUpperCase()}
                                            </h2>
                                            <TaskBadge status={selectedTask.status} />
                                        </div>
                                        <p className="text-sm text-gray-500 mt-0.5">
                                            {selectedOrder.customerName}
                                            {selectedOrder.address?.address && (
                                                <span className="ml-2 text-xs inline-flex items-center gap-1 text-gray-400">
                                                    <MapPin className="w-3 h-3" />{selectedOrder.address.address}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 -mt-1 -mr-1" onClick={() => selectTask(null)}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="flex flex-wrap gap-6 text-xs text-gray-500 mb-4">
                                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{selectedTask.estimatedDurationMinutes} min</span>
                                    <span className="flex items-center gap-1"><Wrench className="w-3.5 h-3.5" />{selectedTask.skillRequired}</span>
                                    {selectedTask.scheduledStart && (
                                        <span className="flex items-center gap-1">
                                            <Activity className="w-3.5 h-3.5" />
                                            <span suppressHydrationWarning>
                                                {new Date(selectedTask.scheduledStart).toLocaleString('en-NZ', { timeStyle: 'short', dateStyle: 'short' })}
                                            </span>
                                        </span>
                                    )}
                                    {assignedAssemblers.length > 0 && (
                                        <span className="flex items-center gap-1">
                                            <User className="w-3.5 h-3.5" />
                                            {assignedAssemblers.map(a => a.name).join(', ')}
                                        </span>
                                    )}
                                </div>

                                {/* Admin FSM Actions */}
                                {adminActions.length > 0 && (
                                    <div className="flex gap-2 flex-wrap">
                                        {adminActions.map((action) => (
                                            <AlertDialog key={action.targetStatus}>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        variant={action.variant ?? 'outline'}
                                                        className="h-8 text-xs"
                                                    >
                                                        {action.icon && <span className="mr-1">{action.icon}</span>}
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
                                                            onClick={() => handleStatusChange(selectedTask.id, action.targetStatus)}
                                                            className={action.variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#0058a3] hover:bg-[#004f94]'}
                                                        >
                                                            {action.confirmButtonText}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {selectedAssembler && !selectedTask && (
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-base font-bold text-[#111111]">{selectedAssembler.name}</h2>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ASSEMBLER_STATUS_CONFIG[selectedAssembler.status]?.bg} ${ASSEMBLER_STATUS_CONFIG[selectedAssembler.status]?.color}`}>
                                                {ASSEMBLER_STATUS_CONFIG[selectedAssembler.status]?.label}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            ⭐ {selectedAssembler.rating} · {selectedAssembler.skills?.join(', ')}
                                            {selectedAssembler.mobileNumberPrimary && <span className="ml-2 text-gray-400">{selectedAssembler.mobileNumberPrimary}</span>}
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 -mt-1 -mr-1" onClick={() => setSelectedAssemblerId(null)}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                                {/* Active tasks for this assembler */}
                                {(() => {
                                    const myTasks = tasks.filter(t =>
                                        t.assignedAssemblerIds.includes(selectedAssembler.id) &&
                                        !['COMPLETED', 'VERIFIED', 'CANCELLED'].includes(t.status)
                                    );
                                    return myTasks.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {myTasks.map(t => {
                                                const o = orders.find(o => o.id === t.orderId);
                                                return (
                                                    <button
                                                        key={t.id}
                                                        onClick={() => { selectTask(t.id); setSelectedAssemblerId(null); }}
                                                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-[#0058a3] hover:bg-blue-50 transition-all text-xs"
                                                    >
                                                        <StatusDot status={t.status} />
                                                        <span className="font-medium">{o?.customerName ?? t.orderId.slice(0, 6)}</span>
                                                        <TaskBadge status={t.status} />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-400">No active tasks assigned.</p>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
}
