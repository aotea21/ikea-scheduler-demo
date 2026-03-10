import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FSMTransitionConfig } from "@/lib/fsm-config";
import { buttonVariants } from "@/components/ui/button";

interface FSMConfirmDialogProps {
    config: FSMTransitionConfig | null;
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    isProcessing?: boolean;
}

export function FSMConfirmDialog({
    config,
    open,
    onConfirm,
    onCancel,
    isProcessing = false
}: FSMConfirmDialogProps) {
    if (!config) return null;

    return (
        <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{config.confirmTitle}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {config.confirmMessage}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isProcessing} onClick={onCancel}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        disabled={isProcessing}
                        className={buttonVariants({ variant: config.variant || 'default' })}
                    >
                        {isProcessing ? 'Processing...' : config.confirmButtonText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
