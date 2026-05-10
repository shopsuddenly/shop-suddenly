"use client";

import { useState, useEffect } from "react";
import { User, ShoppingBag, Calendar, DollarSign, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { OrderService } from "@/services/order.service";
import { Order } from "@/types/order";
import { formatPrice } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import Link from "next/link";

interface CustomerProfilePanelProps {
    userId: string;
    userName: string;
    userEmail: string;
}

export function CustomerProfilePanel({ userId, userName, userEmail }: CustomerProfilePanelProps) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUserData = async () => {
            setLoading(true);
            try {
                const userOrders = await OrderService.getUserOrders(userId);
                setOrders(userOrders);
            } catch (error) {
                console.error("Failed to load customer data", error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) loadUserData();
    }, [userId]);

    const totalSpent = orders.reduce((sum, order) => sum + order.totals.total, 0);
    const joinDate = orders.length > 0 ? orders[orders.length - 1].createdAt : null; // Approximate join date from first order

    return (
        <div className="w-80 border-l border-border bg-card p-6 overflow-y-auto">
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-10 h-10 text-primary" />
                </div>
                <h2 className="font-serif text-xl font-medium">{userName}</h2>
                <p className="text-sm text-muted-foreground">{userEmail}</p>
                <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>User since {joinDate ? new Date(joinDate).getFullYear() : 'N/A'}</span>
                </div>
            </div>

            <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                        <ShoppingBag className="w-5 h-5 mx-auto mb-2 text-primary" />
                        <p className="text-2xl font-bold">{orders.length}</p>
                        <p className="text-xs text-muted-foreground">Orders</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                        <DollarSign className="w-5 h-5 mx-auto mb-2 text-green-600" />
                        <p className="text-xl font-bold">{formatPrice(totalSpent)}</p>
                        <p className="text-xs text-muted-foreground">Lifetime Value</p>
                    </div>
                </div>

                {/* Recent Orders */}
                <div>
                    <h3 className="text-sm font-medium mb-4 uppercase tracking-wider text-muted-foreground">Recent Orders</h3>
                    {loading ? (
                        <p className="text-sm text-muted-foreground">Loading history...</p>
                    ) : orders.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No orders found</p>
                    ) : (
                        <div className="space-y-3">
                            {orders.slice(0, 3).map((order) => (
                                <Link
                                    key={order.id}
                                    href={`/admin/orders/${order.id}`}
                                    target="_blank"
                                    className="block p-3 rounded-lg border border-border hover:border-primary transition-colors bg-background"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-mono text-xs font-medium">{order.id.slice(-8)}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(order.createdAt))} ago
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <OrderStatusBadge status={order.orderStatus} className="scale-90 origin-left" />
                                        <span className="font-medium text-sm">{formatPrice(order.totals.total)}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="pt-6 border-t border-border">
                    <Link
                        href={`/admin/customers/${userId}`}
                        className="flex items-center justify-center w-full py-2 text-sm text-primary hover:underline"
                    >
                        View Full Profile <ExternalLink className="w-4 h-4 ml-1" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
