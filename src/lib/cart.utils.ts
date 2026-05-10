import { CartItem, Coupon } from "@/types/store";

export interface CartTotals {
    subtotal: number;
    tax: number;
    shipping: number;
    discountTotal: number;
    total: number;
    couponCodes?: string[];
    couponDiscount?: number;
}

export const calculateCartTotals = (items: CartItem[], coupons: Coupon[] = []): CartTotals => {
    const subtotal = items.reduce((sum, item) => sum + (Number(item.unitPrice) * item.quantity), 0);

    // Item-level discounts
    const itemDiscounts = items.reduce((sum, item) => sum + (item.appliedDiscount?.amount || 0), 0);

    // Coupon Discount
    let totalCouponDiscount = 0;
    const appliedCodes: string[] = [];

    // Sum up discounts from all coupons
    coupons.forEach(coupon => {
        let discount = 0;
        if (coupon.type === 'PERCENTAGE') {
            const rawDiscount = (subtotal * coupon.value) / 100;
            discount = coupon.maxDiscount ? Math.min(rawDiscount, coupon.maxDiscount) : rawDiscount;
        } else if (coupon.type === 'FIXED') {
            discount = coupon.value;
        } else if (coupon.type === 'BOGO') {
            const buyQty = coupon.buyQuantity || 1;
            const getQty = coupon.getQuantity || 1;
            const groupSize = buyQty + getQty;

            // Iterate through each item separately (Same Item BOGO)
            items.forEach(item => {
                if (item.quantity >= groupSize) {
                    const freeSets = Math.floor(item.quantity / groupSize);
                    const freeQty = freeSets * getQty;
                    discount += freeQty * Number(item.unitPrice);
                }
            });
        }
        totalCouponDiscount += discount;
        appliedCodes.push(coupon.code);
    });

    const totalDiscount = itemDiscounts + totalCouponDiscount;

    // Shipping Rule
    const FREE_SHIPPING_THRESHOLD = 1; // Updated to 1000 as per user request
    const FLAT_SHIPPING_RATE = 1;
    const shipping = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_RATE;

    const tax = 0;

    const total = Math.max(0, subtotal - totalDiscount + shipping + tax);

    return {
        subtotal,
        discountTotal: totalDiscount,
        shipping,
        tax,
        total,
        couponCodes: appliedCodes,
        couponDiscount: totalCouponDiscount
    };
};

/**
 * Validates if the cart items are in stock.
 * In a real app, this would check against the latest stock from the DB.
 * Here we assume the checking happens before this utility is called, or we pass the stock map.
 */
export const validateStockBeforeCheckout = (items: CartItem[]): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    items.forEach(item => {
        if (item.product && item.quantity > item.product.stock) {
            errors.push(`Sorry, only ${item.product.stock} units of ${item.product.name} are available.`);
        }
    });

    return {
        valid: errors.length === 0,
        errors
    };
};
