"use client";

import React, { useEffect, useState, useContext, createContext } from "react";
import { useAuth } from "./useAuth";
import { WishlistService, WishlistItem } from "@/services/wishlist.service";
import { toast } from "sonner";
import { Product } from "@/types/store";

interface WishlistContextType {
    wishlist: WishlistItem[];
    loading: boolean;
    addToWishlist: (product: Product) => Promise<void>;
    removeFromWishlist: (productId: string) => Promise<void>;
    isSaved: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadWishlist();
        } else {
            setWishlist([]);
            setLoading(false);
        }
    }, [user]);

    const loadWishlist = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const items = await WishlistService.getWishlist(user.uid);
            setWishlist(items);
        } catch (error) {
            console.error("Failed to load wishlist:", error);
        } finally {
            setLoading(false);
        }
    };

    const addToWishlist = async (product: Product) => {
        if (!user) {
            toast.error("Please login to save items");
            return;
        }

        const optimisticItem: WishlistItem = { productId: product.id, addedAt: new Date(), product };
        setWishlist(prev => [...prev, optimisticItem]);

        try {
            await WishlistService.addToWishlist(user.uid, product.id);
            toast.success("Added to Wishlist");
        } catch (error) {
            console.error("Failed to add to wishlist:", error);
            toast.error("Failed to save item");
            setWishlist(prev => prev.filter(item => item.productId !== product.id));
        }
    };

    const removeFromWishlist = async (productId: string) => {
        if (!user) return;

        const oldList = wishlist;
        setWishlist(prev => prev.filter(item => item.productId !== productId));

        try {
            await WishlistService.removeFromWishlist(user.uid, productId);
            toast.success("Removed from Wishlist");
        } catch (error) {
            console.error("Failed to remove from wishlist:", error);
            toast.error("Failed to remove item");
            setWishlist(oldList);
        }
    };

    const isSaved = (productId: string) => {
        return wishlist.some(item => item.productId === productId);
    };

    const contextValue = {
        wishlist,
        loading,
        addToWishlist,
        removeFromWishlist,
        isSaved
    };

    // Fixed via terminal
    return (
        <WishlistContext.Provider value={contextValue}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error("useWishlist must be used within a WishlistProvider");
    }
    return context;
}
