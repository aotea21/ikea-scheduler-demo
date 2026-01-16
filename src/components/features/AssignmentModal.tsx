"use client";

import { useStore } from "@/lib/store";
import { generateRecommendations } from "@/lib/scheduler";
// Custom Modal Overlay used instead of Radix Dialog to minimize dependencies
// I will create a custom simple Modal to strictly follow 'No extra deps' unless I add them.
// Or I can just inline the modal logic here for simplicity if I don't want to build a full Dialog primitive.
// Let's build a simple custom Overlay div for now.

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, User, Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function AssignmentModal() {
    const { tasks, orders, assemblers, selectedTaskId, selectTask, assignAssembler } = useStore();

    if (!selectedTaskId) return null;

    const task = tasks.find(t => t.id === selectedTaskId);
    if (!task || task.status !== 'OPEN') return null; // Only show for OPEN tasks? Or maybe show details for others. 
    // Requirement: "Assignment Recommendation Modal". Usually for assigning.

    const order = orders.find(o => o.id === task.orderId);
    if (!order) return null;

    const recommendations = generateRecommendations(task, assemblers, order.address);
    const topRecommendation = recommendations[0];

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-[#111111]">Assign Task #{order.id}</h2>
                        <p className="text-sm text-gray-500 mt-1">{order.items[0].name} • {order.address.address}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => selectTask(null)}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 bg-white">
                    <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-gray-500">Recommended Assemblers</h3>

                    <div className="space-y-3">
                        {recommendations.length === 0 && (
                            <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                                No qualified assemblers available nearby.
                            </div>
                        )}

                        {recommendations.map((rec, idx) => {
                            const isBest = idx === 0;
                            return (
                                <div
                                    key={rec.assembler.id}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-lg border hover:border-[#0058a3] transition-colors",
                                        isBest ? "border-[#fbd914] bg-yellow-50/10 shadow-sm" : "border-gray-200"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                            <User className="h-6 w-6 text-gray-500" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-gray-900">{rec.assembler.name}</h4>
                                                {isBest && <Badge variant="ikea" className="text-[10px]">Best Match</Badge>}
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                                                <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-current text-yellow-400" /> {rec.assembler.rating}</span>
                                                <span>• Score: {rec.score}</span>
                                                <div className="flex gap-1">
                                                    {rec.matchReasons.map(r => (
                                                        <span key={r} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{r}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        variant={isBest ? "default" : "outline"}
                                        className={isBest ? "bg-[#0058a3] hover:bg-[#004f93]" : ""}
                                        onClick={() => assignAssembler(task.id, rec.assembler.id)}
                                    >
                                        Assign
                                    </Button>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-8 p-4 bg-gray-50 rounded text-xs text-gray-500">
                        <span className="font-semibold">Logic:</span> Recommendations are based on Distance (30%), Skill Match (50%), and Rating (20%).
                    </div>
                </div>

                <div className="p-4 border-t flex justify-end gap-2 bg-gray-50">
                    <Button variant="outline" onClick={() => selectTask(null)}>Cancel</Button>
                </div>
            </div>
        </div>
    );
}
