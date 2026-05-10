"use client";

import { useWishlist } from "@/hooks/useWishlist";
import { ProductCard } from "@/components/product/ProductCard";
import { Loader2, Heart, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
    const { wishlist, loading } = useWishlist();

    return (
        <div className="luxury-container pt-24 pb-8 md:pt-28 md:pb-12">
            {/* Header */}
            <div className="mb-8 md:mb-12">
                <Link href="/shop" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Continue Shopping</span>
                </Link>
                <div className="flex items-center gap-3">
                    <Heart className="w-8 h-8 text-primary" />
                    <h1 className="font-serif text-3xl md:text-4xl text-foreground">
                        My Wishlist
                        {wishlist.length > 0 && (
                            <span className="text-muted-foreground text-2xl ml-2">({wishlist.length})</span>
                        )}
                    </h1>
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex h-96 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : wishlist.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-20 bg-card rounded-lg border border-border">
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                        <Heart className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h2 className="text-2xl font-serif text-foreground mb-2">Your wishlist is empty</h2>
                    <p className="text-muted-foreground mb-8 text-center max-w-md">
                        Save items you love by clicking the heart icon on any product.
                    </p>
                    <Link href="/shop">
                        <Button className="btn-luxury">
                            Explore Collection
                        </Button>
                    </Link>
                </div>
            ) : (
                /* Products Grid */
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {wishlist.map((item) => (
                        item.product ? (
                            <ProductCard key={item.productId} product={item.product} />
                        ) : null
                    ))}
                </div>
            )}
        </div>
    );
}

