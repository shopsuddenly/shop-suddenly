import { db } from "@/lib/firebase";
import { CartItem } from "@/types/store";
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, writeBatch, serverTimestamp } from "firebase/firestore";

const COLLECTION_CARTS = "carts";
const SUBCOLLECTION_ITEMS = "items";

export const CartService = {
    /**
     * Merges a guest cart (local storage) into the user's Firestore cart.
     * Strategy:
     * - Fetch user's existing cart items.
     * - Iterate guest items.
     * - If item exists in user cart, update quantity.
     * - If not, add it.
     * - This runs once on login.
     */
    async mergeGuestCart(userId: string, guestItems: CartItem[]) {
        if (!guestItems.length) return;

        const batch = writeBatch(db);
        const userCartRef = collection(db, COLLECTION_CARTS, userId, SUBCOLLECTION_ITEMS);

        // Get existing items to check for duplicates
        const snapshot = await getDocs(userCartRef);
        const existingItemsMap = new Map<string, CartItem>();

        snapshot.docs.forEach(doc => {
            const data = doc.data() as CartItem;
            // Key by productId + variantId
            existingItemsMap.set(`${data.productId}-${data.variantId || 'default'}`, data);
        });

        guestItems.forEach(guestItem => {
            const key = `${guestItem.productId}-${guestItem.variantId || 'default'}`;
            const existingItem = existingItemsMap.get(key);

            const docRef = doc(userCartRef, key); // Use deterministic ID for easier dedup

            if (existingItem) {
                // Update quantity
                batch.set(docRef, {
                    ...existingItem,
                    quantity: existingItem.quantity + guestItem.quantity,
                    updatedAt: new Date().toISOString()
                }, { merge: true });
            } else {
                // Add new item
                batch.set(docRef, {
                    ...guestItem,
                    id: key, // Ensure ID allows direct lookups
                    userId, // redundancy
                    createdAt: new Date().toISOString()
                });
            }
        });

        await batch.commit();
        console.log("Guest cart merged successfully.");
    },

    /**
     * Listens to the cart collection (handled by Zustand subscription mostly),
     * but here's a direct fetch.
     */
    async fetchCart(userId: string): Promise<CartItem[]> {
        const userCartRef = collection(db, COLLECTION_CARTS, userId, SUBCOLLECTION_ITEMS);
        const snapshot = await getDocs(userCartRef);
        return snapshot.docs.map(doc => doc.data() as CartItem);
    },

    /**
     * Add or Update a single item in Firestore.
     */
    async setItem(userId: string, item: CartItem) {
        const key = `${item.productId}-${item.variantId || 'default'}`;
        const itemRef = doc(db, COLLECTION_CARTS, userId, SUBCOLLECTION_ITEMS, key);
        await setDoc(itemRef, { ...item, id: key, updatedAt: new Date().toISOString() }, { merge: true });
    },

    /**
     * Remove an item from Firestore.
     */
    async removeItem(userId: string, itemId: string) {
        // itemId should be the deterministic key or the ID stored
        const itemRef = doc(db, COLLECTION_CARTS, userId, SUBCOLLECTION_ITEMS, itemId);
        await deleteDoc(itemRef);
    },

    /**
     * Clear all items (e.g. after checkout).
     */
    async clearCart(userId: string) {
        const userCartRef = collection(db, COLLECTION_CARTS, userId, SUBCOLLECTION_ITEMS);
        const snapshot = await getDocs(userCartRef);
        const batch = writeBatch(db);
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
    }
};
