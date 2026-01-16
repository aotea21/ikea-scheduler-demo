"use client";

import { useStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, MapPin, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export function TaskList() {
    const { tasks, orders, selectTask, selectedTaskId } = useStore();

    // Helper to get Order details for a task
    const getOrder = (orderId: string) => orders.find((o) => o.id === orderId);

    return (
        <div className="flex flex-col h-full p-4 space-y-4 max-w-md w-full bg-white border-r">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#111111]">Tasks</h2>
                <Badge variant="secondary">{tasks.length} Total</Badge>
            </div>

            <div className="space-y-3 overflow-y-auto pr-2">
                {tasks.map((task) => {
                    const order = getOrder(task.orderId);
                    if (!order) return null;

                    const isSelected = selectedTaskId === task.id;

                    return (
                        <Card
                            key={task.id}
                            className={cn(
                                "cursor-pointer transition-all hover:shadow-md border-transparent",
                                isSelected ? "ring-2 ring-[#0058a3] bg-blue-50/50" : "bg-white border-gray-100 shadow-sm"
                            )}
                            onClick={() => selectTask(task.id)}
                        >
                            <CardContent className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-sm">#{order.id.toUpperCase()}</span>
                                            <Badge variant={task.status === 'OPEN' ? 'ikea' : 'outline'}>
                                                {task.status}
                                            </Badge>
                                        </div>
                                        <h4 className="font-medium text-base">{order.items[0].name}</h4>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] uppercase">
                                        {task.requiredSkills}
                                    </Badge>
                                </div>

                                <div className="space-y-1 text-xs text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3 h-3" />
                                        <span className="truncate max-w-[200px]">{order.address.address}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3 h-3" />
                                        <span>{task.estimatedDurationMinutes} mins</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Package className="w-3 h-3" />
                                        <span>{order.items.length} items</span>
                                    </div>
                                </div>

                                {task.status === 'OPEN' && (
                                    <Button
                                        size="sm"
                                        className="w-full mt-2 bg-[#0058a3] hover:bg-[#004f93]"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            selectTask(task.id);
                                        }}
                                    >
                                        Find Assembler
                                    </Button>
                                )}

                                {task.status === 'ASSIGNED' && (
                                    <div className="mt-2 text-xs font-medium text-green-600 bg-green-50 p-2 rounded flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        Assigned to {task.assignedAssemblerId}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
