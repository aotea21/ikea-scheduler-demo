"use client";

import { DashboardLayout } from "@/components/features/DashboardLayout";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, AlertCircle, Truck } from "lucide-react";
import { JobEventType } from "@/lib/types";

// Helper to get icon for event type
const getEventIcon = (type: JobEventType) => {
    switch (type) {
        case 'job_created': return <Circle className="w-5 h-5 text-gray-400" />;
        case 'worker_assigned': return <CheckCircle2 className="w-5 h-5 text-blue-500" />;
        case 'worker_enroute': return <Truck className="w-5 h-5 text-blue-600" />;
        case 'job_started': return <Clock className="w-5 h-5 text-orange-500" />;
        case 'job_completed': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
        case 'issue_reported': return <AlertCircle className="w-5 h-5 text-red-500" />;
        default: return <Circle className="w-5 h-5 text-gray-300" />;
    }
};

const getEventLabel = (type: JobEventType) => {
    switch (type) {
        case 'job_created': return 'Job Created';
        case 'worker_assigned': return 'Worker Assigned';
        case 'worker_enroute': return 'En Route';
        case 'job_started': return 'Job Started';
        case 'job_completed': return 'Completed';
        case 'issue_reported': return 'Issue Reported';
        default: return type;
    }
};

export default function StatusPage() {
    const { tasks, orders } = useStore();

    return (
        <DashboardLayout>
            <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
                <h1 className="text-2xl font-bold mb-6 text-[#111111]">Assembly Status</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tasks.map(task => {
                        const order = orders.find(o => o.id === task.orderId);
                        // Sort history by timestamp descending (newest first)
                        const history = [...(task.history || [])].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                        const latestEvent = history[0];

                        return (
                            <Card key={task.id} className="bg-white overflow-hidden flex flex-col h-full border-t-4 data-[status=COMPLETED]:border-t-green-500 data-[status=ISSUE]:border-t-red-500 hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3 bg-gray-50 border-b">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg">Order #{task.orderId.toUpperCase()}</CardTitle>
                                            <p className="text-sm text-gray-500 mt-1">{order?.customerName}</p>
                                        </div>
                                        <Badge variant={latestEvent?.type === 'issue_reported' ? 'destructive' : 'secondary'}>
                                            {task.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0 flex-1 relative">
                                    {/* Timeline */}
                                    <div className="p-6 space-y-6">
                                        {history.length === 0 ? (
                                            <p className="text-sm text-gray-400 italic">No history available</p>
                                        ) : (
                                            history.map((event, idx) => (
                                                <div key={idx} className="flex gap-4 relative">
                                                    {/* Connector Line */}
                                                    {idx !== history.length - 1 && (
                                                        <div className="absolute left-[9px] top-6 bottom-[-24px] w-[2px] bg-gray-100" />
                                                    )}

                                                    <div className="flex-shrink-0 z-10 bg-white">
                                                        {getEventIcon(event.type)}
                                                    </div>
                                                    <div className="flex-1 pt-[1px]">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <h4 className="text-sm font-semibold text-gray-900">{getEventLabel(event.type)}</h4>
                                                            <span className="text-xs text-gray-400">
                                                                {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-600">{event.description}</p>
                                                        <p className="text-[10px] text-gray-400 mt-1">
                                                            {new Date(event.timestamp).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </DashboardLayout>
    );
}
