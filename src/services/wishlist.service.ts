import { db } from "@/lib/firebase";
import { collection, doc, getDocs, setDoc, deleteDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { Product } from "@/types/store";
import { ProductService } from "./product.service";

export interface WishlistItem {
    productId: string;
    addedAt: any;
    // Populated fields
    product?: Product;
}

export const WishlistService = {
    async addToWishlist(userId: string, productId: string) {
        const ref = doc(db, "users", userId, "wishlist", productId);
        await setDoc(ref, {
            productId,
            addedAt: serverTimestamp()
        });
    },

    async removeFromWishlist(userId: string, productId: string) {
        await deleteDoc(doc(db, "users", userId, "wishlist", productId));
    },

    async getWishlist(userId: string): Promise<WishlistItem[]> {
        const snapshot = await getDocs(collection(db, "users", userId, "wishlist"));
        const items = snapshot.docs.map(doc => ({
            productId: doc.id,
            ...doc.data()
        } as WishlistItem));

        // Populate product details
        // In a real app, you might want to fetch these individually or cache them
        // For now, we'll fetch them in parallel
        const populatedItems = await Promise.all(items.map(async (item) => {
            try {
                const product = await ProductService.getProductById(item.productId);
                return { ...item, product };
            } catch (error) {
                console.warn(`Product ${item.productId} not found for wishlist item`);
                return { ...item, product: undefined };
            }
        }));

        // Filter out items where product was not found (optional, maybe keep them but show "Unavailable")
        return populatedItems.filter(item => item.product !== undefined && item.product !== null) as WishlistItem[];
    },

    async checkIsSaved(userId: string, productId: string): Promise<boolean> {
        const ref = doc(db, "users", userId, "wishlist", productId);
        const snap = await getDoc(ref);
        return snap.exists();
    }
};
