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
                                // Find assemblers
                                const assignedAssemblers = assemblers.filter(a => task.assignedAssemblerIds.includes(a.id));

                                return (
                                    <div key={task.id} className="mb-4">
                                        <Card className="border-l-4 border-l-[#0058a3]">
                                            <CardHeader className="pb-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <CardTitle className="text-sm font-medium">Task #{task.orderId}</CardTitle>
                                                        <CardDescription>{task.skillRequired} • {task.estimatedDurationMinutes} min</CardDescription>
                                                    </div>
                                                    <Badge variant={task.status === 'IN_PROGRESS' ? 'default' : 'secondary'}>
                                                        {task.status}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-xs text-gray-500 mb-2">
                                                    {task.scheduledStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                                    {task.scheduledEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm font-medium">
                                                    <User className="h-4 w-4 text-gray-400" />
                                                    {assignedAssemblers.length > 0 ? (
                                                        <span>{assignedAssemblers.map(a => a.name).join(', ')}</span>
                                                    ) : (
                                                        <span className="text-red-500">Unassigned (Error)</span>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
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
