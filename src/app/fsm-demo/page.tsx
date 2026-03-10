'use client';

import { useState } from 'react';
import { useAssemblerFSM } from '@/hooks/useAssemblerFSM';
import { FSMConfirmDialog } from '@/components/fsm/FSMConfirmDialog';
import { StatusBottomSheet } from '@/components/fsm/StatusBottomSheet';
import { buttonVariants } from '@/components/ui/button';
import { AssemblerStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function FSMDemoPage() {
    const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

    // Use our new hook
    const {
        currentStatus,
        validTransitions,
        pendingTransition,
        initiateTransition,
        confirmTransition,
        cancelTransition
    } = useAssemblerFSM('AVAILABLE');

    const handleDrop = (e: React.DragEvent, targetStatus: AssemblerStatus) => {
        e.preventDefault();
        initiateTransition(targetStatus);
    };

    return (
        <div className="p-8 max-w-md mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold mb-2">FSM Logic Demo</h1>
                <p className="text-zinc-500">Current Status:</p>
                <div className="text-3xl font-mono font-bold text-blue-600 mt-1">
                    {currentStatus}
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Available Actions (Desktop)</h2>
                <div className="flex flex-col gap-2">
                    {validTransitions.map(t => (
                        <button
                            key={t.targetStatus}
                            onClick={() => initiateTransition(t.targetStatus)}
                            className={buttonVariants({ variant: t.variant })}
                        >
                            {t.label}
                        </button>
                    ))}
                    {validTransitions.length === 0 && (
                        <p className="text-sm text-zinc-400 italic">No actions available from this state.</p>
                    )}
                </div>
            </div>

            <div className="space-y-4 pt-8 border-t">
                <h2 className="text-lg font-semibold">Drag & Drop Simulation</h2>
                <div className="flex flex-col gap-4">
                    <div
                        draggable
                        className="p-4 bg-zinc-100 border rounded cursor-move select-none active:cursor-grabbing hover:shadow-md transition-shadow"
                        onDragStart={(e) => e.dataTransfer.setData('text/plain', 'assembler')}
                    >
                        Drag this &quot;Assembler&quot; box...
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {validTransitions.map(t => (
                            <div
                                key={t.targetStatus}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => handleDrop(e, t.targetStatus)}
                                className={cn(
                                    "p-4 border-2 border-dashed rounded flex items-center justify-center bg-zinc-50 min-w-[120px] text-center text-sm font-medium text-zinc-600 transition-colors",
                                    "hover:border-blue-500 hover:bg-blue-50"
                                )}
                            >
                                Drop to {t.label}
                            </div>
                        ))}
                        {validTransitions.length === 0 && (
                            <div className="p-4 border-2 border-dashed border-zinc-200 rounded w-full text-center text-zinc-400 text-sm">
                                No drop targets available
                            </div>
                        )}
                    </div>
                </div>
                <p className="text-xs text-zinc-500">
                    Try dragging the box onto one of the target zones to trigger a status change confirmation.
                </p>
            </div>

            <div className="pt-8 border-t">
                <h2 className="text-lg font-semibold mb-4">Mobile Experience</h2>
                <button
                    onClick={() => setIsMobileSheetOpen(true)}
                    className={buttonVariants({ variant: 'outline', className: 'w-full' })}
                >
                    Open Status Sheet
                </button>
            </div>

            {/* Components integrated */}
            <FSMConfirmDialog
                open={!!pendingTransition}
                config={pendingTransition}
                onConfirm={confirmTransition}
                onCancel={cancelTransition}
            />

            <StatusBottomSheet
                isOpen={isMobileSheetOpen}
                onClose={() => setIsMobileSheetOpen(false)}
                currentStatus={currentStatus}
                transitions={validTransitions}
                onSelectTransition={(status) => {
                    setIsMobileSheetOpen(false);
                    initiateTransition(status);
                }}
            />
        </div>
    );
}
