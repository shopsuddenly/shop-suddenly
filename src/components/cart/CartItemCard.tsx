import { CartItem } from "@/types/store";
import { Minus, Plus, X } from "lucide-react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";

interface CartItemCardProps {
    item: CartItem;
}

export function CartItemCard({ item }: CartItemCardProps) {
    const { updateQuantity, removeFromCart } = useCartStore();
    const product = item.product;

    if (!product) {
        // Fallback if product data is missing (e.g. fresh DB fetch without hydration)
        // In a real app we'd fetch this. For now, show placeholder or try to recover.
        return (
            <div className="py-4 border-b border-border">
                <p className="text-sm text-muted-foreground">Product details unavailable</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-12 gap-4 py-6 border-b border-border items-center animate-fade-in">
            {/* Product Info */}
            <div className="col-span-12 md:col-span-6 flex gap-4">
                <Link
                    href={`/product/${product.slug}`}
                    className="w-24 h-32 bg-card flex-shrink-0 overflow-hidden relative"
                >
                    <Image
                        src={product.images[0] || ""}
                        alt={product.name}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                </Link>
                <div className="flex flex-col justify-between py-1">
                    <div>
                        <p className="text-xs font-sans text-muted-foreground uppercase tracking-wider mb-1">
                            {product.category?.name || "Collection"}
                        </p>
                        <div className="flex-1 min-w-0">
                            <Link
                                href={`/product/${product.slug}`}
                                className="font-serif text-lg font-medium hover:text-primary transition-colors truncate block"
                            >
                                {product.name}
                            </Link>
                            <p className="text-sm text-muted-foreground mt-1">
                                {item.variantId ? `Variant: ${item.variantId}` : 'Standard'}
                            </p>
                            <p className="text-sm font-medium mt-1">
                                {formatPrice(product.price)}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs font-sans uppercase tracking-luxury text-muted-foreground hover:text-destructive transition-colors self-start md:hidden"
                    >
                        Remove
                    </button>
                </div>
            </div>

            {/* Size / Variant */}
            <div className="col-span-4 md:col-span-2 text-center">
                <span className="md:hidden text-xs text-muted-foreground mr-2">Size:</span>
                <span className="font-sans text-sm">
                    {/* Heuristic: Extract Size from Variant ID (e.g. 'XXL-123' -> 'XXL') or show Standard */}
                    {item.variantId ? item.variantId.split('-')[0] : "Standard"}
                </span>
            </div>

            {/* Quantity */}
            <div className="col-span-4 md:col-span-2 flex justify-center">
                <div className="flex items-center border border-border">
                    <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    >
                        <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-sans text-sm">
                        {item.quantity}
                    </span>
                    <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Total & Remove */}
            <div className="col-span-4 md:col-span-2 flex items-center justify-end gap-4">
                <span className="font-sans text-sm md:text-base font-medium">
                    {formatPrice(product.price * item.quantity)}
                </span>
                <button
                    onClick={() => removeFromCart(item.id)}
                    className="hidden md:flex w-8 h-8 items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
