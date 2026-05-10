import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, Coupon } from '@/types/store';
import { CartTotals, calculateCartTotals } from '@/lib/cart.utils';
import { CartService } from '@/services/cart.service';
import { CouponService } from '@/services/coupon.service';
import { produce } from "immer";
import { useErrorStore } from "./useErrorStore";
import { toast } from 'sonner';

interface CartState {
    items: CartItem[];
    totals: CartTotals;
    isLoading: boolean;
    _hasHydrated: boolean;

    addToCart: (product: any, quantity: number, variantId?: string) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => Promise<void>;
    syncWithUser: (userId: string) => Promise<void>;
    applyCoupon: (code: string, userId?: string) => Promise<void>;
    removeCoupon: () => void;
    setItems: (items: CartItem[]) => void;
    setHasHydrated: (state: boolean) => void;
    activeCoupon?: Coupon;

    // Direct Checkout (Buy Now)
    directCheckoutItem: CartItem | null;
    setDirectCheckoutItem: (product: any, quantity: number, variantId?: string) => void;
    clearDirectCheckoutItem: () => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            totals: { subtotal: 0, tax: 0, shipping: 0, discountTotal: 0, total: 0 },
            isLoading: false,
            _hasHydrated: false, // Default to false

            // Direct Checkout State
            directCheckoutItem: null,

            setDirectCheckoutItem: (product, quantity, variantId) => {
                const id = variantId ? `${product.id}-${variantId}` : product.id;
                const newItem: CartItem = {
                    id,
                    productId: product.id,
                    variantId,
                    quantity,
                    unitPrice: Number(product.price),
                    createdAt: new Date().toISOString(),
                    product
                };
                set({ directCheckoutItem: newItem });
            },

            clearDirectCheckoutItem: () => {
                set({ directCheckoutItem: null });
            },

            addToCart: (product, quantity, variantId) => {
                console.log('🛒 [CART] addToCart called:', { product, quantity, variantId });
                const { items, activeCoupon } = get();

                // Determine item ID (unique per variant)
                const id = variantId ? `${product.id}-${variantId}` : product.id;

                // Determine MAX stock available for this specific variation
                let maxStock = product.stock; // Default to total/simple stock
                if (variantId && product.variants) {
                    const variant = product.variants.find((v: any) => v.id === variantId || v.name === variantId);
                    if (variant) {
                        maxStock = variant.stock;
                    }
                }

                const existingItem = items.find(i => i.id === id);
                let newItems;

                if (existingItem) {
                    const newQty = existingItem.quantity + quantity;
                    if (newQty > maxStock) {
                        console.warn('⚠️ [CART] Max stock reached for variant');
                        // Optional: Toast here or in UI
                    }

                    newItems = items.map(i =>
                        i.id === id ? { ...i, quantity: Math.min(i.quantity + quantity, maxStock) } : i
                    );
                } else {
                    const newItem: CartItem = {
                        id,
                        productId: product.id,
                        variantId,
                        quantity: Math.min(quantity, maxStock),
                        unitPrice: Number(product.price), // Should ideally come from variant price if different
                        createdAt: new Date().toISOString(),
                        product
                    };
                    newItems = [...items, newItem];
                }

                const coupons = activeCoupon ? [activeCoupon] : [];
                const newTotals = calculateCartTotals(newItems, coupons);
                set({ items: newItems, totals: newTotals });
            },

            removeFromCart: (itemId) => {
                console.log('🗑️ [CART] removeFromCart called for ID:', itemId);
                const { items, activeCoupon } = get();
                const newItems = items.filter(i => i.id !== itemId);
                console.log('🗑️ [CART] Items after removal:', newItems.length);

                const coupons = activeCoupon ? [activeCoupon] : [];
                const newTotals = calculateCartTotals(newItems, coupons);
                set({ items: newItems, totals: newTotals });
            },

            updateQuantity: (itemId, quantity) => {
                console.log('🔄 [CART] updateQuantity called:', { itemId, quantity });
                if (quantity <= 0) {
                    console.log('🔄 [CART] Quantity <= 0, removing item');
                    get().removeFromCart(itemId);
                    return;
                }
                const { items, activeCoupon } = get();
                const newItems = items.map(i =>
                    i.id === itemId ? { ...i, quantity } : i
                );
                console.log('🔄 [CART] Updated items:', newItems.length);

                const coupons = activeCoupon ? [activeCoupon] : [];
                const newTotals = calculateCartTotals(newItems, coupons);
                set({ items: newItems, totals: newTotals });
            },

            clearCart: async () => {
                console.log('🗑️ [CART] Clearing cart...');

                // Clear local state
                set({ items: [], totals: calculateCartTotals([]), activeCoupon: undefined });

                // Clear Firebase cart if user is logged in
                try {
                    const userId = (await import('@/lib/firebase')).auth.currentUser?.uid;
                    if (userId) {
                        console.log('🗑️ [CART] Clearing Firebase cart for user:', userId);
                        await CartService.clearCart(userId);
                        console.log('✅ [CART] Firebase cart cleared');
                    }
                } catch (error) {
                    console.error('❌ [CART] Error clearing Firebase cart:', error);
                }

                console.log('✅ [CART] Cart cleared successfully');
            },

            syncWithUser: async (userId: string) => {
                console.log('🔄 [SYNC] Syncing cart for user:', userId);
                set({ isLoading: true });
                try {
                    const { items: localItems } = get();
                    console.log('🔄 [SYNC] Local items to merge:', localItems.length);

                    // Merge local items if they exist
                    if (localItems.length > 0) {
                        console.log('🔄 [SYNC] Merging guest cart...');
                        await CartService.mergeGuestCart(userId, localItems);
                        console.log('🔄 [SYNC] ✅ Merge complete');
                    }

                    // Fetch latest from server (includes merged items)
                    console.log('🔄 [SYNC] Fetching remote cart items...');
                    const remoteItems = await CartService.fetchCart(userId);
                    console.log('🔄 [SYNC] Remote items received:', remoteItems.length);

                    // Replace local cart with remote cart
                    // This prevents re-merging the same items on next login
                    // Note: We might want to preserve activeCoupon if logical, but usually easier to reset or re-calc

                    const { activeCoupon } = get();
                    const coupons = activeCoupon ? [activeCoupon] : [];
                    set({ items: remoteItems, totals: calculateCartTotals(remoteItems, coupons) });

                    console.log('🔄 [SYNC] ✅ Sync complete. Local cart replaced with remote.');
                } catch (error) {
                    console.error("❌ [SYNC] Cart Sync Failed:", error);
                } finally {
                    set({ isLoading: false });
                }
            },

            applyCoupon: async (code: string, userId?: string) => {
                const { items, totals, directCheckoutItem } = get();

                // Determine context: Direct Checkout vs Main Cart
                let targetItems = items;
                let validationSubtotal = totals.subtotal;

                if (directCheckoutItem) {
                    targetItems = [directCheckoutItem];
                    validationSubtotal = Number(directCheckoutItem.unitPrice) * directCheckoutItem.quantity;
                }

                if (targetItems.length === 0) {
                    toast.error("Cart is empty");
                    return;
                }

                set({ isLoading: true });
                try {
                    // Validate against the relevant subtotal (Direct or Main)
                    const coupon = await CouponService.validateCoupon(code, validationSubtotal, userId);

                    // We always store the activeCoupon globally.
                    // If in Direct Checkout, the page derives its own totals from this activeCoupon.
                    // If in Main Cart, we update the main totals store.

                    const newTotals = calculateCartTotals(items, [coupon]); // Recalc main cart for consistency
                    set({ activeCoupon: coupon, totals: newTotals });

                    toast.success("Coupon applied successfully!");
                } catch (error: any) {
                    // Use Global Error Dialog for better visibility
                    useErrorStore.getState().showError("Invalid Coupon", error.message || "Failed to apply coupon");

                    const newTotals = calculateCartTotals(items); // Reset main cart totals
                    set({ activeCoupon: undefined, totals: newTotals });
                } finally {
                    set({ isLoading: false });
                }
            },

            removeCoupon: () => {
                const { items } = get();
                const newTotals = calculateCartTotals(items);
                set({ activeCoupon: undefined, totals: newTotals });
                toast.success("Coupon removed");
            },

            setItems: (items) => {
                const { activeCoupon } = get();
                const coupons = activeCoupon ? [activeCoupon] : [];
                set({ items, totals: calculateCartTotals(items, coupons) });
            },

            setHasHydrated: (state) => {
                set({ _hasHydrated: state });
            }
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ items: state.items, activeCoupon: state.activeCoupon }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
                // Recalculate totals from persisted items
                if (state?.items) {
                    // We call setItems (which we updated to use activeCoupon) to verify consistency
                    state.setItems(state.items);
                }
            }
        }
    )
);

// Extended selector or helper could be added here later
// For now, simple typed store

