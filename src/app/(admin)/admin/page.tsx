"use client";

import { useEffect, useState } from "react";
import { AnalyticsService, DashboardStats, SalesTrendData } from "@/services/analytics.service";
import { AdminService } from "@/services/admin.service";
import { Product } from "@/types/store";
import { StatsCard } from "@/components/admin/StatsCard";
import { formatPrice } from "@/lib/utils";
import { SalesChart } from "@/components/admin/SalesChart";
import { OrderDistributionChart } from "@/components/admin/OrderDistributionChart";
import { LowStockAlert } from "@/components/admin/LowStockAlert";
import { DollarSign, ShoppingCart, Package, Users, TrendingDown, Loader2 } from "lucide-react";

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [salesTrend, setSalesTrend] = useState<SalesTrendData[]>([]);
    const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            console.log('📊 [DASHBOARD] Loading dashboard data...');
            const [dashboardStats, trend, lowStock] = await Promise.all([
                AnalyticsService.getDashboardStats(),
                AnalyticsService.getSalesTrend(7),
                AnalyticsService.getLowStockProducts(10),
            ]);

            setStats(dashboardStats);
            setSalesTrend(trend);
            setLowStockProducts(lowStock);
        } catch (error) {
            console.error('❌ [DASHBOARD] Error fetching dashboard data:', error);
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

    if (!stats) {
        return (
            <div className="p-8 md:p-12">
                <div className="text-center text-muted-foreground">
                    Failed to load dashboard data
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-8">Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    title="Total Revenue"
                    value={formatPrice(stats.totalRevenue)}
                    icon={DollarSign}
                    trend={{
                        value: stats.revenueGrowth,
                        isPositive: stats.revenueGrowth >= 0,
                    }}
                    iconColor="text-green-600"
                />
                <StatsCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    subtitle={`${stats.ordersByStatus.placed + stats.ordersByStatus.packed} pending shipment`}
                    icon={ShoppingCart}
                    iconColor="text-blue-600"
                />
                <StatsCard
                    title="Total Products"
                    value={stats.totalProducts}
                    subtitle={stats.lowStockCount > 0 ? `${stats.lowStockCount} low stock` : 'All stocked'}
                    icon={Package}
                    iconColor="text-purple-600"
                />
                <StatsCard
                    title="Total Customers"
                    value={stats.totalCustomers}
                    icon={Users}
                    iconColor="text-indigo-600"
                />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <StatsCard
                    title="Average Order Value"
                    value={formatPrice(stats.averageOrderValue)}
                    icon={DollarSign}
                    iconColor="text-emerald-600"
                />
                <StatsCard
                    title="Cancellation Rate"
                    value={`${stats.cancellationRate.toFixed(1)}%`}
                    subtitle={`${stats.ordersByStatus.cancelled} of ${stats.totalOrders} orders`}
                    icon={TrendingDown}
                    iconColor="text-red-600"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <SalesChart data={salesTrend} />
                <OrderDistributionChart data={stats.ordersByStatus} />
            </div>

            {/* Low Stock Alert */}
            {lowStockProducts.length > 0 && (
                <div className="mb-8">
                    <LowStockAlert products={lowStockProducts} />
                </div>
            )}
        </div>
    );
}
