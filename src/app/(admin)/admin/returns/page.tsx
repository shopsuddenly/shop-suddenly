"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OrderService } from "@/services/order.service";
import { Order } from "@/types/order";
import { formatPrice } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { Loader2, RotateCcw, Eye, Filter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type ReturnStatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

export default function AdminReturnsPage() {
    const router = useRouter();
    const [returns, setReturns] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<ReturnStatusFilter>('all');

    useEffect(() => {
        fetchReturns();
    }, [filter]);

    const fetchReturns = async () => {
        setLoading(true);
        try {
            const status = filter === 'all' ? undefined : filter;
            const data = await OrderService.getReturnRequests(status);
            setReturns(data);
        } catch (error) {
            console.error('Failed to fetch returns:', error);
        } finally {
            setLoading(false);
        }
    };

    const getReturnStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: 'bg-amber-100 text-amber-800 border-amber-300',
            approved: 'bg-green-100 text-green-800 border-green-300',
            rejected: 'bg-red-100 text-red-800 border-red-300'
        };
        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || ''}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const pendingCount = returns.filter(r => r.returnRequest?.status === 'pending').length;

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <RotateCcw className="w-8 h-8 text-primary" />
                    <div>
                        <h1 className="font-serif text-3xl">Returns Management</h1>
                        <p className="text-muted-foreground text-sm">
                            {pendingCount > 0 && <span className="text-amber-500 font-medium">{pendingCount} pending</span>}
                            {pendingCount === 0 && 'No pending returns'}
                        </p>
                    </div>
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as ReturnStatusFilter)}
                        className="px-4 py-2 bg-background border border-border rounded-lg text-sm"
                    >
                        <option value="all">All Returns</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-card border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Total Returns</p>
                    <p className="text-2xl font-bold">{returns.length}</p>
                </div>
                <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
                    <p className="text-sm text-amber-400">Pending</p>
                    <p className="text-2xl font-bold text-amber-300">
                        {returns.filter(r => r.returnRequest?.status === 'pending').length}
                    </p>
                </div>
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                    <p className="text-sm text-green-400">Approved</p>
                    <p className="text-2xl font-bold text-green-300">
                        {returns.filter(r => r.returnRequest?.status === 'approved').length}
                    </p>
                </div>
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                    <p className="text-sm text-red-400">Rejected</p>
                    <p className="text-2xl font-bold text-red-300">
                        {returns.filter(r => r.returnRequest?.status === 'rejected').length}
                    </p>
                </div>
            </div>

            {/* Returns Table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : returns.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                        <RotateCcw className="w-12 h-12 mb-4 opacity-50" />
                        <p>No return requests found</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Order ID</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Customer</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Items</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Reason</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Requested</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {returns.map((order) => (
                                <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-4">
                                        <span className="font-mono text-sm">{order.id.slice(-8)}</span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div>
                                            <p className="font-medium text-sm">{order.addressSnapshot.name}</p>
                                            <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="space-y-1">
                                            {order.items.slice(0, 2).map((item, i) => (
                                                <p key={i} className="text-sm truncate max-w-[150px]">
                                                    {item.name} {item.size && `(${item.size})`}
                                                </p>
                                            ))}
                                            {order.items.length > 2 && (
                                                <p className="text-xs text-muted-foreground">
                                                    +{order.items.length - 2} more
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="text-sm">
                                            {order.returnRequest?.reason.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="text-sm text-muted-foreground">
                                            {order.returnRequest?.requestedAt &&
                                                formatDistanceToNow(new Date(order.returnRequest.requestedAt), { addSuffix: true })}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        {getReturnStatusBadge(order.returnRequest?.status || 'pending')}
                                    </td>
                                    <td className="px-4 py-4">
                                        <button
                                            onClick={() => router.push(`/admin/orders/${order.id}`)}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
                                        >
                                            <Eye className="w-4 h-4" />
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
