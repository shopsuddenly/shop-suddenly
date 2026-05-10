"use client";

import { formatPrice } from "@/lib/utils";

import { useAuth } from "@/hooks/useAuth";
import { Package, Settings, LogOut, User, MapPin, CreditCard, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { OrderService } from "@/services/order.service";
import { Order } from "@/types/order";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import Link from "next/link";
import { AddressSelector } from "@/components/checkout/AddressSelector";

export function ProfileClient() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'orders' | 'settings'>('orders');
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        if (!user) return;

        try {
            console.log('📋 [PROFILE] Fetching orders for user:', user.uid);
            const userOrders = await OrderService.getUserOrders(user.uid);
            console.log('✅ [PROFILE] Retrieved', userOrders.length, 'orders');
            setOrders(userOrders);
        } catch (error) {
            console.error('❌ [PROFILE] Error fetching orders:', error);
        } finally {
            setLoadingOrders(false);
        }
    };

    if (!user) return null;

    return (
        <div className="luxury-container pt-32 pb-20 min-h-screen">
            <div className="grid lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-8">
                    {/* User Card */}
                    <div className="bg-card border border-border/50 p-6 flex flex-col items-center text-center">
                        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary mb-4">
                            <Image
                                src={user.photoURL || "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff"}
                                alt={user.displayName || "User"}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <h2 className="font-serif text-xl text-foreground">{user.displayName || "Valued Customer"}</h2>
                        <p className="font-sans text-sm text-muted-foreground mt-1">{user.email}</p>

                        <div className="mt-4 inline-flex items-center px-3 py-1 bg-primary/10 text-primary text-xs font-sans uppercase tracking-luxury rounded-full">
                            {user.role}
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-2">
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 text-sm font-sans uppercase tracking-luxury transition-colors border-l-2",
                                activeTab === 'orders'
                                    ? "border-primary bg-card text-foreground"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Package className="w-4 h-4" />
                            My Orders
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 text-sm font-sans uppercase tracking-luxury transition-colors border-l-2",
                                activeTab === 'settings'
                                    ? "border-primary bg-card text-foreground"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Settings className="w-4 h-4" />
                            Settings
                        </button>
                        <button
                            onClick={() => {
                                // Redirect first to avoid AuthGuard interference
                                logout(); // Fire and forget
                                window.location.href = '/';
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-sans uppercase tracking-luxury transition-colors border-l-2 border-transparent text-destructive/80 hover:text-destructive hover:bg-destructive/5"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    {activeTab === 'orders' ? (
                        <div className="space-y-6">
                            <h2 className="font-serif text-3xl text-foreground mb-6">Order History</h2>

                            {loadingOrders ? (
                                <div className="bg-card border border-border/50 p-12 text-center">
                                    <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
                                    <p className="text-muted-foreground font-sans text-sm">Loading your orders...</p>
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="bg-card border border-border/50 p-12 text-center">
                                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                    <h3 className="font-serif text-xl text-foreground mb-2">No orders yet</h3>
                                    <p className="text-muted-foreground font-sans text-sm mb-6">Start exploring our collection to place your first order.</p>
                                    <Link href="/shop" className="btn-luxury inline-block">
                                        <span>Browse Shop</span>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map((order) => (
                                        <Link
                                            key={order.id}
                                            href={`/account/orders/${order.id}`}
                                            className="block bg-card border border-border/50 p-6 hover:border-primary transition-colors"
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
                                                    <p className="font-medium">
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
                            )}
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <h2 className="font-serif text-3xl text-foreground mb-6">Account Settings</h2>

                            {/* Personal Info */}
                            <div className="bg-card border border-border/50 p-6 md:p-8">
                                <h3 className="flex items-center gap-2 font-serif text-xl text-foreground mb-6">
                                    <User className="w-5 h-5 text-primary" />
                                    Personal Information
                                </h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-sans uppercase tracking-luxury text-muted-foreground">Full Name</label>
                                        <input
                                            type="text"
                                            value={user.displayName || ""}
                                            readOnly
                                            className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-sans uppercase tracking-luxury text-muted-foreground">Email Address</label>
                                        <input
                                            type="email"
                                            value={user.email || ""}
                                            readOnly
                                            className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary opacity-70"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Saved Addresses Section */}
                            <div className="bg-card border border-border/50 p-6 md:p-8">
                                <h3 className="flex items-center gap-2 font-serif text-xl text-foreground mb-6">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    Saved Addresses
                                </h3>
                                <AddressSelector onSelect={() => { }} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
