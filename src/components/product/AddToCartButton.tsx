"use client";

import { formatPrice } from "@/lib/utils";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/store";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check, Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

interface AddToCartButtonProps {
    product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
    const addToCart = useCartStore((state) => state.addToCart);
    const [added, setAdded] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {
        console.log('🔘 [BUTTON] AddToCartButton clicked for:', product.name);
        setLoading(true);
        // Simulate an async operation, e.g., adding to cart API call
        await new Promise(resolve => setTimeout(resolve, 500));
        addToCart(product, 1);
        console.log('🔘 [BUTTON] ✅ addToCart called');

        toast.custom((t) => (
            <div className="flex w-full items-center gap-4 rounded-lg bg-background p-4 border border-border shadow-lg ring-1 ring-black/5">
                <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded bg-muted">
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-sm font-medium text-foreground">Added to Bag</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1">{product.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Qty: 1
                    </p>
                </div>
                <div className="flex flex-col gap-2">
                    <Link
                        href="/cart"
                        onClick={() => toast.dismiss(t)}
                        className="text-xs font-medium text-primary hover:underline text-center"
                    >
                        View Bag
                    </Link>
                    <Link
                        href="/checkout"
                        onClick={() => toast.dismiss(t)}
                        className="rounded bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 text-center whitespace-nowrap"
                    >
                        Checkout
                    </Link>
                </div>
            </div>
        ), { duration: 4000 });

        setAdded(true);
        setLoading(false);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <Button
            size="lg"
            disabled={product.stock === 0 || added || loading}
            className={`w-full md:w-auto px-12 text-lg transition-all duration-300 ${added ? 'bg-green-600 hover:bg-green-700' : ''}`}
            onClick={handleAdd}
        >
            {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : added ? (
                <span className="flex items-center gap-2 justify-center">
                    <Check className="w-5 h-5" /> Added
                </span>
            ) : (
                <span className="flex items-center gap-2 justify-center">
                    <ShoppingBag className="w-5 h-5" />
                    {product.stock > 0 ? `Add to Cart - ${formatPrice(product.price)}` : 'Out of Stock'}
                </span>
            )}
        </Button>
    );
}
