"use client";

import { useState } from "react";
import { X, Loader2, AlertTriangle } from "lucide-react";
import { ReturnReason } from "@/types/order";
import { OrderService } from "@/services/order.service";
import { toast } from "sonner";

interface ReturnRequestModalProps {
    orderId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const returnReasons: { value: ReturnReason; label: string }[] = [
    { value: "defective", label: "Product is defective" },
    { value: "wrong_item", label: "Wrong item received" },
    { value: "not_as_described", label: "Not as described" },
    { value: "size_issue", label: "Size doesn't fit" },
    { value: "quality_issue", label: "Quality not as expected" },
    { value: "damaged_in_transit", label: "Damaged during shipping" },
    { value: "other", label: "Other reason" }
];

export function ReturnRequestModal({ orderId, isOpen, onClose, onSuccess }: ReturnRequestModalProps) {
    const [reason, setReason] = useState<ReturnReason | "">("");
    const [details, setDetails] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!reason) {
            toast.error("Please select a reason for return");
            return;
        }

        setLoading(true);
        try {
            await OrderService.requestReturn(orderId, reason, details);
            toast.success("Return request submitted successfully");
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to submit return request");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h2 className="font-serif text-xl">Request Return</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-muted rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {/* Warning */}
                    <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-200">
                            Return requests are reviewed by our team. Once approved, you'll receive instructions for returning the item.
                        </p>
                    </div>

                    {/* Reason Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Reason for Return <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value as ReturnReason)}
                            className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                        >
                            <option value="">Select a reason...</option>
                            {returnReasons.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Additional Details */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Additional Details (Optional)
                        </label>
                        <textarea
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="Please provide more details about the issue..."
                            className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm h-24 resize-none focus:outline-none focus:border-primary"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-4 border-t border-border">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!reason || loading}
                        className="flex-1 btn-luxury disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                                Submitting...
                            </>
                        ) : (
                            "Submit Request"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
