"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { OrderService } from "@/services/order.service";
import { InvoiceService } from "@/services/invoice.service";
import { Order } from "@/types/order";
import { formatPrice } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { CancelOrderDialog } from "@/components/orders/CancelOrderDialog";
import { ReturnRequestModal } from "@/components/orders/ReturnRequestModal";
import { Loader2, ArrowLeft, Download, XCircle, Package2, Star, RotateCcw } from "lucide-react";
import { ReviewDialog } from "@/components/product/reviews/ReviewDialog";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const orderId = params.id as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [returnModalOpen, setReturnModalOpen] = useState(false);
    const [canCancel, setCanCancel] = useState(false);
    const [canReturn, setCanReturn] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login?redirect=/account/orders');
            return;
        }

        if (user && orderId) {
            fetchOrder();
        }
    }, [user, authLoading, orderId, router]);

    const fetchOrder = async () => {
        try {
            console.log('📄 [ORDER DETAIL] Fetching order:', orderId);
            const orderData = await OrderService.getOrderById(orderId);

            if (!orderData) {
                console.log('⚠️ [ORDER DETAIL] Order not found');
                router.push('/account/orders');
                return;
            }

            // Verify ownership
            if (orderData.userId !== user?.uid) {
                console.log('❌ [ORDER DETAIL] Unauthorized access attempt');
                router.push('/account/orders');
                return;
            }

            setOrder(orderData);
            setCanCancel(OrderService.canCancelOrder(orderData));
            setCanReturn(OrderService.isReturnWindowOpen(orderData));
            console.log('✅ [ORDER DETAIL] Order loaded:', orderData.id);
        } catch (error) {
            console.error('❌ [ORDER DETAIL] Error fetching order:', error);
            router.push('/account/orders');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!order) {
        return null;
    }

    const handleDownloadInvoice = () => {
        try {
            InvoiceService.downloadInvoice(order);
            toast.success('Invoice downloaded');
        } catch (error) {
            console.error('Failed to download invoice:', error);
            toast.error('Failed to download invoice');
        }
    };

    const handleOrderCancelled = () => {
        // Refresh order data
        fetchOrder();
    };

    return (
        <section className="pt-32 pb-16 min-h-screen bg-background">
            <div className="luxury-container max-w-6xl">
                {/* Back Button */}
                <Link
                    href="/account/orders"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Orders
                </Link>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-12">
                    <div>
                        <h1 className="font-serif text-3xl md:text-4xl mb-2">Order Details</h1>
                        <p className="font-mono text-sm text-muted-foreground">{order.id}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <OrderStatusBadge status={order.orderStatus} />
                        {/* Invoice - only after delivered */}
                        {['delivered', 'return_requested', 'return_approved', 'return_rejected', 'refunded', 'replaced'].includes(order.orderStatus) && (
                            <button
                                onClick={handleDownloadInvoice}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm font-medium"
                            >
                                <Download className="w-4 h-4" />
                                Download Invoice
                            </button>
                        )}
                        {/* Return button - only if return window is open */}
                        {canReturn && !order.returnRequest && (
                            <button
                                onClick={() => setReturnModalOpen(true)}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors text-sm font-medium"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Request Return
                            </button>
                        )}
                        {canCancel && order.orderStatus !== 'cancelled' && (
                            <button
                                onClick={() => setCancelDialogOpen(true)}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors text-sm font-medium"
                            >
                                <XCircle className="w-4 h-4" />
                                Cancel Order
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Order Items & Address */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Order Items */}
                        <div className="bg-card border border-border rounded-lg p-6">
                            <h2 className="font-serif text-xl mb-6">Order Items</h2>
                            <div className="space-y-4">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                                        <div className="w-20 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                                            {item.image && (
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    width={80}
                                                    height={80}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium mb-1">{item.name}</h3>
                                            {item.size && (
                                                <p className="text-sm text-muted-foreground">Size: {item.size}</p>
                                            )}
                                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="text-right space-y-2">
                                            <div>
                                                <p className="font-medium">{formatPrice(item.unitPrice)}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Total: {formatPrice(item.unitPrice * item.quantity)}
                                                </p>
                                            </div>
                                            {order.orderStatus === 'delivered' && user && (
                                                <ReviewDialog
                                                    productId={item.productId}
                                                    trigger={
                                                        <button className="text-xs flex items-center gap-1 text-primary hover:underline ml-auto">
                                                            <Star size={12} />
                                                            Write Review
                                                        </button>
                                                    }
                                                    userId={user.uid}
                                                    userName={user.displayName || "Customer"}
                                                    productName={item.name}
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Delivery Address */}
                        <div className="bg-card border border-border rounded-lg p-6">
                            <h2 className="font-serif text-xl mb-4">Delivery Address</h2>
                            <div className="text-sm space-y-1">
                                <p className="font-medium">{order.addressSnapshot.name}</p>
                                <p className="text-muted-foreground">{order.addressSnapshot.addressLine1}</p>
                                {order.addressSnapshot.addressLine2 && (
                                    <p className="text-muted-foreground">{order.addressSnapshot.addressLine2}</p>
                                )}
                                <p className="text-muted-foreground">
                                    {order.addressSnapshot.city}, {order.addressSnapshot.state} {order.addressSnapshot.postalCode}
                                </p>
                                <p className="text-muted-foreground">{order.addressSnapshot.country}</p>
                                <p className="text-muted-foreground mt-2">Phone: {order.addressSnapshot.phone}</p>
                            </div>
                        </div>

                        {/* Cancellation Info */}
                        {order.orderStatus === 'cancelled' && order.cancellationReason && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                                <h2 className="font-serif text-xl mb-4 text-red-800 dark:text-red-200">Order Cancelled</h2>
                                <div className="text-sm space-y-2">
                                    <div>
                                        <p className="text-red-600 dark:text-red-300 font-medium mb-1">Reason:</p>
                                        <p className="text-red-700 dark:text-red-200">
                                            {order.cancellationReason.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </p>
                                    </div>
                                    {order.cancelledAt && (
                                        <div>
                                            <p className="text-red-600 dark:text-red-300 font-medium mb-1">Cancelled on:</p>
                                            <p className="text-red-700 dark:text-red-200">
                                                {new Date(order.cancelledAt).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                    <p className="text-red-600 dark:text-red-300 mt-3">
                                        Refund will be processed within 5-7 business days.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Return Request Info */}
                        {order.returnRequest && (
                            <div className={`border rounded-lg p-6 ${order.returnRequest.status === 'pending'
                                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                                    : order.returnRequest.status === 'approved'
                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                }`}>
                                <h2 className={`font-serif text-xl mb-4 ${order.returnRequest.status === 'pending'
                                        ? 'text-amber-800 dark:text-amber-200'
                                        : order.returnRequest.status === 'approved'
                                            ? 'text-green-800 dark:text-green-200'
                                            : 'text-red-800 dark:text-red-200'
                                    }`}>
                                    Return Request {order.returnRequest.status === 'pending' ? 'Pending' : order.returnRequest.status === 'approved' ? 'Approved' : 'Rejected'}
                                </h2>
                                <div className="text-sm space-y-2">
                                    <div>
                                        <p className="font-medium mb-1">Reason:</p>
                                        <p className="text-muted-foreground">
                                            {order.returnRequest.reason.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </p>
                                    </div>
                                    {order.returnRequest.details && (
                                        <div>
                                            <p className="font-medium mb-1">Details:</p>
                                            <p className="text-muted-foreground">{order.returnRequest.details}</p>
                                        </div>
                                    )}
                                    {order.returnRequest.status === 'approved' && order.returnRequest.resolution && (
                                        <div>
                                            <p className="font-medium mb-1">Resolution:</p>
                                            <p className="text-green-600 dark:text-green-400 font-medium">
                                                {order.returnRequest.resolution === 'refund' ? 'Refund Processed' : 'Replacement Order Created'}
                                            </p>
                                        </div>
                                    )}
                                    {order.returnRequest.adminNotes && (
                                        <div>
                                            <p className="font-medium mb-1">Admin Notes:</p>
                                            <p className="text-muted-foreground">{order.returnRequest.adminNotes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Timeline & Summary */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Order Timeline */}
                        <div className="bg-card border border-border rounded-lg p-6">
                            <h2 className="font-serif text-xl mb-6">Order Status</h2>
                            <OrderTimeline currentStatus={order.orderStatus} />
                        </div>

                        {/* Order Summary */}
                        <div className="bg-card border border-border rounded-lg p-6">
                            <h2 className="font-serif text-xl mb-4">Summary</h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{formatPrice(order.totals.subtotal)}</span>
                                </div>
                                {order.totals.discountTotal > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span>-{formatPrice(order.totals.discountTotal)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>{formatPrice(order.totals.shipping)}</span>
                                </div>
                                {order.totals.tax > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tax</span>
                                        <span>{formatPrice(order.totals.tax)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-3 border-t border-border font-medium text-base">
                                    <span>Total</span>
                                    <span className="text-primary">{formatPrice(order.totals.total)}</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-border">
                                <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
                                <p className="font-medium">
                                    {order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}
                                </p>
                            </div>

                            <div className="mt-4">
                                <p className="text-sm text-muted-foreground mb-1">Order Date</p>
                                <p className="font-medium">
                                    {new Date(order.createdAt).toLocaleString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Tracking Information */}
                        {order.carrier && order.trackingNumber && (
                            <div className="bg-card border border-border rounded-lg p-6">
                                <h2 className="font-serif text-xl mb-4">Tracking Information</h2>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <p className="text-muted-foreground mb-1">Carrier</p>
                                        <p className="font-medium">{order.carrier}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground mb-1">Tracking Number</p>
                                        <p className="font-medium font-mono">{order.trackingNumber}</p>
                                    </div>
                                    {order.estimatedDeliveryDate && (
                                        <div>
                                            <p className="text-muted-foreground mb-1">Estimated Delivery</p>
                                            <p className="font-medium">
                                                {new Date(order.estimatedDeliveryDate).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    )}
                                    {order.trackingUrl && (
                                        <div className="pt-2">
                                            <a
                                                href={order.trackingUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                                            >
                                                <Package2 className="w-4 h-4" />
                                                Track Package
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Cancel Order Dialog */}
                <CancelOrderDialog
                    order={order}
                    open={cancelDialogOpen}
                    onOpenChange={setCancelDialogOpen}
                    onCancelled={handleOrderCancelled}
                />

                {/* Return Request Modal */}
                <ReturnRequestModal
                    orderId={order.id}
                    isOpen={returnModalOpen}
                    onClose={() => setReturnModalOpen(false)}
                    onSuccess={fetchOrder}
                />
            </div>
        </section>
    );
}
