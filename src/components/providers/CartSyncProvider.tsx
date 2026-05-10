"use client";

import { useAuth } from "@/hooks/useAuth";
import { useCartStore } from "@/store/useCartStore";
import { useEffect } from "react";

const SYNC_FLAG_KEY = 'cart-synced-users';

export function CartSyncProvider() {
    const { user } = useAuth();
    const syncWithUser = useCartStore((state) => state.syncWithUser);

    useEffect(() => {
        if (user?.uid) {
            // Check if we've already synced for this user
            const syncedUsers = JSON.parse(localStorage.getItem(SYNC_FLAG_KEY) || '{}');

            if (!syncedUsers[user.uid]) {
                console.log("🔄 [CART SYNC] User logged in, syncing cart for first time...");
                syncWithUser(user.uid).then(() => {
                    // Mark this user as synced
                    syncedUsers[user.uid] = new Date().toISOString();
                    localStorage.setItem(SYNC_FLAG_KEY, JSON.stringify(syncedUsers));
                    console.log("✅ [CART SYNC] Sync complete and marked");
                });
            } else {
                console.log("✅ [CART SYNC] User already synced, skipping merge");
            }
        }

        // Reset sync flag on logout
        if (!user) {
            // Don't clear the sync flag - we want to remember we've already merged this user's cart
            console.log("🔓 [CART SYNC] User logged out");
        }
    }, [user, syncWithUser]);

    // Safety check: Ensure totals are calculated on mount (handling hydration edge cases)
    useEffect(() => {
        const unsubscribe = useCartStore.subscribe((state) => {
            if (state.items.length > 0 && state.totals.total === 0) {
                console.log("⚠️ [CART SYNC] Detected items with zero total, recalculating...");
                state.setItems(state.items);
            }
        });
        return () => unsubscribe();
    }, []);

    return null; // Logic only
}
