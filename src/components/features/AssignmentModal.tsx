"use client";
import { useState, useEffect } from 'react';

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
    const [selectedAssemblerIds, setSelectedAssemblerIds] = useState<string[]>([]);
    const [showAll, setShowAll] = useState(false);

    // Reset selection when modal opens
    useEffect(() => {
        if (selectedTaskId) {
            const currentTask = tasks.find(t => t.id === selectedTaskId);
            if (currentTask && currentTask.status === 'ASSIGNED') {
                setSelectedAssemblerIds(currentTask.assignedAssemblerIds || []); // eslint-disable-line react-hooks/set-state-in-effect
            } else {
                setSelectedAssemblerIds([]);
            }
            setShowAll(false);
        }
    }, [selectedTaskId, tasks]);

    if (!selectedTaskId) return null;

    const task = tasks.find(t => t.id === selectedTaskId);
    if (!task || (task.status !== 'OPEN' && task.status !== 'ASSIGNED')) return null;

    const order = orders.find(o => o.id === task.orderId);
    if (!order) return null;

    const isReassignment = task.status === 'ASSIGNED';

    // Debug Logging
    console.log('--- AssignmentModal Debug ---');
    console.log('Task:', task);
    console.log('Assemblers (Total):', assemblers.length);
    console.log('Assembler[0] Sample:', assemblers[0]);

    const recommendations = generateRecommendations(task, assemblers, order.address);
    console.log('Recommendations:', recommendations);

    // Get currently assigned assemblers (for update mode)
    const currentlyAssignedAssemblers = isReassignment
        ? assemblers.filter(a => task.assignedAssemblerIds?.includes(a.id))
        : [];

    // Logic: Show all assemblers if no recommendations, otherwise show top 3 by default
    const displayAssemblers = recommendations.length === 0 ? assemblers : recommendations;
    const visibleAssemblers = showAll ? displayAssemblers : displayAssemblers.slice(0, 3);
    const hasMore = displayAssemblers.length > 3;

    const toggleAssembler = (id: string) => {
        setSelectedAssemblerIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const removeAssembler = (id: string) => {
        setSelectedAssemblerIds(prev => prev.filter(x => x !== id));
    };

    const handleConfirm = () => {
        if (selectedAssemblerIds.length > 0) {
            assignAssembler(task.id, selectedAssemblerIds);
        }
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-[#111111]">
                            {isReassignment ? 'Update Assemblers' : 'Select Assemblers'} ({selectedAssemblerIds.length})
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">{order.items[0].name} • {order.address.address}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => selectTask(null)}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 bg-white space-y-6">

                    {/* Currently Assigned Assemblers Section - Only show in update mode */}
                    {isReassignment && currentlyAssignedAssemblers.length > 0 && (
                        <div>
                            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-gray-500">
                                Currently Assigned ({currentlyAssignedAssemblers.length})
                            </h3>
                            <div className="space-y-3">
                                {currentlyAssignedAssemblers.map((assembler) => {
                                    const isStillSelected = selectedAssemblerIds.includes(assembler.id);

                                    return (
                                        <div
                                            key={assembler.id}
                                            className={cn(
                                                "flex items-center justify-between p-4 rounded-lg border transition-all",
                                                isStillSelected
                                                    ? "border-green-500 bg-green-50"
                                                    : "border-gray-300 bg-gray-50"
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <User className="h-6 w-6 text-gray-500" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-gray-900">{assembler.name}</h4>
                                                        <Badge variant="outline" className="text-[10px]">Assigned</Badge>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                                                        <span className="flex items-center gap-1">
                                                            <Star className="h-3 w-3 fill-current text-yellow-400" /> {assembler.rating}
                                                        </span>
                                                        <span>• {assembler.skills.join(', ')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {isStillSelected ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeAssembler(assembler.id)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                                                >
                                                    Remove
                                                </Button>
                                            ) : (
                                                <Badge variant="outline" className="text-red-600">Removed</Badge>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Recommended/Available Assemblers Section */}
                    <div>
                        <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-gray-500">
                            {recommendations.length === 0 ? 'All Assemblers' : 'Recommended Assemblers'}
                        </h3>

                        <div className="space-y-3">
                            {displayAssemblers.length === 0 && (
                                <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                                    No assemblers available.
                                </div>
                            )}

                            {visibleAssemblers.map((item, idx) => {
                                // Handle both recommendation objects and direct assembler objects
                                const assembler = 'assembler' in item ? item.assembler : item;
                                const score = 'score' in item ? item.score : null;
                                const matchReasons = 'matchReasons' in item ? item.matchReasons : [];

                                const isTopMatch = recommendations.length > 0 && idx < 3;
                                const isBest = recommendations.length > 0 && idx === 0;
                                const isSelected = selectedAssemblerIds.includes(assembler.id);
                                const isCurrentlyAssigned = currentlyAssignedAssemblers.some(a => a.id === assembler.id);

                                // Skip if already shown in "Currently Assigned" section
                                if (isCurrentlyAssigned) return null;

                                return (
                                    <div
                                        key={assembler.id}
                                        onClick={() => toggleAssembler(assembler.id)}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all",
                                            isSelected
                                                ? "border-[#0058a3] bg-blue-50 ring-1 ring-[#0058a3]"
                                                : isTopMatch
                                                    ? "border-[#fbd914] bg-yellow-50/10"
                                                    : "border-gray-200 hover:border-gray-300"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">

                                            <div className={cn(
                                                "h-6 w-6 rounded border flex items-center justify-center transition-colors",
                                                isSelected ? "bg-[#0058a3] border-[#0058a3]" : "border-gray-300 bg-white"
                                            )}>
                                                {isSelected && <Check className="h-4 w-4 text-white" />}
                                            </div>

                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center relative">
                                                <User className="h-6 w-6 text-gray-500" />
                                                {isTopMatch && (
                                                    <div className="absolute -top-1 -right-1 bg-[#0058a3] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                                        {idx + 1}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-gray-900">{assembler.name}</h4>
                                                    {isBest && <Badge variant="ikea" className="text-[10px]">Best Match</Badge>}
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Star className="h-3 w-3 fill-current text-yellow-400" /> {assembler.rating}
                                                    </span>
                                                    {score !== null && <span>• Score: {score}</span>}
                                                    <div className="flex gap-1">
                                                        {matchReasons.map(r => (
                                                            <span key={r} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{r}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {hasMore && !showAll && (
                            <div className="mt-4 text-center">
                                <Button variant="outline" size="sm" onClick={() => setShowAll(true)} className="w-full border-dashed text-gray-500">
                                    Show {displayAssemblers.length - 3} More {recommendations.length === 0 ? 'Assemblers' : 'Candidates'}
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-gray-50 rounded text-xs text-gray-500">
                        <span className="font-semibold">Note:</span> You can select multiple assemblers for large jobs.
                    </div>
                </div>

                <div className="p-4 border-t flex justify-end gap-2 bg-gray-50">
                    <Button variant="outline" onClick={() => selectTask(null)}>Cancel</Button>
                    <Button
                        disabled={selectedAssemblerIds.length === 0}
                        onClick={handleConfirm}
                        className={cn("min-w-[120px]", selectedAssemblerIds.length > 0 ? "bg-[#0058a3] hover:bg-[#004f93]" : "")}
                    >
                        Assign {selectedAssemblerIds.length > 0 ? `(${selectedAssemblerIds.length})` : ''}
                    </Button>
                </div>
            </div>
        </div>
    );
}
