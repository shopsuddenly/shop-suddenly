"use client";

import { useEffect, useState } from "react";
import { OrderService } from "@/services/order.service";
import { ExportService } from "@/services/export.service";
import { Order, OrderStatus } from "@/types/order";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { Loader2, Search, Download, Eye, Filter } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

const statusFilters: { value: OrderStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Orders' },
    { value: 'placed', label: 'Pending COD' },
    { value: 'packed', label: 'Packed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
];

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<OrderStatus | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        filterOrders();
    }, [orders, activeFilter, searchQuery]);

    const fetchOrders = async () => {
        try {
            console.log('📋 [ADMIN ORDERS] Fetching all orders...');
            const allOrders = await OrderService.getAllOrders();
            console.log('✅ [ADMIN ORDERS] Retrieved', allOrders.length, 'orders');
            setOrders(allOrders);
        } catch (error) {
            console.error('❌ [ADMIN ORDERS] Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterOrders = () => {
        let filtered = orders;

        // Filter by status
        if (activeFilter !== 'all') {
            filtered = filtered.filter(order => order.orderStatus === activeFilter);
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(order =>
                order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.addressSnapshot.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredOrders(filtered);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="font-serif text-3xl md:text-4xl">Orders Management</h1>
                <button
                    onClick={() => {
                        ExportService.exportOrdersToCSV(orders, `orders-${new Date().toISOString().split('T')[0]}.csv`);
                        toast.success('Orders exported successfully');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <Download className="w-4 h-4" />
                    Export to CSV
                </button>
            </div>

            {/* Filters and Search */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
                {/* Status Filters */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {statusFilters.map(filter => (
                        <button
                            key={filter.value}
                            onClick={() => setActiveFilter(filter.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === filter.value
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                {/*  Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by Order ID or Customer Name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>

            {/* Orders Count */}
            <p className="text-sm text-muted-foreground mb-4">
                Showing {filteredOrders.length} of {orders.length} orders
            </p>

            {/* Orders Table */}
            {filteredOrders.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-12 text-center">
                    <p className="text-muted-foreground">No orders found</p>
                </div>
            ) : (
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted border-b border-border">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Customer
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
                                        Date
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-4 py-4 text-sm font-mono">
                                            {order.id}
                                        </td>
                                        <td className="px-4 py-4 text-sm">
                                            {order.addressSnapshot.name}
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
                                        <td className="px-4 py-4 text-sm text-muted-foreground">
                                            {new Date(order.createdAt).toLocaleDateString()}
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
                </div>
            )}
        </div>
    );
}
