"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OrderService } from "@/services/order.service";
import { Order } from "@/types/order";
import { formatPrice } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { CheckCircle, Package, Loader2 } from "lucide-react";
import Link from "next/link";

function OrderSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!orderId) {
            router.push('/');
            return;
        }

        const fetchOrder = async () => {
            try {
                const orderData = await OrderService.getOrderById(orderId);
                setOrder(orderData);
            } catch (error) {
                console.error('Failed to fetch order:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h1 className="font-serif text-3xl mb-4">Order Not Found</h1>
                <Link href="/" className="text-primary hover:underline">
                    Return to Home
                </Link>
            </div>
        );
    }

    const estimatedDelivery = order.paymentMethod === 'COD' ? '7-10 business days' : '3-5 business days';

    return (
        <section className="pt-32 pb-16 min-h-screen bg-background">
            <div className="luxury-container max-w-2xl mx-auto text-center">
                {/* Success Icon */}
                <div className="mb-8">
                    <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                </div>

                {/* Success Message */}
                <h1 className="font-serif text-4xl md:text-5xl mb-4">Order Placed Successfully!</h1>
                <p className="text-muted-foreground text-lg mb-8">
                    Thank you for your order. We've sent a confirmation to your email.
                </p>

                {/* Order Details Card */}
                <div className="bg-card border border-border rounded-lg p-8 text-left mb-8">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b border-border">
                            <div>
                                <p className="text-sm text-muted-foreground">Order ID</p>
                                <p className="font-mono font-medium">{order.id}</p>
                            </div>
                            <OrderStatusBadge status={order.orderStatus} />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
                                <div className="flex items-center gap-2">
                                    <Package className="w-4 h-4 text-primary" />
                                    <span className="font-medium">
                                        {order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                                <p className="text-2xl font-serif text-primary">
                                    {formatPrice(order.totals.total)}
                                </p>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Delivery Address</p>
                            <div className="text-sm">
                                <p className="font-medium">{order.addressSnapshot.name}</p>
                                <p className="text-muted-foreground">{order.addressSnapshot.addressLine1}</p>
                                {order.addressSnapshot.addressLine2 && (
                                    <p className="text-muted-foreground">{order.addressSnapshot.addressLine2}</p>
                                )}
                                <p className="text-muted-foreground">
                                    {order.addressSnapshot.city}, {order.addressSnapshot.state} {order.addressSnapshot.postalCode}
                                </p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border">
                            <p className="text-sm text-muted-foreground mb-1">Estimated Delivery</p>
                            <p className="font-medium">{estimatedDelivery}</p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href={`/account/orders/${order.id}`} className="btn-luxury">
                        View Order Details
                    </Link>
                    <Link href="/shop" className="btn-luxury-outline">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <OrderSuccessContent />
        </Suspense>
    );
}
