"use client";

import { useState, useEffect } from "react";
import { Order } from "@/types/order";
import { InvoiceService } from "@/services/invoice.service";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Download, Printer, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface InvoicePreviewDialogProps {
    order: Order | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function InvoicePreviewDialog({
    order,
    open,
    onOpenChange,
}: InvoicePreviewDialogProps) {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && order) {
            generatePreview();
        }

        return () => {
            // Cleanup blob URL on unmount or close
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
                setPdfUrl(null);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, order]);

    const generatePreview = async () => {
        if (!order) return;
        setLoading(true);
        try {
            const doc = await InvoiceService.generateInvoicePDF(order);
            const blob = doc.output("blob");
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
        } catch (error) {
            console.error("Error generating invoice preview:", error);
            toast.error("Failed to generate invoice preview");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!order) return;
        try {
            await InvoiceService.downloadInvoice(order);
            toast.success("Invoice downloaded");
        } catch {
            toast.error("Failed to download invoice");
        }
    };

    const handlePrint = () => {
        if (!pdfUrl) return;
        const printWindow = window.open(pdfUrl, "_blank");
        if (printWindow) {
            printWindow.addEventListener("load", () => {
                printWindow.print();
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0">
                {/* Header */}
                <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
                    <div className="flex items-center justify-between pr-8">
                        <div>
                            <DialogTitle className="text-lg font-serif">
                                Invoice Preview
                            </DialogTitle>
                            <DialogDescription className="text-xs mt-0.5">
                                {order
                                    ? `Order ${order.id} • ${new Date(
                                          order.createdAt
                                      ).toLocaleDateString()}`
                                    : "Loading..."}
                            </DialogDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePrint}
                                disabled={!pdfUrl || loading}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm font-medium disabled:opacity-50"
                            >
                                <Printer className="w-4 h-4" />
                                Print
                            </button>
                            <button
                                onClick={handleDownload}
                                disabled={loading}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50"
                            >
                                <Download className="w-4 h-4" />
                                Download
                            </button>
                        </div>
                    </div>
                </DialogHeader>

                {/* PDF Preview Area */}
                <div className="flex-1 bg-muted/30 overflow-hidden">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">
                                Generating invoice...
                            </p>
                        </div>
                    ) : pdfUrl ? (
                        <iframe
                            src={pdfUrl}
                            className="w-full h-full border-0"
                            title="Invoice Preview"
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-sm text-muted-foreground">
                                No preview available
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
