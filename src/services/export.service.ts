import Papa from 'papaparse';
import { Order } from '@/types/order';
import { Product } from '@/types/store';
import { formatPrice } from "@/lib/utils";

export class ExportService {
    /**
     * Export orders to CSV
     */
    static exportOrdersToCSV(orders: Order[], filename: string = 'orders.csv'): void {
        console.log('📄 [EXPORT] Exporting', orders.length, 'orders to CSV...');

        const csvData = orders.map(order => ({
            'Order ID': order.id,
            'Customer Name': order.addressSnapshot.name,
            'Customer Email': order.userId, // Note: userId is the email in many cases
            'Phone': order.addressSnapshot.phone,
            'Order Date': new Date(order.createdAt).toLocaleString(),
            'Status': order.orderStatus,
            'Payment Method': order.paymentMethod,
            'Payment Status': order.paymentStatus,
            'Items Count': order.items.length,
            'Subtotal': order.totals.subtotal.toFixed(2),
            'Shipping': order.totals.shipping.toFixed(2),
            'Tax': order.totals.tax.toFixed(2),
            'Discount': order.totals.discountTotal.toFixed(2),
            'Total': order.totals.total.toFixed(2),
            'Address': `${order.addressSnapshot.addressLine1}, ${order.addressSnapshot.city}, ${order.addressSnapshot.state} ${order.addressSnapshot.postalCode}`,
            'Carrier': order.carrier || '',
            'Tracking Number': order.trackingNumber || '',
        }));

        const csv = Papa.unparse(csvData);
        this.downloadCSV(csv, filename);
        console.log('✅ [EXPORT] Orders exported successfully');
    }

    /**
     * Export products to CSV
     */
    static exportProductsToCSV(products: Product[], filename: string = 'products.csv'): void {
        console.log('📄 [EXPORT] Exporting', products.length, 'products to CSV...');

        const csvData = products.map(product => ({
            'Product ID': product.id,
            'Name': product.name,
            'Category': product.category,
            'Price': formatPrice(product.price),
            'Stock': product.stock,
            'Status': product.isActive ? 'Active' : 'Inactive',
            'Featured': product.isFeatured ? 'Yes' : 'No',
            'Description': product.description.replace(/\n/g, ' '), // Remove newlines
            'Sizes': (product as any).sizes?.join(', ') || '',
            'Created At': new Date(product.createdAt).toLocaleString(),
        }));

        const csv = Papa.unparse(csvData);
        this.downloadCSV(csv, filename);
        console.log('✅ [EXPORT] Products exported successfully');
    }

    /**
     * Generate sales report for a date range
     */
    static generateSalesReport(
        orders: Order[],
        startDate: Date,
        endDate: Date,
        filename: string = 'sales-report.csv'
    ): void {
        console.log('📊 [EXPORT] Generating sales report...');

        // Filter orders by date range
        const filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= startDate && orderDate <= endDate && order.orderStatus !== 'cancelled';
        });

        // Calculate summary metrics
        const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totals.total, 0);
        const totalOrders = filteredOrders.length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Group by product for best sellers
        const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
        filteredOrders.forEach(order => {
            order.items.forEach(item => {
                const current = productSales.get(item.productId) || { name: item.name, quantity: 0, revenue: 0 };
                productSales.set(item.productId, {
                    name: item.name,
                    quantity: current.quantity + item.quantity,
                    revenue: current.revenue + (item.quantity * item.unitPrice),
                });
            });
        });

        // Create report data
        const reportData: any[] = [
            { 'Report': 'Sales Summary' },
            { 'Period': `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}` },
            { 'Total Orders': totalOrders },
            { 'Total Revenue': formatPrice(totalRevenue) },
            { 'Orders Count': orders.length },
            { 'Average Order Value': formatPrice(averageOrderValue) },
            {},
            { 'Top Products': '' },
        ];

        // Add top products
        const topProducts = Array.from(productSales.entries())
            .map(([id, data]) => data)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);

        topProducts.forEach((product, index) => {
            reportData.push({
                'Rank': (index + 1).toString(),
                'Product': product.name,
                'Units Sold': product.quantity,
                'Revenue': formatPrice(product.revenue),
            });
        });

        const csv = Papa.unparse(reportData);
        this.downloadCSV(csv, filename);
        console.log('✅ [EXPORT] Sales report generated');
    }

    /**
     * Download CSV file
     */
    private static downloadCSV(csvContent: string, filename: string): void {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}
