// Order System Types

export type OrderStatus =
    | 'placed'
    | 'packed'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'return_requested'
    | 'return_approved'
    | 'return_rejected'
    | 'refunded'
    | 'replaced';

export type PaymentMethod = 'COD' | 'UPI' | 'CARD' | 'WALLET' | 'ONLINE';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

// Cancellation reasons
export type CancellationReason =
    | 'changed_mind'
    | 'found_better_price'
    | 'ordered_by_mistake'
    | 'incorrect_address'
    | 'delivery_delay'
    | 'other';

// Return reasons
export type ReturnReason =
    | 'defective'
    | 'wrong_item'
    | 'not_as_described'
    | 'size_issue'
    | 'quality_issue'
    | 'damaged_in_transit'
    | 'other';

export type ReturnResolution = 'refund' | 'replacement';
export type ReturnStatus = 'pending' | 'approved' | 'rejected';

export interface ReturnRequest {
    requestedAt: string;
    reason: ReturnReason;
    details?: string;
    status: ReturnStatus;
    resolution?: ReturnResolution;
    adminNotes?: string;
    processedAt?: string;
    replacementOrderId?: string;
}

export interface OrderItem {
    productId: string;
    name: string;
    variantId?: string;
    size?: string;
    image: string;
    quantity: number;
    unitPrice: number;
}

export interface OrderAddress {
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

export interface OrderTotals {
    subtotal: number;
    tax: number;
    shipping: number;
    discountTotal: number;
    total: number;
}

export interface Order {
    id: string;
    userId: string;
    items: OrderItem[];
    totals: OrderTotals;
    addressSnapshot: OrderAddress;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    orderStatus: OrderStatus;
    createdAt: string;
    updatedAt: string;
    notes?: string;
    adminNotes?: string;
    trackingNumber?: string;
    couponCode?: string;
    couponId?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;

    // Cancellation fields
    cancellationReason?: CancellationReason;
    cancelledAt?: string;
    cancelledBy?: 'user' | 'admin';

    // Enhanced tracking fields
    carrier?: string;
    trackingUrl?: string;
    estimatedDeliveryDate?: string;

    // Email for notifications
    customerEmail?: string;

    // Delivery timestamp (for return window calculation)
    deliveredAt?: string;

    // Return request
    returnRequest?: ReturnRequest;
}

// For creating new orders (without id, timestamps)
export interface CreateOrderData {
    userId: string;
    customerEmail: string; // Required for notifications
    items: OrderItem[];
    totals: OrderTotals;
    addressSnapshot: OrderAddress;
    paymentMethod: PaymentMethod;
    notes?: string;
    couponResult?: {
        code: string;
        discountAmount: number;
        couponId: string;
    };
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    paymentStatus?: PaymentStatus;
}

