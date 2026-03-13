"use client";

import { DashboardLayout } from "@/components/features/DashboardLayout";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Calendar, Clock, User, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { ADMIN_TASK_ACTIONS, TASK_STATUS_LABELS, TASK_STATUS_COLORS } from "@/lib/task-fsm-config";
import { TaskStatus } from "@/lib/types";
import React from "react";

function TaskStatusBadge({ status }: { status: TaskStatus }) {
    const colors = TASK_STATUS_COLORS[status] ?? { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };
    const label = TASK_STATUS_LABELS[status] ?? status;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
            {label}
        </span>
    );
}

export default function SchedulePage() {
    const { tasks, assemblers, orders, transitionTaskStatus } = useStore();

    // Admin is hardcoded for demo; in production, use auth session
    const ADMIN_ID = 'admin-001';

    const unassigned  = tasks.filter(t => ['CREATED', 'SCHEDULING'].includes(t.status));
    const active      = tasks.filter(t => ['ASSIGNED', 'CONFIRMED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(t.status));
    const issues      = tasks.filter(t => t.status === 'ISSUE');
    const completed   = tasks.filter(t => ['COMPLETED', 'VERIFIED', 'CANCELLED'].includes(t.status));

    const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
        await transitionTaskStatus(taskId, newStatus, 'admin', ADMIN_ID);
    };

    const renderTaskCard = (task: typeof tasks[0]) => {
        const assignedAssemblers = assemblers.filter(a => task.assignedAssemblerIds.includes(a.id));
        const order = orders.find(o => o.id === task.orderId);
        const adminActions = ADMIN_TASK_ACTIONS[task.status] ?? [];

        return (
            <Card key={task.id} className={`border-l-4 ${task.status === 'ISSUE' ? 'border-l-red-500 bg-red-50/30' : task.status === 'VERIFIED' ? 'border-l-green-500' : 'border-l-[#0058a3]'} transition-shadow hover:shadow-md`}>
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                            <CardTitle className="text-sm font-semibold truncate">
                                Order #{task.orderId.slice(0, 8).toUpperCase()}
                            </CardTitle>
                            {order && (
                                <p className="text-xs text-gray-500 mt-0.5 truncate">{order.customerName}</p>
                            )}
                        </div>
                        <TaskStatusBadge status={task.status} />
                    </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {task.estimatedDurationMinutes}min · {task.skillRequired}
                        </span>
                        {task.scheduledStart && (
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(task.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        )}
                    </div>

                    {assignedAssemblers.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                            <User className="w-3 h-3 text-gray-400" />
                            {assignedAssemblers.map(a => a.name).join(', ')}
                        </div>
                    )}

                    {/* Admin Actions */}
                    {adminActions.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100">
                            {adminActions.map((action) => (
                                <AlertDialog key={action.targetStatus}>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            size="sm"
                                            variant={action.variant ?? 'outline'}
                                            className="h-7 text-xs"
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
                                                onClick={() => handleStatusChange(task.id, action.targetStatus)}
                                                className={action.variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : ''}
                                            >
                                                {action.confirmButtonText}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    const SectionHeader = ({ title, count, icon: Icon, color }: { title: string; count: number; icon: React.ElementType; color: string }) => (
        <div className="flex items-center justify-between mb-3">
            <h2 className={`text-sm font-semibold flex items-center gap-1.5 ${color}`}>
                <Icon className="w-4 h-4" />
                {title}
            </h2>
            <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{count}</span>
        </div>
    );

    return (
        <DashboardLayout>
            <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-[#111111]">Operations — Task Queue</h1>
                    <div className="flex gap-2 text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded">{tasks.length} total tasks</span>
                    </div>
                </div>

                {/* Summary Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                    {[
                        { label: 'Unassigned', count: unassigned.length, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' },
                        { label: 'Active',     count: active.length,     color: 'text-blue-600',  bg: 'bg-blue-50 border-blue-200' },
                        { label: 'Issues',     count: issues.length,     color: 'text-red-600',   bg: 'bg-red-50 border-red-200' },
                        { label: 'Done',       count: completed.length,  color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
                    ].map(s => (
                        <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
                            <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Task Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {/* Unassigned */}
                    <div>
                        <SectionHeader title="Pending" count={unassigned.length} icon={Clock} color="text-gray-700" />
                        <div className="space-y-3">
                            {unassigned.length === 0 ? (
                                <div className="p-6 border-2 border-dashed rounded-xl text-center text-gray-400 text-sm bg-gray-50">All assigned</div>
                            ) : unassigned.map(renderTaskCard)}
                        </div>
                    </div>

                    {/* Active */}
                    <div>
                        <SectionHeader title="Active" count={active.length} icon={RefreshCw} color="text-blue-700" />
                        <div className="space-y-3">
                            {active.length === 0 ? (
                                <div className="p-6 border-2 border-dashed rounded-xl text-center text-gray-400 text-sm bg-gray-50">No active tasks</div>
                            ) : active.map(renderTaskCard)}
                        </div>
                    </div>

                    {/* Issues */}
                    <div>
                        <SectionHeader title="Issues" count={issues.length} icon={AlertCircle} color="text-red-700" />
                        <div className="space-y-3">
                            {issues.length === 0 ? (
                                <div className="p-6 border-2 border-dashed rounded-xl text-center text-gray-400 text-sm bg-gray-50">No issues 🎉</div>
                            ) : issues.map(renderTaskCard)}
                        </div>
                    </div>

                    {/* Completed */}
                    <div>
                        <SectionHeader title="Completed" count={completed.length} icon={CheckCircle2} color="text-green-700" />
                        <div className="space-y-3">
                            {completed.length === 0 ? (
                                <div className="p-6 border-2 border-dashed rounded-xl text-center text-gray-400 text-sm bg-gray-50">None yet</div>
                            ) : completed.map(renderTaskCard)}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
