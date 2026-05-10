export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string; // Changed from image
    isFeatured?: boolean; // Added
    createdAt: string;
    updatedAt?: string; // Added
    parentId?: string | null; // [NEW] For subcategories
    type?: 'CATEGORY' | 'SUBCATEGORY'; // [NEW] Explicit type
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    mrp?: number;
    categoryId: string;
    images: string[];
    tags?: string[];
    keywords?: string[]; // For search optimization
    stock: number;

    // Enhanced Filtering Fields
    brand?: string;
    rating?: {
        rate: number;
        count: number;
    };
    attributes?: {
        [key: string]: string[]; // e.g. { "Color": ["Red"], "Size": ["M"] }
    };
    sales?: number; // For "Popularity" sort

    isFeatured: boolean;
    isActive: boolean;
    category?: Category; // Populated field
    createdAt: string;
    updatedAt?: string;

    // Ratings & Reviews
    averageRating?: number;
    reviewCount?: number;
    customBadge?: string; // [NEW] Custom label like 'Winter Drop'

    // [NEW] Variants System
    variants?: ProductVariant[];

    // [Advanced Variant Logic]
    // Mapping of color names to specific image galleries
    colorMedia?: Record<string, string[]>;
    sku?: string; // [NEW] Added for base product identification
}

export interface ProductVariant {
    id: string; // SKU or UUID
    name: string; // e.g. "Size M / Red"
    attributes: {
        [key: string]: string | number; // Support numbers for sizes (e.g., 32, 34)
    };
    stock: number;
    price?: number; // Optional override
    sku?: string;
}

export interface Review {
    id: string;
    userId: string;
    userName: string;
    productId: string;
    rating: number;
    title?: string; // [NEW] Review title
    comment: string;
    createdAt: any; // Firestore Timestamp or string
    verifiedPurchase?: boolean;
    status: 'pending' | 'approved' | 'rejected'; // [NEW] Moderation status
}


export interface CartItem {
    // Core Identifier
    id: string; // Unique ID for the line item (essential for UI keys)
    productId: string;
    variantId?: string; // Optional variant (size/color ID)

    // Quantity
    quantity: number;

    // Price Snapshot (Frozen at time of add, but usually refreshed on cart load)
    unitPrice: number;

    // Discount info
    appliedDiscount?: {
        code?: string;
        amount: number; // Absolute amount per unit or total? Usually per unit or distinct. Let's say per unit for now or total line discount. 
        // Simpler: total discount value for this item 
    };

    // Metadata
    createdAt: string;
    updatedAt?: string;

    // Computed / Populated (Frontend Only - not saved to DB)
    product?: Product;
}

export interface Cart {
    userId: string;
    items: CartItem[];
    subtotal: number;
    discountTotal: number;
    shipping: number;
    tax: number;
    total: number;
    updatedAt: string;
    // [NEW] Coupon applied to entire cart
    couponCode?: string;
    couponDiscount?: number;
}

export interface Coupon {
    id?: string;
    code: string;
    description?: string; // [NEW] Description for UI
    type: 'PERCENTAGE' | 'FIXED' | 'BOGO';
    value: number; // For BOGO, this could be 0 or 100 (100% off usually)
    minPurchase?: number;
    maxDiscount?: number;
    startDate: string;
    endDate: string;
    usageLimit?: number; // Global limit
    limitPerUser?: number; // [NEW] Limit per user
    buyQuantity?: number; // [NEW] For BOGO (Buy X)
    getQuantity?: number; // [NEW] For BOGO (Get Y)
    validPaymentMethods?: string[]; // [NEW] Restricted payment methods
    usedCount: number;
    isActive: boolean;
    createdAt: string;
}
