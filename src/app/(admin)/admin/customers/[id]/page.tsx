"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CustomerService, Customer, CustomerStats } from "@/services/customer.service";
import { Order } from "@/types/order";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { Calendar, Mail, MapPin, Package, ShoppingBag, Loader2, ArrowLeft, DollarSign, TrendingUp } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

export default function CustomerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const customerId = params.id as string;

    const [customer, setCustomer] = useState<Customer | null>(null);
    const [stats, setStats] = useState<CustomerStats | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (customerId) {
            fetchCustomerData();
        }
    }, [customerId]);

    const fetchCustomerData = async () => {
        try {
            console.log('👤 [CUSTOMER DETAIL] Fetching data for:', customerId);

            const [customerData, customerStats, customerOrders] = await Promise.all([
                CustomerService.getCustomerById(customerId),
                CustomerService.getCustomerStats(customerId),
                CustomerService.getCustomerOrders(customerId),
            ]);

            if (!customerData) {
                router.push('/admin/customers');
                return;
            }

            setCustomer(customerData);
            setStats(customerStats);
            setOrders(customerOrders);
        } catch (error) {
            console.error('❌ [CUSTOMER DETAIL] Error fetching data:', error);
            router.push('/admin/customers');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!customer || !stats) {
        return null;
    }

    return (
        <div className="p-6 md:p-8">
            {/* Back Button */}
            <Link
                href="/admin/customers"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Customers
            </Link>

            {/* Customer Header */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
                <div className="flex items-start gap-6">
                    {/* Profile Picture */}
                    <div className="relative w-20 h-20 rounded-full overflow-hidden bg-muted flex-shrink-0">
                        {customer.photoURL ? (
                            <Image
                                src={customer.photoURL}
                                alt={customer.displayName || 'User'}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-3xl font-medium">
                                {(customer.displayName || customer.email)?.[0]?.toUpperCase()}
                            </div>
                        )}
                    </div>

                    {/* Customer Info */}
                    <div className="flex-1">
                        <h1 className="text-2xl font-serif text-foreground mb-2">
                            {customer.displayName || 'Customer'}
                        </h1>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="w-4 h-4" />
                                {customer.email}
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                Joined {new Date(customer.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${customer.role === 'admin'
                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                    }`}>
                                    {customer.role}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-muted-foreground text-xs font-sans uppercase tracking-wide mb-2">
                                Total Orders
                            </h3>
                            <p className="text-3xl font-serif text-foreground">
                                {stats.totalOrders}
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-blue-500/10 text-blue-600">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-muted-foreground text-xs font-sans uppercase tracking-wide mb-2">
                                Total Spent
                            </h3>
                            <p className="text-3xl font-serif text-foreground">
                                {formatPrice(stats.totalSpent)}
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-green-500/10 text-green-600">
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-muted-foreground text-xs font-sans uppercase tracking-wide mb-2">
                                Avg Order Value
                            </h3>
                            <p className="text-3xl font-serif text-foreground">
                                {formatPrice(stats.averageOrderValue)}
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-purple-500/10 text-purple-600">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-muted-foreground text-xs font-sans uppercase tracking-wide mb-2">
                                Last Order
                            </h3>
                            <p className="text-lg font-serif text-foreground">
                                {stats.lastOrderDate
                                    ? new Date(stats.lastOrderDate).toLocaleDateString()
                                    : 'Never'}
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-orange-500/10 text-orange-600">
                            <Package className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Order History */}
            <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-serif text-foreground mb-4">Order History</h2>

                {orders.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">No orders yet</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted border-b border-border">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Items
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-4 py-4 text-sm font-mono">
                                            {order.id}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-muted-foreground">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-4 text-sm">
                                            {order.items.length}
                                        </td>
                                        <td className="px-4 py-4 text-sm font-medium">
                                            {formatPrice(order.totals.total)}
                                        </td>
                                        <td className="px-4 py-4">
                                            <OrderStatusBadge status={order.orderStatus} />
                                        </td>
                                        <td className="px-4 py-4">
                                            <Link
                                                href={`/admin/orders/${order.id}`}
                                                className="text-primary hover:underline text-sm"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
