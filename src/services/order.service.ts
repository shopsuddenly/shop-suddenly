import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    Timestamp,
    increment,
    runTransaction,
    serverTimestamp
} from 'firebase/firestore';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';
import {
    Order,
    CreateOrderData,
    OrderStatus,
    OrderItem,
    CancellationReason,
    ReturnReason,
    ReturnResolution,
    PaymentStatus
} from '@/types/order';
import { Product } from '@/types/store';
import { ProductService } from './product.service';

const COLLECTION_ORDERS = 'orders';
const COLLECTION_PRODUCTS = 'products';

// Cancellation time window in hours
const CANCELLATION_WINDOW_HOURS = 24;

// Return window in days after delivery
const RETURN_WINDOW_DAYS = 3;

export class OrderService {
    /**
     * Generate unique order ID
     */
    private static generateOrderId(): string {
        return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }

    /**
     * Validate stock availability for all items
     */
    static async validateStock(items: OrderItem[]): Promise<{ valid: boolean; errors: string[] }> {
        console.log('📦 [ORDER SERVICE] Validating stock for', items.length, 'items');
        const errors: string[] = [];

        for (const item of items) {
            try {
                const product = await ProductService.getProductById(item.productId);

                if (!product) {
                    errors.push(`Product "${item.name}" not found`);
                    continue;
                }

                if (!product.isActive) {
                    errors.push(`Product "${item.name}" is no longer available`);
                    continue;
                }

                if (product.stock < item.quantity) {
                    errors.push(`"${item.name}" - Only ${product.stock} left in stock`);
                }
            } catch (error) {
                console.error('❌ [ORDER SERVICE] Error checking product:', item.productId, error);
                errors.push(`Unable to verify "${item.name}"`);
            }
        }

        console.log(errors.length === 0 ? '✅ [ORDER SERVICE] Stock validation passed' : '⚠️ [ORDER SERVICE] Stock validation failed', errors);
        return { valid: errors.length === 0, errors };
    }

    /**
     * Create a new order
     */
    /**
     * Create a new order with transactional stock decrement
     */
    static async createOrder(orderData: CreateOrderData): Promise<Order> {
        console.log('🛒 [ORDER SERVICE] Creating order for user:', orderData.userId);
        console.log('📦 [ORDER SERVICE] Incoming Order Data:', JSON.stringify(orderData, null, 2));
        console.log('🔑 [ORDER SERVICE] Razorpay Payment ID:', orderData.razorpayPaymentId);

        const orderId = this.generateOrderId();
        const now = new Date().toISOString();

        // Sanitize totals to remove undefined values (Firestore doesn't accept undefined)
        const sanitizedTotals = Object.fromEntries(
            Object.entries(orderData.totals).filter(([_, v]) => v !== undefined)
        );

        const order: Order = {
            id: orderId,
            userId: orderData.userId,
            customerEmail: orderData.customerEmail,
            items: orderData.items,
            totals: sanitizedTotals as any,
            addressSnapshot: orderData.addressSnapshot,
            paymentMethod: orderData.paymentMethod,
            paymentStatus: orderData.paymentStatus || 'pending',
            orderStatus: 'placed',
            createdAt: now,
            updatedAt: now,
            ...(orderData.notes && { notes: orderData.notes }),
            ...(orderData.razorpayOrderId && { razorpayOrderId: orderData.razorpayOrderId }),
            ...(orderData.razorpayPaymentId && { razorpayPaymentId: orderData.razorpayPaymentId }),
            ...(orderData.couponResult && {
                couponCode: orderData.couponResult.code,
                couponId: orderData.couponResult.couponId
            })
        };

        try {
            await runTransaction(db, async (transaction) => {
                // --- PHASE 1: READS (Strictly before any writes) ---

                // 1. Prepare Product Refs
                const productRefs = orderData.items.map(item => ({
                    ref: doc(db, COLLECTION_PRODUCTS, item.productId),
                    item
                }));

                // 2. Prepare Coupon Usage Ref (if applicable)
                let userUsageRef: any = null;
                if (orderData.couponResult && orderData.couponResult.couponId) {
                    const normalizedCode = orderData.couponResult.code.toUpperCase();
                    userUsageRef = doc(db, "users", orderData.userId, "coupon_usage", normalizedCode);
                }

                // 3. Execute ALL Reads in Parallel
                // We use Promise.all to ensure all gets are registered before we move to logic/writes
                const readPromises: Promise<any>[] = [
                    ...productRefs.map(p => transaction.get(p.ref))
                ];

                // Add user usage read if ref exists
                if (userUsageRef) {
                    readPromises.push(transaction.get(userUsageRef));
                }

                const readResults = await Promise.all(readPromises);

                // Extract Results
                // First N results are products
                const productSnaps = readResults.slice(0, productRefs.length);
                // Last result is user usage (if it exists)
                const userUsageSnap = userUsageRef ? readResults[readResults.length - 1] : null;


                // --- PHASE 2: LOGIC & WRITES (No more reads allowed) ---

                // 1. Validate & Decrement Stock (with Variant Support)
                for (let i = 0; i < productSnaps.length; i++) {
                    const snap = productSnaps[i];
                    const { item, ref } = productRefs[i];

                    if (!snap.exists()) {
                        throw new Error(`Product "${item.name}" not found`);
                    }

                    const productData = snap.data() as Product;

                    if (!productData.isActive) {
                        throw new Error(`Product "${item.name}" is no longer available`);
                    }

                    // Check if variant is specified
                    if (item.variantId && productData.variants && productData.variants.length > 0) {
                        // --- VARIANT STOCK LOGIC ---
                        const variantIndex = productData.variants.findIndex(v => v.id === item.variantId);

                        if (variantIndex === -1) {
                            throw new Error(`Variant not found for "${item.name}"`);
                        }

                        const variant = productData.variants[variantIndex];

                        if (variant.stock < item.quantity) {
                            throw new Error(`Only ${variant.stock} left for ${variant.name || item.variantId}`);
                        }

                        // Create updated variants array with decremented stock
                        const updatedVariants = [...productData.variants];
                        updatedVariants[variantIndex] = {
                            ...variant,
                            stock: variant.stock - item.quantity
                        };

                        // Recalculate total product stock from all variants
                        const newTotalStock = updatedVariants.reduce((sum, v) => sum + v.stock, 0);

                        // Write: Update variants array AND total stock
                        transaction.update(ref, {
                            variants: updatedVariants,
                            stock: newTotalStock
                        });
                    } else {
                        // --- NON-VARIANT (Simple) STOCK LOGIC ---
                        if (productData.stock < item.quantity) {
                            throw new Error(`Only ${productData.stock} left`);
                        }

                        const newStock = productData.stock - item.quantity;
                        transaction.update(ref, { stock: newStock });
                    }
                }

                // 2. Create Order (Write)
                const orderRef = doc(db, COLLECTION_ORDERS, orderId);
                transaction.set(orderRef, order);

                // 3. Update Coupon Usage (Write)
                if (orderData.couponResult && orderData.couponResult.couponId) {
                    // Global Count - Blind Increment (Write)
                    // We don't need to read the coupon doc to increment it, 
                    // unless we want to validate max limit *again* inside transaction.
                    // For now, simple increment.
                    const couponRef = doc(db, "coupons", orderData.couponResult.couponId);
                    transaction.update(couponRef, { usedCount: increment(1) });

                    // User Count (Write)
                    if (userUsageRef) {
                        if (userUsageSnap && userUsageSnap.exists()) {
                            transaction.update(userUsageRef, {
                                count: increment(1),
                                lastUsedAt: serverTimestamp()
                            });
                        } else {
                            // If doc doesn't exist, Create it
                            transaction.set(userUsageRef, {
                                count: 1,
                                lastUsedAt: serverTimestamp()
                            });
                        }
                    }
                }

                // 4. Update User Stats for Audience Segmentation
                const userRef = doc(db, "users", orderData.userId);
                transaction.update(userRef, {
                    lastOrderAt: now,
                    orderCount: increment(1)
                });
            });

            console.log('✅ [ORDER SERVICE] Order created successfully & Stock updated:', orderId);
            return order;
        } catch (error: any) {
            // Log as warning for validation errors, error for system failures
            if (error.message.includes('left') || error.message.includes('stock')) {
                console.warn('⚠️ [ORDER SERVICE] Validation failed:', error.message);
            } else {
                console.error('❌ [ORDER SERVICE] Failed to create order:', error);
            }
            throw new Error(error.message || 'Failed to create order. Please try again.');
        }
    }

    /**
     * Get order by ID
     */
    static async getOrderById(orderId: string): Promise<Order | null> {
        console.log('📄 [ORDER SERVICE] Fetching order:', orderId);

        try {
            const orderRef = doc(db, COLLECTION_ORDERS, orderId);
            const orderSnap = await getDoc(orderRef);

            if (!orderSnap.exists()) {
                console.log('⚠️ [ORDER SERVICE] Order not found:', orderId);
                return null;
            }

            const order = orderSnap.data() as Order;
            console.log('✅ [ORDER SERVICE] Order retrieved:', orderId);
            return order;
        } catch (error) {
            console.error('❌ [ORDER SERVICE] Error fetching order:', error);
            throw error;
        }
    }

    /**
     * Get all orders for a user
     */
    static async getUserOrders(userId: string): Promise<Order[]> {
        console.log('📋 [ORDER SERVICE] Fetching orders for user:', userId);

        try {
            const ordersRef = collection(db, COLLECTION_ORDERS);
            const q = query(
                ordersRef,
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const orders = querySnapshot.docs.map(doc => doc.data() as Order);

            console.log('✅ [ORDER SERVICE] Retrieved', orders.length, 'orders for user');
            return orders;
        } catch (error) {
            console.error('❌ [ORDER SERVICE] Error fetching user orders:', error);
            throw error;
        }
    }

    /**
     * Get all orders (admin only)
     */
    static async getAllOrders(filters?: {
        status?: OrderStatus;
        paymentMethod?: string;
        limit?: number;
    }): Promise<Order[]> {
        console.log('📋 [ORDER SERVICE] Fetching all orders with filters:', filters);

        try {
            const ordersRef = collection(db, COLLECTION_ORDERS);
            let q = query(ordersRef, orderBy('createdAt', 'desc'));

            if (filters?.status) {
                q = query(q, where('orderStatus', '==', filters.status));
            }

            if (filters?.paymentMethod) {
                q = query(q, where('paymentMethod', '==', filters.paymentMethod));
            }

            const querySnapshot = await getDocs(q);
            let orders = querySnapshot.docs.map(doc => doc.data() as Order);

            if (filters?.limit) {
                orders = orders.slice(0, filters.limit);
            }

            console.log('✅ [ORDER SERVICE] Retrieved', orders.length, 'orders');
            return orders;
        } catch (error) {
            console.error('❌ [ORDER SERVICE] Error fetching orders:', error);
            throw error;
        }
    }

    /**
     * Update order status (admin only)
     */
    static async updateOrderStatus(
        orderId: string,
        status: OrderStatus,
        adminNotes?: string
    ): Promise<void> {
        console.log('🔄 [ORDER SERVICE] Updating order status:', orderId, '→', status);

        try {
            const orderRef = doc(db, COLLECTION_ORDERS, orderId);
            const updates: Partial<Order> = {
                orderStatus: status,
                updatedAt: new Date().toISOString()
            };

            if (adminNotes) {
                updates.adminNotes = adminNotes;
            }

            // Update payment status for delivered orders
            if (status === 'delivered') {
                updates.paymentStatus = 'paid';
                updates.deliveredAt = new Date().toISOString();
            }

            await updateDoc(orderRef, updates);
            console.log('✅ [ORDER SERVICE] Order status updated successfully');
        } catch (error) {
            console.error('❌ [ORDER SERVICE] Error updating order status:', error);
            throw error;
        }
    }

    /**
     * Update tracking number
     */
    static async updateTrackingNumber(orderId: string, trackingNumber: string): Promise<void> {
        console.log('🚚 [ORDER SERVICE] Adding tracking number:', orderId);

        try {
            const orderRef = doc(db, COLLECTION_ORDERS, orderId);
            await updateDoc(orderRef, {
                trackingNumber,
                updatedAt: new Date().toISOString()
            });
            console.log('✅ [ORDER SERVICE] Tracking number added');
        } catch (error) {
            console.error('❌ [ORDER SERVICE] Error updating tracking:', error);
            throw error;
        }
    }

    /**
     * Check if order can be cancelled
     */
    static canCancelOrder(order: Order): boolean {
        // Already cancelled
        if (order.orderStatus === 'cancelled') {
            return false;
        }

        // Cannot cancel delivered orders
        if (order.orderStatus === 'delivered') {
            return false;
        }

        // Check time window (2 hours from order creation)
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        const hoursSinceOrder = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);

        if (hoursSinceOrder > CANCELLATION_WINDOW_HOURS) {
            return false;
        }

        // Can only cancel before shipped (placed or packed status)
        return ['placed', 'packed'].includes(order.orderStatus);
    }

    static async cancelOrder(
        orderId: string,
        reason: CancellationReason,
        cancelledBy: 'user' | 'admin',
        customReason?: string
    ): Promise<void> {
        console.log('🚫 [ORDER SERVICE] Cancelling order:', orderId);

        let orderData: Order | null = null;

        try {
            // 1. Transaction: Cancel Order & Restore Stock
            await runTransaction(db, async (transaction) => {
                const orderRef = doc(db, COLLECTION_ORDERS, orderId);
                const orderSnap = await transaction.get(orderRef);

                if (!orderSnap.exists()) {
                    throw new Error('Order not found');
                }

                const order = orderSnap.data() as Order;
                orderData = order; // Capture for post-transaction logic

                // Check if cancellation is allowed
                if (!this.canCancelOrder(order)) {
                    throw new Error('This order cannot be cancelled');
                }

                // Restore Stock
                for (const item of order.items) {
                    const productRef = doc(db, COLLECTION_PRODUCTS, item.productId);
                    const productSnap = await transaction.get(productRef);

                    if (productSnap.exists()) {
                        const currentStock = productSnap.data().stock || 0;
                        transaction.update(productRef, { stock: currentStock + item.quantity });
                    }
                }

                // Update Order Status
                // Note: We do NOT set 'refunded' yet for ONLINE payments.
                // We keep it as is (likely 'paid') until actual refund succeeds.
                // For COD, we can 'close' the payment status to 'failed' or 'refunded'.
                const newPaymentStatus = order.paymentMethod === 'COD' ? 'refunded' : order.paymentStatus;

                transaction.update(orderRef, {
                    orderStatus: 'cancelled',
                    cancellationReason: reason,
                    cancelledAt: new Date().toISOString(),
                    cancelledBy: cancelledBy,
                    paymentStatus: newPaymentStatus,
                    updatedAt: new Date().toISOString(),
                    ...(customReason && { adminNotes: customReason })
                });
            });

            console.log('✅ [ORDER SERVICE] Order cancelled & Stock restored from DB:', orderId);

            // 2. Post-Transaction: Trigger Auto-Refund for Online Paid Orders

            // Detailed Logging for Debugging
            console.log('🔍 [ORDER SERVICE] Checking Auto-Refund Conditions for Order:', orderId);
            if (orderData) {
                console.log(`   - Payment Method: ${(orderData as Order).paymentMethod}`);
                console.log(`   - Payment Status: ${(orderData as Order).paymentStatus}`);
                console.log(`   - Razorpay Payment ID: ${(orderData as Order).razorpayPaymentId}`);
            } else {
                console.log('   - orderData is null! This should not happen after transaction.');
            }

            if (orderData && (orderData as Order).paymentMethod === 'ONLINE' && (orderData as Order).paymentStatus === 'paid' && (orderData as Order).razorpayPaymentId) {
                const pId = (orderData as Order).razorpayPaymentId!;
                console.log('💸 [ORDER SERVICE] Initiating Auto-Refund for:', pId);

                try {
                    const response = await fetch('/api/payment/refund', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            paymentId: pId
                        })
                    });

                    if (!response.ok) {
                        const errData = await response.json();
                        throw new Error(errData.details || 'Refund API failed');
                    }

                    console.log('✅ [ORDER SERVICE] Auto-Refund successful');

                    // 3. Update Status to Refunded
                    await updateDoc(doc(db, COLLECTION_ORDERS, orderId), {
                        paymentStatus: 'refunded',
                        adminNotes: ((orderData as Order).adminNotes ? (orderData as Order).adminNotes + '\n' : '') + 'System: Auto-refunded successfully'
                    });

                } catch (refundError: any) {
                    console.error('❌ [ORDER SERVICE] Auto-Refund Failed:', refundError);
                    // Update status to indicate failure (keeping 'paid' implies we still hold money => manual refund needed)
                    // We append a note for admin.
                    await updateDoc(doc(db, COLLECTION_ORDERS, orderId), {
                        adminNotes: ((orderData as Order).adminNotes ? (orderData as Order).adminNotes + '\n' : '') + `System: Auto-refund FAILED. Error: ${refundError.message}. Please refund manually.`
                    });
                    toast.error("Order cancelled, but auto-refund failed. Please contact support.");
                }
            } else {
                if (orderData && (orderData as Order).paymentMethod === 'ONLINE' && (orderData as Order).paymentStatus !== 'paid') {
                    // If online but not paid (pending/failed), ensure it is marked failed/refunded?
                    // The transaction above kept it as is.
                    // We might want to ensure it's closed.
                    await updateDoc(doc(db, COLLECTION_ORDERS, orderId), {
                        paymentStatus: 'failed'
                    });
                }
            }

        } catch (error: any) {
            console.error('❌ [ORDER SERVICE] Error cancelling order:', error);
            throw new Error(error.message || 'Failed to cancel order');
        }
    }

    /**
     * Update tracking information
     */
    static async updateTrackingInfo(
        orderId: string,
        carrier: string,
        trackingNumber: string,
        trackingUrl?: string,
        estimatedDeliveryDate?: string
    ): Promise<void> {
        console.log('🚚 [ORDER SERVICE] Updating tracking info:', orderId);

        try {
            const orderRef = doc(db, COLLECTION_ORDERS, orderId);
            const updates: Partial<Order> = {
                carrier,
                trackingNumber,
                updatedAt: new Date().toISOString()
            };

            if (trackingUrl) {
                updates.trackingUrl = trackingUrl;
            }

            if (estimatedDeliveryDate) {
                updates.estimatedDeliveryDate = estimatedDeliveryDate;
            }

            await updateDoc(orderRef, updates);
            console.log('✅ [ORDER SERVICE] Tracking info updated');
        } catch (error) {
            console.error('❌ [ORDER SERVICE] Error updating tracking:', error);
            throw error;
        }
    }

    // Check if return window is open (within 3 days of delivery)
    static isReturnWindowOpen(order: Order): boolean {
        if (order.orderStatus !== 'delivered') return false;
        if (!order.deliveredAt) return false;

        const deliveredDate = new Date(order.deliveredAt);
        const now = new Date();
        const daysSinceDelivery = (now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24);

        return daysSinceDelivery <= RETURN_WINDOW_DAYS;
    }

    // Request return (user)
    static async requestReturn(
        orderId: string,
        reason: ReturnReason,
        details?: string
    ): Promise<void> {
        console.log('🔄 [ORDER SERVICE] Requesting return for order:', orderId);

        try {
            const order = await this.getOrderById(orderId);
            if (!order) {
                throw new Error('Order not found');
            }

            if (!this.isReturnWindowOpen(order)) {
                throw new Error('Return window has expired (3 days after delivery)');
            }

            if (order.returnRequest) {
                throw new Error('Return request already submitted');
            }

            const orderRef = doc(db, COLLECTION_ORDERS, orderId);
            await updateDoc(orderRef, {
                orderStatus: 'return_requested',
                returnRequest: {
                    requestedAt: new Date().toISOString(),
                    reason,
                    details: details || '',
                    status: 'pending'
                },
                updatedAt: new Date().toISOString()
            });

            console.log('✅ [ORDER SERVICE] Return requested');
        } catch (error) {
            console.error('❌ [ORDER SERVICE] Error requesting return:', error);
            throw error;
        }
    }

    // Process return request (admin)
    static async processReturn(
        orderId: string,
        approve: boolean,
        resolution?: ReturnResolution,
        adminNotes?: string
    ): Promise<void> {
        console.log('🔄 [ORDER SERVICE] Processing return for order:', orderId, approve ? 'APPROVE' : 'REJECT');

        try {
            const order = await this.getOrderById(orderId);
            if (!order) {
                throw new Error('Order not found');
            }

            if (!order.returnRequest || order.returnRequest.status !== 'pending') {
                throw new Error('No pending return request found');
            }

            const orderRef = doc(db, COLLECTION_ORDERS, orderId);

            if (approve) {
                if (!resolution) {
                    throw new Error('Resolution type required for approval');
                }

                const newStatus: OrderStatus = resolution === 'refund' ? 'refunded' : 'replaced';

                await updateDoc(orderRef, {
                    orderStatus: 'return_approved',
                    'returnRequest.status': 'approved',
                    'returnRequest.resolution': resolution,
                    'returnRequest.adminNotes': adminNotes || '',
                    'returnRequest.processedAt': new Date().toISOString(),
                    paymentStatus: resolution === 'refund' ? 'refunded' : order.paymentStatus,
                    updatedAt: new Date().toISOString()
                });
            } else {
                await updateDoc(orderRef, {
                    orderStatus: 'return_rejected',
                    'returnRequest.status': 'rejected',
                    'returnRequest.adminNotes': adminNotes || '',
                    'returnRequest.processedAt': new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }

            console.log('✅ [ORDER SERVICE] Return processed:', approve ? 'approved' : 'rejected');
        } catch (error) {
            console.error('❌ [ORDER SERVICE] Error processing return:', error);
            throw error;
        }
    }

    // Create replacement order (admin)
    static async createReplacementOrder(originalOrderId: string): Promise<Order> {
        console.log('🔄 [ORDER SERVICE] Creating replacement order for:', originalOrderId);

        try {
            const originalOrder = await this.getOrderById(originalOrderId);
            if (!originalOrder) {
                throw new Error('Original order not found');
            }

            // Create new order with same items, address, etc.
            const replacementOrderData: CreateOrderData = {
                userId: originalOrder.userId,
                customerEmail: originalOrder.customerEmail || '',
                items: originalOrder.items,
                totals: {
                    ...originalOrder.totals,
                    total: 0 // Free replacement
                },
                addressSnapshot: originalOrder.addressSnapshot,
                paymentMethod: 'COD', // Replacement is free
                notes: `Replacement for order ${originalOrderId}`
            };

            const newOrder = await this.createOrder(replacementOrderData);

            // Link replacement order to original
            const originalOrderRef = doc(db, COLLECTION_ORDERS, originalOrderId);
            await updateDoc(originalOrderRef, {
                orderStatus: 'replaced',
                'returnRequest.replacementOrderId': newOrder.id,
                updatedAt: new Date().toISOString()
            });

            console.log('✅ [ORDER SERVICE] Replacement order created:', newOrder.id);
            return newOrder;
        } catch (error) {
            console.error('❌ [ORDER SERVICE] Error creating replacement order:', error);
            throw error;
        }
    }

    // Get all orders with return requests (admin)
    static async getReturnRequests(status?: 'pending' | 'approved' | 'rejected'): Promise<Order[]> {
        console.log('🔄 [ORDER SERVICE] Fetching return requests...');

        try {
            const ordersRef = collection(db, COLLECTION_ORDERS);
            const snapshot = await getDocs(ordersRef);

            const orders: Order[] = [];
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                // Only include orders that have a returnRequest
                if (data.returnRequest) {
                    // Filter by status if provided
                    if (status && data.returnRequest.status !== status) {
                        return;
                    }
                    orders.push({
                        id: doc.id,
                        ...data
                    } as Order);
                }
            });

            // Sort by requestedAt (newest first)
            orders.sort((a, b) => {
                const dateA = new Date(a.returnRequest?.requestedAt || 0);
                const dateB = new Date(b.returnRequest?.requestedAt || 0);
                return dateB.getTime() - dateA.getTime();
            });

            console.log('✅ [ORDER SERVICE] Found', orders.length, 'return requests');
            return orders;
        } catch (error) {
            console.error('❌ [ORDER SERVICE] Error fetching return requests:', error);
            throw error;
        }
    }

    // Create replacement order with custom items (admin)
    static async createCustomReplacementOrder(
        originalOrderId: string,
        items: OrderItem[]
    ): Promise<Order> {
        console.log('🔄 [ORDER SERVICE] Creating custom replacement order for:', originalOrderId);

        try {
            const originalOrder = await this.getOrderById(originalOrderId);
            if (!originalOrder) {
                throw new Error('Original order not found');
            }

            // Calculate totals for replacement (free)
            const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

            const replacementOrderData: CreateOrderData = {
                userId: originalOrder.userId,
                customerEmail: originalOrder.customerEmail || '',
                items,
                totals: {
                    subtotal,
                    tax: 0,
                    shipping: 0,
                    discountTotal: subtotal, // Full discount for replacement
                    total: 0 // Free replacement
                },
                addressSnapshot: originalOrder.addressSnapshot,
                paymentMethod: 'COD',
                notes: `Replacement for order ${originalOrderId}`
            };

            const newOrder = await this.createOrder(replacementOrderData);

            // Link replacement order to original and approve return
            const originalOrderRef = doc(db, COLLECTION_ORDERS, originalOrderId);
            await updateDoc(originalOrderRef, {
                orderStatus: 'replaced',
                'returnRequest.status': 'approved',
                'returnRequest.resolution': 'replacement',
                'returnRequest.replacementOrderId': newOrder.id,
                'returnRequest.processedAt': new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            console.log('✅ [ORDER SERVICE] Custom replacement order created:', newOrder.id);
            return newOrder;
        } catch (error) {
            console.error('❌ [ORDER SERVICE] Error creating custom replacement order:', error);
            throw error;
        }
    }
}

