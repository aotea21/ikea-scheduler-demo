"use client";

import { DashboardLayout } from "@/components/features/DashboardLayout";
import { useStore } from "@/lib/store";
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
} from "lucide-react";
import { JobEventType, TaskStatus } from "@/lib/types";
import {
    ASSEMBLER_TASK_ACTIONS,
    TASK_STATUS_LABELS,
    TASK_STATUS_COLORS,
    TaskFSMAction,
} from "@/lib/task-fsm-config";

// Helper: icon for event type
const getEventIcon = (type: JobEventType) => {
    switch (type) {
        case 'ASSIGNED':      return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
        case 'CONFIRMED':     return <CheckCircle2 className="w-4 h-4 text-indigo-500" />;
        case 'EN_ROUTE':      return <Truck className="w-4 h-4 text-orange-500" />;
        case 'ARRIVED':       return <MapPin className="w-4 h-4 text-yellow-500" />;
        case 'STARTED':       return <Wrench className="w-4 h-4 text-purple-500" />;
        case 'COMPLETED':     return <CheckCircle2 className="w-4 h-4 text-green-500" />;
        case 'VERIFIED':      return <CheckCircle2 className="w-4 h-4 text-green-700" />;
        case 'ISSUE_REPORTED':return <AlertCircle className="w-4 h-4 text-red-500" />;
        case 'CANCELLED':     return <Flag className="w-4 h-4 text-gray-400" />;
        case 'STATUS_CHANGED':return <RefreshCw className="w-4 h-4 text-gray-400" />;
        default:              return <Circle className="w-4 h-4 text-gray-300" />;
    }
};

const getEventLabel = (type: JobEventType): string => {
    const labels: Record<JobEventType, string> = {
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
    return labels[type] ?? type.replace(/_/g, ' ');
};

function TaskStatusBadge({ status }: { status: TaskStatus }) {
    const colors = TASK_STATUS_COLORS[status] ?? { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${colors.dot}`} />
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
                    className="flex-1 h-10 text-sm font-semibold"
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

export default function StatusPage() {
    const { tasks, orders, assemblers, transitionTaskStatus } = useStore();

    // In a real app, get the logged-in assembler ID from auth session
    // For demo: use the first assembler found
    const demoAssembler = assemblers[0];
    const ASSEMBLER_ID = demoAssembler?.id ?? 'demo-assembler';

    return (
        <DashboardLayout>
            <div className="p-6 md:p-8 max-w-3xl mx-auto w-full">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-[#111111]">My Jobs</h1>
                    {demoAssembler && (
                        <p className="text-sm text-gray-500 mt-1">
                            Logged in as: <span className="font-medium text-gray-700">{demoAssembler.name}</span>
                        </p>
                    )}
                </div>

                <div className="space-y-6">
                    {tasks.length === 0 && (
                        <div className="p-12 border-2 border-dashed rounded-xl text-center text-gray-400">
                            <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">No tasks assigned yet.</p>
                        </div>
                    )}

                    {tasks.map(task => {
                        const order = orders.find(o => o.id === task.orderId);
                        const actions = ASSEMBLER_TASK_ACTIONS[task.status] ?? [];
                        const history = [...(task.history ?? [])].sort(
                            (a, b) => new Date(b.eventTime).getTime() - new Date(a.eventTime).getTime()
                        );

                        return (
                            <Card
                                key={task.id}
                                className={`overflow-hidden border-t-4 ${
                                    task.status === 'ISSUE' ? 'border-t-red-500' :
                                    task.status === 'COMPLETED' || task.status === 'VERIFIED' ? 'border-t-green-500' :
                                    task.status === 'EN_ROUTE' ? 'border-t-orange-400' :
                                    'border-t-[#0058a3]'
                                }`}
                            >
                                {/* Card Header */}
                                <CardHeader className="pb-3 bg-gray-50 border-b">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-base">
                                                Order #{task.orderId.slice(0, 8).toUpperCase()}
                                            </CardTitle>
                                            {order && (
                                                <p className="text-sm text-gray-500 mt-0.5">{order.customerName}</p>
                                            )}
                                            {order?.address?.address && (
                                                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {order.address.address}
                                                </p>
                                            )}
                                        </div>
                                        <TaskStatusBadge status={task.status} />
                                    </div>
                                </CardHeader>

                                <CardContent className="p-4 space-y-4">
                                    {/* Task Info */}
                                    <div className="flex gap-4 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {task.estimatedDurationMinutes} min
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Wrench className="w-3 h-3" />
                                            {task.skillRequired}
                                        </span>
                                    </div>

                                    {/* Assembler Action Buttons */}
                                    {actions.length > 0 && (
                                        <div className="flex gap-2 flex-wrap">
                                            {actions.map(action => (
                                                <AssemblerActionButton
                                                    key={action.targetStatus}
                                                    action={action}
                                                    onClick={() =>
                                                        transitionTaskStatus(
                                                            task.id,
                                                            action.targetStatus,
                                                            'assembler',
                                                            ASSEMBLER_ID
                                                        )
                                                    }
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Event Timeline */}
                                    {history.length > 0 && (
                                        <div className="border-t pt-3">
                                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Timeline</p>
                                            <div className="space-y-3">
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
                                                                <h4 className="text-xs font-semibold text-gray-800">{getEventLabel(event.type)}</h4>
                                                                <span className="text-[10px] text-gray-400">
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
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </DashboardLayout>
    );
}
