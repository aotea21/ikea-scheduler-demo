import { AssemblerStatus } from "@/lib/types";
import { FSMTransitionConfig } from "@/lib/fsm-config";
import { cn } from "@/lib/utils"; // Assuming utils exists, standard in shadcn/ui

// Simple Sheet implementation since we might not have a full Drawer component
// This overlays the screen on mobile and slides up
interface StatusBottomSheetProps {
    currentStatus: AssemblerStatus;
    transitions: FSMTransitionConfig[];
    onSelectTransition: (target: AssemblerStatus) => void;
    isOpen: boolean;
    onClose: () => void;
}

export function StatusBottomSheet({
    currentStatus,
    transitions,
    onSelectTransition,
    isOpen,
    onClose
}: StatusBottomSheetProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:hidden">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Sheet Content */}
            <div className="relative w-full bg-white dark:bg-zinc-900 rounded-t-xl p-6 shadow-xl animate-in slide-in-from-bottom duration-300">
                <div className="mb-4">
                    <div className="w-12 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-center mb-1">Update Status</h3>
                    <p className="text-sm text-zinc-500 text-center">
                        Current: <span className="font-medium text-foreground">{currentStatus}</span>
                    </p>
                </div>

                <div className="space-y-3">
                    {transitions.length > 0 ? (
                        transitions.map((t) => (
                            <button
                                key={t.targetStatus}
                                onClick={() => onSelectTransition(t.targetStatus)}
                                className={cn(
                                    "w-full p-4 rounded-lg font-medium text-left transition-colors flex items-center justify-between",
                                    t.variant === 'destructive'
                                        ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
                                        : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100"
                                )}
                            >
                                <span>{t.label}</span>
                                <span className="text-xs opacity-60 uppercase tracking-wider">{t.targetStatus.replace('_', ' ')}</span>
                            </button>
                        ))
                    ) : (
                        <div className="p-4 text-center text-zinc-500 italic">
                            No actions available
                        </div>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="w-full mt-4 p-3 text-center text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
