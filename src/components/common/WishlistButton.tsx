"use client";

import { useWishlist } from "@/hooks/useWishlist";
import { Product } from "@/types/store";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WishlistButtonProps {
    product: Product;
    className?: string;
    variant?: 'icon' | 'full';
}

export function WishlistButton({ product, className, variant = 'icon' }: WishlistButtonProps) {
    const { isSaved, addToWishlist, removeFromWishlist } = useWishlist();
    const saved = isSaved(product.id);

    const toggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (saved) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    };

    if (variant === 'full') {
        return (
            <Button
                variant="outline"
                size="lg"
                className={cn("w-full gap-2", className)}
                onClick={toggleWishlist}
            >
                <Heart className={cn("w-5 h-5", saved ? "fill-red-500 text-red-500" : "")} />
                {saved ? "Saved to Wishlist" : "Add to Wishlist"}
            </Button>
        );
    }

    return (
        <button
            onClick={toggleWishlist}
            className={cn(
                "p-2 rounded-full transition-all duration-200 hover:scale-110 active:scale-95",
                saved ? "text-red-500 hover:bg-red-50" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100",
                className
            )}
            title={saved ? "Remove from Wishlist" : "Add to Wishlist"}
        >
            <Heart className={cn("w-5 h-5 transition-colors", saved ? "fill-current" : "")} />
        </button>
    );
}
