"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Heart, Eye } from "lucide-react";
import { Product } from "@/types/store";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { Badge } from "@/components/ui/badge";
import { WishlistButton } from "@/components/common/WishlistButton";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCartStore();

  const discount = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    toast.success(`${product.name} added to bag`);
  };

  return (
    <div
      className="group"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-secondary mb-4 shadow-soft hover:shadow-soft-lg transition-all duration-500">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {product.isFeatured && <Badge variant="premium" className="bg-primary text-primary-foreground">Featured</Badge>}
          {product.customBadge && <Badge variant="secondary" className="backdrop-blur-md bg-background/50 border-none">{product.customBadge}</Badge>}
          {discount > 0 && (
            <Badge variant="destructive" className="font-bold">
              {discount}% OFF
            </Badge>
          )}
          {product.stock <= 0 && (
             <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-red-500 border-red-500">
                Out of Stock
             </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <WishlistButton 
            product={product} 
            className="rounded-full bg-background/80 backdrop-blur-md hover:bg-background border-none shadow-sm"
          />
        </div>

        {/* Product Image */}
        <Link href={`/product/${product.slug}`} className="block h-full">
          {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
          ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                  No Image
              </div>
          )}
        </Link>

        {/* Quick Actions */}
        <div className="absolute inset-x-3 bottom-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex space-x-2 z-20">
          <Button
            onClick={handleQuickAdd}
            disabled={product.stock <= 0}
            className="flex-1 bg-background text-foreground hover:bg-primary hover:text-primary-foreground border-none h-11 rounded-xl text-xs font-semibold shadow-xl"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Add to Bag
          </Button>
          <Link href={`/product/${product.slug}`} className="shrink-0">
            <Button
                variant="ghost"
                size="icon"
                className="bg-background/80 backdrop-blur-md hover:bg-background h-11 w-11 rounded-xl shadow-xl"
            >
                <Eye className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="px-1 space-y-1">
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] font-bold">
            {product.category?.name || "Premium Collection"}
        </p>
        <Link href={`/product/${product.slug}`}>
            <h3 className="font-semibold text-sm transition-colors group-hover:text-primary line-clamp-1">
                {product.name}
            </h3>
        </Link>
        <div className="flex items-center space-x-2">
          <span className="font-bold text-base">{formatPrice(product.price)}</span>
          {product.mrp && product.mrp > product.price && (
            <span className="text-xs text-muted-foreground line-through opacity-60">
                {formatPrice(product.mrp)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
