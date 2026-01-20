"use client";

import { DashboardLayout } from "@/components/features/DashboardLayout";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User } from "lucide-react";

export default function SchedulePage() {
    const { tasks, assemblers } = useStore();

    // Simple grouping by status for now, as a starting point
    const assignedTasks = tasks.filter(t => t.status === 'ASSIGNED');
    const openTasks = tasks.filter(t => t.status === 'OPEN');

    return (
        <DashboardLayout>
            <div className="p-6 md:p-8 max-w-5xl mx-auto w-full h-full flex flex-col">
                <h1 className="text-2xl font-bold mb-6 text-[#111111]">Weekly Schedule</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Assigned Tasks Column */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-[#0058a3]" />
                                Scheduled Assignments
                            </h2>
                            <Badge variant="secondary">{assignedTasks.length}</Badge>
                        </div>

                        {assignedTasks.length === 0 ? (
                            <div className="p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                                <span className="text-sm">No tasks scheduled yet.</span>
                            </div>
                        ) : (
                            assignedTasks.map(task => {
                                const assembler = assemblers.find(a => a.id === task.assignedAssemblerId);
                                return (
                                    <Card key={task.id} className="border-l-4 border-l-[#0058a3]">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base font-medium flex justify-between">
                                                <span>Order #{task.orderId.toUpperCase()}</span>
                                                <Badge className="bg-[#0058a3] hover:bg-[#004885]">
                                                    {task.scheduledTime ? new Date(task.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                                                </Badge>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm space-y-2">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <User className="w-4 h-4" />
                                                <span>{assembler?.name || 'Unknown Assembler'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Clock className="w-4 h-4" />
                                                <span>{task.estimatedDurationMinutes} mins est.</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        )}
                    </div>

                    {/* Open Tasks Column */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-orange-500" />
                                Pending Allocation
                            </h2>
                            <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">{openTasks.length}</Badge>
                        </div>

                        {openTasks.length === 0 ? (
                            <div className="p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                                <span className="text-sm">All tasks assigned!</span>
                            </div>
                        ) : (
                            openTasks.map(task => (
                                <Card key={task.id} className="border-l-4 border-l-orange-400 opacity-80 hover:opacity-100 transition-opacity">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base font-medium flex justify-between">
                                            <span>Order #{task.orderId.toUpperCase()}</span>
                                            <Badge variant="outline">Unscheduled</Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm space-y-2">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Clock className="w-4 h-4" />
                                            <span>{task.estimatedDurationMinutes} mins est.</span>
                                        </div>
                                        <div className="text-xs text-orange-600 font-medium">
                                            Requires {task.requiredSkills} skill level
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
