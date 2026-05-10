import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, limit, query, where, addDoc, updateDoc, orderBy, serverTimestamp } from "firebase/firestore";
import { Category, Product, Review } from "@/types/store";

// [CACHE] In-memory storage for products to reduce read costs
const productCache = new Map<string, { data: Product, timestamp: number }>();
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 Minutes

export const ProductService = {
    async getCategories(): Promise<Category[]> {
        try {
            const q = query(collection(db, "categories"));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Category);
        } catch (error) {
            console.error("Firebase Error (getCategories):", error);
            return [];
        }
    },

    async getFeaturedProducts(): Promise<Product[]> {
        try {
            const q = query(
                collection(db, "products"),
                where("isFeatured", "==", true),
                where("isActive", "==", true),
                limit(8)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Product);
        } catch (error) {
            console.error("Firebase Error (getFeaturedProducts):", error);
            return [];
        }
    },

    async getAllProducts(): Promise<Product[]> {
        try {
            const q = query(collection(db, "products"), where("isActive", "==", true));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Product);
        } catch (error) {
            console.error("Firebase Error (getAllProducts):", error);
            return [];
        }
    },

    async getAdminProducts(): Promise<Product[]> {
        try {
            const q = query(collection(db, "products"));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Product);
        } catch (error) {
            console.error("Firebase Error (getAdminProducts):", error);
            return [];
        }
    },

    async getProductsByCategory(categoryId: string): Promise<Product[]> {
        try {
            const q = query(
                collection(db, "products"),
                where("categoryId", "==", categoryId),
                where("isActive", "==", true)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Product);
        } catch (error) {
            console.error("Firebase Error (getProductsByCategory):", error);
            return [];
        }
    },

    async getAdminProductsByCategory(categoryId: string): Promise<Product[]> {
        try {
            const q = query(
                collection(db, "products"),
                where("categoryId", "==", categoryId)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Product);
        } catch (error) {
            console.error("Firebase Error (getAdminProductsByCategory):", error);
            return [];
        }
    },

    async getProductBySlug(slug: string): Promise<Product | null> {
        try {
            // [CACHE] Step 1: Check Cache
            const cached = productCache.get(slug);
            const now = Date.now();

            if (cached) {
                const isFresh = (now - cached.timestamp) < CACHE_DURATION_MS;
                if (isFresh) {
                    console.log(`⚡ [Cache Hit] Serving product from RAM: ${slug}`);
                    return cached.data;
                }
            }

            console.log(`☁️ [Cache Miss] Fetching from Firestore: ${slug}`);

            const q = query(
                collection(db, "products"),
                where("slug", "==", slug),
                limit(1)
            );
            const snapshot = await getDocs(q);
            if (snapshot.empty) return null;

            // Should we return inactive products? 
            // Standard getProductBySlug is public-facing, so usually NO.
            // But let's check isActive flag before returning.
            const data = snapshot.docs[0].data();
            if (!data.isActive) return null;

            const product = { id: snapshot.docs[0].id, ...data } as Product;

            // [CACHE] Step 2: Save to Cache
            productCache.set(slug, {
                data: product,
                timestamp: now
            });

            return product;
        } catch (error) {
            console.error("Firebase Error (getProductBySlug):", error);
            return null;
        }
    },

    async checkSlugAvailability(slug: string, excludeId?: string): Promise<boolean> {
        try {
            const q = query(
                collection(db, "products"),
                where("slug", "==", slug)
            );
            const snapshot = await getDocs(q);

            if (snapshot.empty) return true;

            // If we find matches, check if it's just the current product itself
            if (excludeId && snapshot.docs.length === 1 && snapshot.docs[0].id === excludeId) {
                return true;
            }

            return false;
        } catch (error) {
            console.error("Firebase Error (checkSlugAvailability):", error);
            // Fail safe: Assume taken to prevent overwrite if DB error
            return false;
        }
    },

    async getProductById(productId: string): Promise<Product | null> {
        try {
            const productRef = doc(db, "products", productId);
            const productSnap = await getDoc(productRef);

            if (!productSnap.exists()) return null;

            return { id: productSnap.id, ...productSnap.data() } as Product;
        } catch (error) {
            console.error("Firebase Error (getProductById):", error);
            return null;
        }
    },

    async getRelatedProducts(categoryId: string, excludeId: string): Promise<Product[]> {
        try {
            const q = query(
                collection(db, "products"),
                where("categoryId", "==", categoryId),
                where("isActive", "==", true),
                limit(5)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }) as Product)
                .filter(p => p.id !== excludeId)
                .slice(0, 4);
        } catch (error) {
            console.error("Firebase Error (getRelatedProducts):", error);
            return [];
        }
    },

    // Ratings & Reviews

    // Public: Only fetch approved reviews
    async getReviews(productId: string): Promise<Review[]> {
        try {
            const q = query(
                collection(db, "reviews"),
                where("productId", "==", productId),
                where("status", "==", "approved"), // [NEW] Filter by status
                orderBy("createdAt", "desc")
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Review);
        } catch (error) {
            console.warn("Firebase Error (getReviews):", error);
            // Fallback: returning empty array
            return [];
        }
    },

    // Admin: Fetch all reviews
    async getAdminReviews(): Promise<Review[]> {
        try {
            const q = query(
                collection(db, "reviews"),
                orderBy("createdAt", "desc")
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Review);
        } catch (error) {
            console.error("Firebase Error (getAdminReviews):", error);
            return [];
        }
    },

    async addReview(reviewData: Omit<Review, "id" | "createdAt" | "verifiedPurchase" | "status">): Promise<void> {
        try {
            // Check verification first (Server-side/Service check)
            const isVerified = await this.checkVerifiedPurchase(reviewData.userId, reviewData.productId);

            // Create Review with 'pending' status
            await addDoc(collection(db, "reviews"), {
                ...reviewData,
                createdAt: serverTimestamp(),
                verifiedPurchase: isVerified,
                status: 'pending' // [NEW] Default status
            });

            // NOTE: We do NOT update product stats here anymore. 
            // Stats are updated only when admin approves the review.

        } catch (error) {
            console.error("Error adding review:", error);
            throw error;
        }
    },

    // Admin: Approve/Reject review
    async updateReviewStatus(reviewId: string, productId: string, status: 'approved' | 'rejected'): Promise<void> {
        try {
            const reviewRef = doc(db, "reviews", reviewId);
            await updateDoc(reviewRef, { status });

            // Recalculate stats always to be safe/correct
            // In a real app, this should be a Cloud Function
            await this.recalculateProductStats(productId);

        } catch (error) {
            console.error("Error updating review status:", error);
            throw error;
        }
    },

    async recalculateProductStats(productId: string) {
        try {
            // Fetch all APPROVED reviews for this product
            const q = query(
                collection(db, "reviews"),
                where("productId", "==", productId),
                where("status", "==", "approved")
            );
            const snapshot = await getDocs(q);
            const reviews = snapshot.docs.map(d => d.data() as Review);

            const count = reviews.length;
            const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
            const averageRating = count > 0 ? Number((totalRating / count).toFixed(1)) : 0;

            // Update Product
            const productRef = doc(db, "products", productId);
            await updateDoc(productRef, {
                averageRating,
                reviewCount: count
            });
        } catch (error) {
            console.error("Error recalculating stats:", error);
        }
    },

    async checkVerifiedPurchase(userId: string, productId: string): Promise<boolean> {
        try {
            // Query orders for this user that are 'delivered'
            const q = query(
                collection(db, "orders"),
                where("userId", "==", userId),
                where("status", "==", "delivered") // Strict check as requested
            );

            const snapshot = await getDocs(q);

            // Check if any delivered order contains the product
            for (const orderDoc of snapshot.docs) {
                const order = orderDoc.data();
                if (order.items && order.items.some((item: any) => item.productId === productId || item.id === productId)) {
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error("Error checking verified purchase:", error);
            return false;
        }
    },

    // Helper for CMS logic
    async getProductsByFilter(filterType: string, count: number = 6) {
        const all = await this.getAllProducts();

        switch (filterType) {
            case 'NEW_ARRIVALS':
                return all.slice(0, count);
            case 'STREETWEAR':
                // Simulate filtering
                return all.length > count ? all.slice(count, count * 2) : all.slice(0, count);
            case 'WINTER':
                // Simulate filtering
                return all.length > 2 ? all.slice(2, count + 2) : all;
            case 'ESSENTIALS':
                // Simulate filtering
                return all.reverse().slice(0, count);
            default:
                return all.slice(0, count);
        }
    }
};
