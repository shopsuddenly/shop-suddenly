"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { OrderService } from "@/services/order.service";
import { Order } from "@/types/order";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { formatPrice } from "@/lib/utils";
import { Loader2, Package } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login?redirect=/account/orders');
            return;
        }

        if (user) {
            fetchOrders();
        }
    }, [user, authLoading, router]);

    const fetchOrders = async () => {
        if (!user) return;

        try {
            console.log('📋 [ORDERS PAGE] Fetching orders for user:', user.uid);
            const userOrders = await OrderService.getUserOrders(user.uid);
            console.log('✅ [ORDERS PAGE] Retrieved', userOrders.length, 'orders');
            setOrders(userOrders);
        } catch (error) {
            console.error('❌ [ORDERS PAGE] Error fetching orders:', error);
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

    if (orders.length === 0) {
        return (
            <section className="pt-32 pb-16 min-h-screen">
                <div className="luxury-container max-w-2xl mx-auto text-center">
                    <Package className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
                    <h1 className="font-serif text-3xl mb-4">No Orders Yet</h1>
                    <p className="text-muted-foreground mb-8">
                        Start shopping to see your orders here
                    </p>
                    <Link href="/shop" className="btn-luxury inline-block">
                        Browse Products
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className="pt-32 pb-16 min-h-screen bg-background">
            <div className="luxury-container">
                <h1 className="font-serif text-4xl md:text-5xl mb-12">My Orders</h1>

                <div className="space-y-4">
                    {orders.map((order) => (
                        <Link
                            key={order.id}
                            href={`/account/orders/${order.id}`}
                            className="block bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
                        >
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                {/* Order Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <p className="font-mono text-sm font-medium">{order.id}</p>
                                        <OrderStatusBadge status={order.orderStatus} />
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                    </p>
                                </div>

                                {/* Order Total */}
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground mb-1">Total</p>
                                    <p className="text-2xl font-serif text-primary">
                                        {formatPrice(order.totals.total)}
                                    </p>
                                </div>
                            </div>

                            {/* Order Items Preview */}
                            <div className="mt-4 pt-4 border-t border-border">
                                <div className="flex gap-2 overflow-x-auto">
                                    {order.items.slice(0, 4).map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex-shrink-0 w-16 h-16 bg-muted rounded overflow-hidden"
                                        >
                                            {item.image && (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>
                                    ))}
                                    {order.items.length > 4 && (
                                        <div className="flex-shrink-0 w-16 h-16 bg-muted rounded flex items-center justify-center text-sm text-muted-foreground">
                                            +{order.items.length - 4}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
