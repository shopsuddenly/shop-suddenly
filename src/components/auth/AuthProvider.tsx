"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/auth.store";
import { AuthService } from "@/services/auth.service";
import { CartService } from "@/services/cart.service";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const { setUser, setLoading } = useAuthStore();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            try {
                if (user) {
                    // Sync user to firestore to ensure we have roles and latest data
                    const appUser = await AuthService.syncUserToFirestore(user);

                    // Sync/Merge Cart
                    // We get local items from the store (persisted in localStorage)
                    const localCartStr = localStorage.getItem('suddenly-cart');
                    let localItems = [];
                    if (localCartStr) {
                        try {
                            const parsed = JSON.parse(localCartStr);
                            localItems = parsed.state.items || [];
                        } catch (e) {
                            console.error("Failed to parse local cart", e);
                        }
                    }

                    if (localItems.length > 0) {
                        await CartService.mergeGuestCart(user.uid, localItems);
                    }

                    setUser(appUser);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Auth state sync failed:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [setUser, setLoading]);

    return <>{children}</>;
}
