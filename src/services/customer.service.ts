import { collection, getDocs, doc, getDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types/order';

const COLLECTION_USERS = 'users';
const COLLECTION_ORDERS = 'orders';

export interface Customer {
    id: string;
    email: string;
    displayName: string | null;
    photoURL: string | null;
    role: string;
    createdAt: string;
}

export interface CustomerStats {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    lastOrderDate: string | null;
    ordersByStatus: {
        placed: number;
        packed: number;
        shipped: number;
        delivered: number;
        cancelled: number;
    };
}

export class CustomerService {
    /**
     * Get all customers
     */
    static async getAllCustomers(): Promise<Customer[]> {
        console.log('👥 [CUSTOMER SERVICE] Fetching all customers...');

        try {
            const usersRef = collection(db, COLLECTION_USERS);
            const usersSnapshot = await getDocs(usersRef);

            const customers = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Customer));

            console.log('✅ [CUSTOMER SERVICE] Retrieved', customers.length, 'customers');
            return customers;
        } catch (error) {
            console.error('❌ [CUSTOMER SERVICE] Error fetching customers:', error);
            throw error;
        }
    }

    /**
     * Get customer by ID
     */
    static async getCustomerById(userId: string): Promise<Customer | null> {
        console.log('👤 [CUSTOMER SERVICE] Fetching customer:', userId);

        try {
            const userRef = doc(db, COLLECTION_USERS, userId);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                console.log('⚠️ [CUSTOMER SERVICE] Customer not found');
                return null;
            }

            const customer = {
                id: userSnap.id,
                ...userSnap.data()
            } as Customer;

            console.log('✅ [CUSTOMER SERVICE] Customer retrieved');
            return customer;
        } catch (error) {
            console.error('❌ [CUSTOMER SERVICE] Error fetching customer:', error);
            throw error;
        }
    }

    /**
     * Get customer statistics
     */
    static async getCustomerStats(userId: string): Promise<CustomerStats> {
        console.log('📊 [CUSTOMER SERVICE] Calculating stats for:', userId);

        try {
            const ordersRef = collection(db, COLLECTION_ORDERS);
            const q = query(
                ordersRef,
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            const ordersSnapshot = await getDocs(q);
            const orders = ordersSnapshot.docs.map(doc => doc.data() as Order);

            // Calculate totals
            const totalOrders = orders.length;
            const totalSpent = orders
                .filter(order => order.orderStatus !== 'cancelled')
                .reduce((sum, order) => sum + order.totals.total, 0);

            const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

            const lastOrderDate = orders.length > 0 ? orders[0].createdAt : null;

            // Count by status
            const ordersByStatus = {
                placed: orders.filter(o => o.orderStatus === 'placed').length,
                packed: orders.filter(o => o.orderStatus === 'packed').length,
                shipped: orders.filter(o => o.orderStatus === 'shipped').length,
                delivered: orders.filter(o => o.orderStatus === 'delivered').length,
                cancelled: orders.filter(o => o.orderStatus === 'cancelled').length,
            };

            const stats: CustomerStats = {
                totalOrders,
                totalSpent,
                averageOrderValue,
                lastOrderDate,
                ordersByStatus,
            };

            console.log('✅ [CUSTOMER SERVICE] Stats calculated');
            return stats;
        } catch (error) {
            console.error('❌ [CUSTOMER SERVICE] Error calculating stats:', error);
            throw error;
        }
    }

    /**
     * Get customer orders
     */
    static async getCustomerOrders(userId: string): Promise<Order[]> {
        console.log('📦 [CUSTOMER SERVICE] Fetching orders for:', userId);

        try {
            const ordersRef = collection(db, COLLECTION_ORDERS);
            const q = query(
                ordersRef,
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            const ordersSnapshot = await getDocs(q);
            const orders = ordersSnapshot.docs.map(doc => doc.data() as Order);

            console.log('✅ [CUSTOMER SERVICE] Retrieved', orders.length, 'orders');
            return orders;
        } catch (error) {
            console.error('❌ [CUSTOMER SERVICE] Error fetching customer orders:', error);
            throw error;
        }
    }
}
