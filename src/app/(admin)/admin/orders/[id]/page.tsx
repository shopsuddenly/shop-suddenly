"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { OrderService } from "@/services/order.service";
import { NotificationService } from "@/services/notification.service";
import { NotificationCenterService } from "@/services/notification-center.service";
import { Order, OrderStatus, ReturnResolution } from "@/types/order";
import { formatPrice } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { ReplacementOrderModal } from "@/components/admin/ReplacementOrderModal";
import { Loader2, ArrowLeft, Save, RotateCcw, Check, X, Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

const statusOptions: { value: OrderStatus; label: string }[] = [
    { value: 'placed', label: 'Order Placed' },
    { value: 'packed', label: 'Packed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
];

export default function AdminOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.id as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('placed');
    const [adminNotes, setAdminNotes] = useState('');
    const [carrier, setCarrier] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [trackingUrl, setTrackingUrl] = useState('');
    const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');

    // Return management state
    const [returnResolution, setReturnResolution] = useState<ReturnResolution>('refund');
    const [returnAdminNotes, setReturnAdminNotes] = useState('');
    const [processingReturn, setProcessingReturn] = useState(false);
    const [replacementModalOpen, setReplacementModalOpen] = useState(false);

    useEffect(() => {
        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            console.log('📄 [ADMIN ORDER DETAIL] Fetching order:', orderId);
            const orderData = await OrderService.getOrderById(orderId);

            if (!orderData) {
                console.log('⚠️ [ADMIN ORDER DETAIL] Order not found');
                router.push('/admin/orders');
                return;
            }

            setOrder(orderData);
            setSelectedStatus(orderData.orderStatus);
            setAdminNotes(orderData.adminNotes || '');
            setCarrier(orderData.carrier || '');
            setTrackingNumber(orderData.trackingNumber || '');
            setTrackingUrl(orderData.trackingUrl || '');
            setEstimatedDeliveryDate(orderData.estimatedDeliveryDate || '');
            console.log('✅ [ADMIN ORDER DETAIL] Order loaded:', orderData.id);
        } catch (error) {
            console.error('❌ [ADMIN ORDER DETAIL] Error fetching order:', error);
            router.push('/admin/orders');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateOrder = async () => {
        if (!order) return;

        setUpdating(true);
        console.log('🔄 [ADMIN ORDER DETAIL] Updating order status:', selectedStatus);

        try {
            // Update order status
            await OrderService.updateOrderStatus(
                order.id,
                selectedStatus,
                adminNotes || undefined
            );

            // Update tracking info if provided
            if (carrier && trackingNumber) {
                await OrderService.updateTrackingInfo(
                    order.id,
                    carrier,
                    trackingNumber,
                    trackingUrl || undefined,
                    estimatedDeliveryDate || undefined
                );
            }

            toast.success('Order updated successfully');
            console.log('✅ [ADMIN ORDER DETAIL] Order updated');

            // Refresh order data
            await fetchOrder();

            // Send notifications for status updates that matter to the user
            if (['packed', 'shipped', 'delivered', 'cancelled'].includes(selectedStatus)) {
                const userId = order.userId;
                const userEmail = order.customerEmail;
                const statusLabels: Record<string, string> = {
                    packed: 'Order Packed',
                    shipped: 'Order Shipped',
                    delivered: 'Order Delivered',
                    cancelled: 'Order Cancelled'
                };
                const notificationTitle = statusLabels[selectedStatus] || 'Order Update';
                const notificationBody = `Your order #${order.id.slice(-8)} has been ${selectedStatus}.`;

                // 1. Send Email
                if (userEmail) {
                    console.log('📨 [ADMIN] Sending email...');
                    fetch('/api/send-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            order: { ...order, orderStatus: selectedStatus },
                            type: 'status_update',
                            status: selectedStatus,
                            userEmail: userEmail
                        })
                    }).then(() => console.log('✅ [ADMIN] Email sent'))
                        .catch(e => console.error('⚠️ [ADMIN] Email failed:', e));
                }

                // 2. Send In-App Notification (Notification Center)
                console.log('📥 [ADMIN] Creating in-app notification...');
                NotificationCenterService.createNotification({
                    userId: userId,
                    title: notificationTitle,
                    body: notificationBody,
                    url: '/profile'
                }).then(() => console.log('✅ [ADMIN] In-app notification created'))
                    .catch(e => console.error('⚠️ [ADMIN] In-app notification failed:', e));

                // 3. Send Push Notification (if user has FCM token)
                console.log('📱 [ADMIN] Sending push notification...');
                NotificationService.getUserToken(userId).then(token => {
                    if (token) {
                        fetch('/api/send-notification', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                tokens: [token],
                                userIds: [userId],
                                title: notificationTitle,
                                body: notificationBody,
                                url: '/profile'
                            })
                        }).then(() => console.log('✅ [ADMIN] Push sent'))
                            .catch(e => console.error('⚠️ [ADMIN] Push failed:', e));
                    } else {
                        console.log('ℹ️ [ADMIN] User has no FCM token, skipping push');
                    }
                });
            }
        } catch (error: any) {
            console.error('❌ [ADMIN ORDER DETAIL] Update failed:', error);
            toast.error(error.message || 'Failed to update order');
        } finally {
            setUpdating(false);
        }
    };

    const handleProcessReturn = async (approve: boolean) => {
        if (!order) return;

        setProcessingReturn(true);
        try {
            if (approve) {
                await OrderService.processReturn(order.id, true, returnResolution, returnAdminNotes);

                // If replacement, create the replacement order
                if (returnResolution === 'replacement') {
                    const replacementOrder = await OrderService.createReplacementOrder(order.id);
                    toast.success(`Return approved. Replacement order ${replacementOrder.id} created.`);
                } else {
                    toast.success('Return approved. Refund will be processed.');
                }
            } else {
                await OrderService.processReturn(order.id, false, undefined, returnAdminNotes);
                toast.success('Return request rejected.');
            }

            // Notify user
            NotificationCenterService.createNotification({
                userId: order.userId,
                title: approve ? 'Return Approved' : 'Return Rejected',
                body: approve
                    ? `Your return request for order #${order.id.slice(-8)} has been approved.`
                    : `Your return request for order #${order.id.slice(-8)} has been rejected.`,
                url: `/account/orders/${order.id}`
            });

            await fetchOrder();
        } catch (error: any) {
            console.error('❌ [ADMIN] Return processing failed:', error);
            toast.error(error.message || 'Failed to process return');
        } finally {
            setProcessingReturn(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!order) {
        return null;
    }

    const hasChanges =
        selectedStatus !== order.orderStatus ||
        adminNotes !== (order.adminNotes || '') ||
        carrier !== (order.carrier || '') ||
        trackingNumber !== (order.trackingNumber || '') ||
        trackingUrl !== (order.trackingUrl || '') ||
        estimatedDeliveryDate !== (order.estimatedDeliveryDate || '');

    return (
        <div className="p-6 md:p-8">
            {/* Back Button */}
            <Link
                href="/admin/orders"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Orders
            </Link>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-serif text-3xl mb-2">Order Management</h1>
                    <p className="font-mono text-sm text-muted-foreground">{order.id}</p>
                </div>
                <OrderStatusBadge status={order.orderStatus} />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left: Order Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Customer Info */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="font-serif text-xl mb-4">Customer Information</h2>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground mb-1">Name</p>
                                <p className="font-medium">{order.addressSnapshot.name}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground mb-1">Phone</p>
                                <p className="font-medium">{order.addressSnapshot.phone}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-muted-foreground mb-1">Delivery Address</p>
                                <div className="font-medium">
                                    <p>{order.addressSnapshot.addressLine1}</p>
                                    {order.addressSnapshot.addressLine2 && (
                                        <p>{order.addressSnapshot.addressLine2}</p>
                                    )}
                                    <p>
                                        {order.addressSnapshot.city}, {order.addressSnapshot.state} {order.addressSnapshot.postalCode}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="font-serif text-xl mb-4">Order Items</h2>
                        <div className="space-y-4">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                                    <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                                        {item.image && (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                width={64}
                                                height={64}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-sm">{item.name}</h3>
                                        {item.size && (
                                            <p className="text-xs text-muted-foreground">Size: {item.size}</p>
                                        )}
                                        <p className="font-medium text-sm">{formatPrice(item.unitPrice)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-sm">{formatPrice(item.unitPrice * item.quantity)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Totals */}
                        <div className="mt-6 border-t border-slate-800 pt-6 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Subtotal</span>
                                <span>{formatPrice(order.totals.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Shipping</span>
                                <span>{formatPrice(order.totals.shipping)}</span>
                            </div>
                            <div className="flex justify-between text-base font-medium text-white pt-2 border-t border-slate-800 mt-2">
                                <span>Total</span>
                                <span className="text-primary">{formatPrice(order.totals.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Order Management */}
                <div className="space-y-6">
                    {/* Return Request Management */}
                    {order.returnRequest && order.returnRequest.status === 'pending' && (
                        <div className="bg-amber-900/20 border border-amber-500/50 rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <RotateCcw className="w-5 h-5 text-amber-500" />
                                <h2 className="font-serif text-xl text-amber-300">Return Request</h2>
                            </div>

                            <div className="space-y-3 mb-4">
                                <div>
                                    <p className="text-sm text-slate-400">Reason:</p>
                                    <p className="text-sm font-medium text-white">
                                        {order.returnRequest.reason.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </p>
                                </div>
                                {order.returnRequest.details && (
                                    <div>
                                        <p className="text-sm text-slate-400">Details:</p>
                                        <p className="text-sm text-white">{order.returnRequest.details}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-slate-400">Requested:</p>
                                    <p className="text-sm text-white">
                                        {new Date(order.returnRequest.requestedAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 border-t border-amber-500/30 pt-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Resolution Type</label>
                                    <select
                                        value={returnResolution}
                                        onChange={(e) => setReturnResolution(e.target.value as ReturnResolution)}
                                        className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm"
                                    >
                                        <option value="refund">Refund</option>
                                        <option value="replacement">Create Replacement Order</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Admin Notes</label>
                                    <textarea
                                        value={returnAdminNotes}
                                        onChange={(e) => setReturnAdminNotes(e.target.value)}
                                        className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm h-20 resize-none"
                                        placeholder="Notes for the customer..."
                                    />
                                </div>
                                <div className="flex gap-3">
                                    {returnResolution === 'replacement' && (
                                        <button
                                            onClick={() => setReplacementModalOpen(true)}
                                            disabled={processingReturn}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            <Package className="w-4 h-4" />
                                            Custom Replacement
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleProcessReturn(true)}
                                        disabled={processingReturn}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {processingReturn ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                        {returnResolution === 'replacement' ? 'Same Items' : 'Approve Refund'}
                                    </button>
                                    <button
                                        onClick={() => handleProcessReturn(false)}
                                        disabled={processingReturn}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {processingReturn ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Processed Return Info */}
                    {order.returnRequest && order.returnRequest.status !== 'pending' && (
                        <div className={`border rounded-lg p-6 ${order.returnRequest.status === 'approved'
                            ? 'bg-green-900/20 border-green-500/50'
                            : 'bg-red-900/20 border-red-500/50'
                            }`}>
                            <h2 className={`font-serif text-xl mb-3 ${order.returnRequest.status === 'approved' ? 'text-green-300' : 'text-red-300'
                                }`}>
                                Return {order.returnRequest.status === 'approved' ? 'Approved' : 'Rejected'}
                            </h2>
                            <div className="text-sm space-y-2">
                                <p><span className="text-slate-400">Reason:</span> {order.returnRequest.reason.replace(/_/g, ' ')}</p>
                                {order.returnRequest.resolution && (
                                    <p><span className="text-slate-400">Resolution:</span> {order.returnRequest.resolution}</p>
                                )}
                                {order.returnRequest.adminNotes && (
                                    <p><span className="text-slate-400">Notes:</span> {order.returnRequest.adminNotes}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Status Update */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="font-serif text-xl mb-4">Update Status</h2>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm mb-4"
                        >
                            {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Admin Notes</label>
                            <textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm h-24 resize-none"
                                placeholder="Add internal notes..."
                            />
                        </div>

                        <button
                            onClick={handleUpdateOrder}
                            disabled={!hasChanges || updating}
                            className="w-full btn-luxury disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {updating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 inline mr-2" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>

                    {/* Tracking Information */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="font-serif text-xl mb-4">Tracking Information</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Carrier</label>
                                <select
                                    value={carrier}
                                    onChange={(e) => setCarrier(e.target.value)}
                                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm"
                                >
                                    <option value="">Select carrier...</option>
                                    <option value="FedEx">FedEx</option>
                                    <option value="DHL">DHL</option>
                                    <option value="UPS">UPS</option>
                                    <option value="USPS">USPS</option>
                                    <option value="India Post">India Post</option>
                                    <option value="Blue Dart">Blue Dart</option>
                                    <option value="Delhivery">Delhivery</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Tracking Number</label>
                                <input
                                    type="text"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm"
                                    placeholder="Enter tracking number"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Tracking URL</label>
                                <input
                                    type="url"
                                    value={trackingUrl}
                                    onChange={(e) => setTrackingUrl(e.target.value)}
                                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm"
                                    placeholder="https://..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Estimated Delivery Date</label>
                                <input
                                    type="date"
                                    value={estimatedDeliveryDate}
                                    onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm"
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="font-serif text-xl mb-4">Order Timeline</h2>
                        <OrderTimeline currentStatus={order.orderStatus} />
                    </div>

                    {/* Order Info */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="font-serif text-xl mb-4">Order Info</h2>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-muted-foreground mb-1">Payment Method</p>
                                <p className="font-medium">
                                    {order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground mb-1">Order Date</p>
                                <p className="font-medium">
                                    {new Date(order.createdAt).toLocaleString()}
                                </p>
                            </div>
                            {order.updatedAt !== order.createdAt && (
                                <div>
                                    <p className="text-muted-foreground mb-1">Last Updated</p>
                                    <p className="font-medium">
                                        {new Date(order.updatedAt).toLocaleString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Replacement Order Modal */}
            {order && (
                <ReplacementOrderModal
                    order={order}
                    isOpen={replacementModalOpen}
                    onClose={() => setReplacementModalOpen(false)}
                    onSuccess={fetchOrder}
                />
            )}
        </div>
    );
}
