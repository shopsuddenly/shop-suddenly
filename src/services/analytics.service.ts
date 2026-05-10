import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types/order';
import { Product } from '@/types/store';

const COLLECTION_ORDERS = 'orders';
const COLLECTION_PRODUCTS = 'products';
const COLLECTION_USERS = 'users';

export interface DashboardStats {
    totalRevenue: number;
    revenueGrowth: number; // percentage
    totalOrders: number;
    ordersByStatus: {
        placed: number;
        packed: number;
        shipped: number;
        delivered: number;
        cancelled: number;
    };
    totalProducts: number;
    lowStockCount: number;
    totalCustomers: number;
    cancellationRate: number;
    averageOrderValue: number;
}

export interface SalesTrendData {
    date: string;
    revenue: number;
    orders: number;
}

export interface TopProduct {
    id: string;
    name: string;
    totalSold: number;
    revenue: number;
}

export class AnalyticsService {
    /**
     * Get comprehensive dashboard statistics
     */
    static async getDashboardStats(): Promise<DashboardStats> {
        console.log('📊 [ANALYTICS] Fetching dashboard stats...');

        try {
            // Fetch all orders
            const ordersRef = collection(db, COLLECTION_ORDERS);
            const ordersSnapshot = await getDocs(ordersRef);
            const orders = ordersSnapshot.docs.map(doc => doc.data() as Order);

            // Fetch all products
            const productsRef = collection(db, COLLECTION_PRODUCTS);
            const productsSnapshot = await getDocs(productsRef);
            const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

            // Fetch all users (customers)
            const usersRef = collection(db, COLLECTION_USERS);
            const usersSnapshot = await getDocs(usersRef);
            const totalCustomers = usersSnapshot.size;

            // Calculate total revenue
            const totalRevenue = orders.reduce((sum, order) => {
                if (order.orderStatus !== 'cancelled') {
                    return sum + order.totals.total;
                }
                return sum;
            }, 0);

            // Calculate revenue from last month for growth calculation
            const now = new Date();
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
            const lastMonthRevenue = orders
                .filter(order => {
                    const orderDate = new Date(order.createdAt);
                    return orderDate < lastMonth && order.orderStatus !== 'cancelled';
                })
                .reduce((sum, order) => sum + order.totals.total, 0);

            const thisMonthRevenue = orders
                .filter(order => {
                    const orderDate = new Date(order.createdAt);
                    return orderDate >= lastMonth && order.orderStatus !== 'cancelled';
                })
                .reduce((sum, order) => sum + order.totals.total, 0);

            const revenueGrowth = lastMonthRevenue > 0
                ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
                : 0;

            // Count orders by status
            const ordersByStatus = {
                placed: orders.filter(o => o.orderStatus === 'placed').length,
                packed: orders.filter(o => o.orderStatus === 'packed').length,
                shipped: orders.filter(o => o.orderStatus === 'shipped').length,
                delivered: orders.filter(o => o.orderStatus === 'delivered').length,
                cancelled: orders.filter(o => o.orderStatus === 'cancelled').length,
            };

            // Count low stock products (stock < 10)
            const lowStockCount = products.filter(p => {
                const stock = typeof p.stock === 'number' ? p.stock : 0;
                return stock < 10 && p.isActive;
            }).length;

            // Calculate cancellation rate
            const totalNonCancelledOrders = orders.length - ordersByStatus.cancelled;
            const cancellationRate = orders.length > 0
                ? (ordersByStatus.cancelled / orders.length) * 100
                : 0;

            // Calculate average order value
            const averageOrderValue = totalNonCancelledOrders > 0
                ? totalRevenue / totalNonCancelledOrders
                : 0;

            const stats: DashboardStats = {
                totalRevenue,
                revenueGrowth,
                totalOrders: orders.length,
                ordersByStatus,
                totalProducts: products.length,
                lowStockCount,
                totalCustomers,
                cancellationRate,
                averageOrderValue,
            };

            console.log('✅ [ANALYTICS] Dashboard stats calculated:', stats);
            return stats;
        } catch (error) {
            console.error('❌ [ANALYTICS] Error fetching dashboard stats:', error);
            throw error;
        }
    }

    /**
     * Get sales trend data for the last N days
     */
    static async getSalesTrend(days: 7 | 30 = 7): Promise<SalesTrendData[]> {
        console.log(`📈 [ANALYTICS] Fetching sales trend for last ${days} days...`);

        try {
            const ordersRef = collection(db, COLLECTION_ORDERS);
            const ordersSnapshot = await getDocs(ordersRef);
            const orders = ordersSnapshot.docs.map(doc => doc.data() as Order);

            // Calculate date range
            const now = new Date();
            const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

            // Filter orders within date range
            const recentOrders = orders.filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate >= startDate && order.orderStatus !== 'cancelled';
            });

            // Group by date
            const salesByDate = new Map<string, { revenue: number; orders: number }>();

            // Initialize all dates with zero values
            for (let i = 0; i < days; i++) {
                const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                const dateStr = date.toISOString().split('T')[0];
                salesByDate.set(dateStr, { revenue: 0, orders: 0 });
            }

            // Populate with actual data
            recentOrders.forEach(order => {
                const dateStr = order.createdAt.split('T')[0];
                const current = salesByDate.get(dateStr) || { revenue: 0, orders: 0 };
                salesByDate.set(dateStr, {
                    revenue: current.revenue + order.totals.total,
                    orders: current.orders + 1,
                });
            });

            // Convert to array and sort by date
            const trendData: SalesTrendData[] = Array.from(salesByDate.entries())
                .map(([date, data]) => ({
                    date,
                    revenue: data.revenue,
                    orders: data.orders,
                }))
                .sort((a, b) => a.date.localeCompare(b.date));

            console.log('✅ [ANALYTICS] Sales trend calculated');
            return trendData;
        } catch (error) {
            console.error('❌ [ANALYTICS] Error fetching sales trend:', error);
            throw error;
        }
    }

    /**
     * Get top-selling products
     */
    static async getTopProducts(limitCount: number = 5): Promise<TopProduct[]> {
        console.log(`🏆 [ANALYTICS] Fetching top ${limitCount} products...`);

        try {
            const ordersRef = collection(db, COLLECTION_ORDERS);
            const ordersSnapshot = await getDocs(ordersRef);
            const orders = ordersSnapshot.docs.map(doc => doc.data() as Order);

            // Aggregate sales by product
            const productSales = new Map<string, { name: string; totalSold: number; revenue: number }>();

            orders
                .filter(order => order.orderStatus !== 'cancelled')
                .forEach(order => {
                    order.items.forEach(item => {
                        const current = productSales.get(item.productId) || {
                            name: item.name,
                            totalSold: 0,
                            revenue: 0,
                        };

                        productSales.set(item.productId, {
                            name: item.name,
                            totalSold: current.totalSold + item.quantity,
                            revenue: current.revenue + (item.quantity * item.unitPrice),
                        });
                    });
                });

            // Convert to array and sort by revenue
            const topProducts: TopProduct[] = Array.from(productSales.entries())
                .map(([id, data]) => ({
                    id,
                    name: data.name,
                    totalSold: data.totalSold,
                    revenue: data.revenue,
                }))
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, limitCount);

            console.log('✅ [ANALYTICS] Top products calculated');
            return topProducts;
        } catch (error) {
            console.error('❌ [ANALYTICS] Error fetching top products:', error);
            throw error;
        }
    }

    /**
     * Get products with low stock
     */
    static async getLowStockProducts(threshold: number = 10): Promise<Product[]> {
        console.log(`⚠️ [ANALYTICS] Fetching products with stock < ${threshold}...`);

        try {
            const productsRef = collection(db, COLLECTION_PRODUCTS);
            const productsSnapshot = await getDocs(productsRef);
            const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

            const lowStockProducts = products
                .filter(p => {
                    const stock = typeof p.stock === 'number' ? p.stock : 0;
                    return stock < threshold && p.isActive;
                })
                .sort((a, b) => (a.stock || 0) - (b.stock || 0));

            console.log('✅ [ANALYTICS] Found', lowStockProducts.length, 'low stock products');
            return lowStockProducts;
        } catch (error) {
            console.error('❌ [ANALYTICS] Error fetching low stock products:', error);
            throw error;
        }
    }
}
