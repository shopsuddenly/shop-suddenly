"use client";

import { useState } from "react";
import { Order, CancellationReason } from "@/types/order";
import { OrderService } from "@/services/order.service";
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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const cancellationReasons: { value: CancellationReason; label: string }[] = [
    { value: 'changed_mind', label: 'Changed my mind' },
    { value: 'found_better_price', label: 'Found better price elsewhere' },
    { value: 'ordered_by_mistake', label: 'Ordered by mistake' },
    { value: 'incorrect_address', label: 'Incorrect delivery address' },
    { value: 'delivery_delay', label: 'Delivery taking too long' },
    { value: 'other', label: 'Other reason' },
];

interface CancelOrderDialogProps {
    order: Order;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCancelled: () => void;
}

export function CancelOrderDialog({ order, open, onOpenChange, onCancelled }: CancelOrderDialogProps) {
    const [selectedReason, setSelectedReason] = useState<CancellationReason>('changed_mind');
    const [customReason, setCustomReason] = useState('');
    const [cancelling, setCancelling] = useState(false);

    const handleCancel = async () => {
        setCancelling(true);
        try {
            await OrderService.cancelOrder(
                order.id,
                selectedReason,
                'user',
                selectedReason === 'other' ? customReason : undefined
            );
            toast.success('Order cancelled successfully');
            onCancelled();
            onOpenChange(false);
        } catch (error: any) {
            console.error('Failed to cancel order:', error);
            toast.error(error.message || 'Failed to cancel order');
        } finally {
            setCancelling(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to cancel this order? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-4 my-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Reason for cancellation
                        </label>
                        <select
                            value={selectedReason}
                            onChange={(e) => setSelectedReason(e.target.value as CancellationReason)}
                            className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
                            disabled={cancelling}
                        >
                            {cancellationReasons.map(reason => (
                                <option key={reason.value} value={reason.value}>
                                    {reason.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedReason === 'other' && (
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Please specify
                            </label>
                            <textarea
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm resize-none"
                                rows={3}
                                placeholder="Tell us why you're cancelling..."
                                disabled={cancelling}
                            />
                        </div>
                    )}

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            ⚠️ Your order will be cancelled and any payment will be refunded within 5-7 business days.
                        </p>
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={cancelling}>
                        Keep Order
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleCancel}
                        disabled={cancelling || (selectedReason === 'other' && !customReason.trim())}
                        className="bg-destructive hover:bg-destructive/90"
                    >
                        {cancelling ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Cancelling...
                            </>
                        ) : (
                            'Cancel Order'
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
