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
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {product.isFeatured ? (
            <Badge className="bg-foreground/90 text-background backdrop-blur-md border-none text-[9px] uppercase tracking-[0.15em] font-bold py-1 px-2.5 rounded-sm">
                Featured
            </Badge>
          ) : product.customBadge && (
            <Badge className="bg-background/60 text-foreground backdrop-blur-md border border-foreground/10 text-[9px] uppercase tracking-[0.15em] font-bold py-1 px-2.5 rounded-sm">
                {product.customBadge}
            </Badge>
          )}
          
          {product.stock <= 0 && (
             <Badge className="bg-background/90 text-destructive backdrop-blur-md border-none text-[9px] uppercase tracking-[0.15em] font-bold py-1 px-2.5 rounded-sm">
                Sold Out
             </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <div className="absolute top-3 right-3 z-20 transition-all duration-300">
          <WishlistButton 
            product={product} 
            className="bg-background/80 backdrop-blur-md hover:bg-background shadow-sm text-foreground hover:text-red-500"
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
                className="object-cover transition-transform duration-700 group-hover:scale-105"
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
            className="flex-1 bg-background text-foreground hover:bg-foreground hover:text-background border-none h-11 rounded-xl text-xs font-semibold shadow-xl"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Add to Bag
          </Button>
          <Button
              variant="ghost"
              size="icon"
              className="bg-background/80 backdrop-blur-md hover:bg-background h-11 w-11 rounded-xl shadow-xl shrink-0"
              asChild
          >
            <Link href={`/product/${product.slug}`}>
                <Eye className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="px-1 mt-4 space-y-1 text-left pb-2">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
            {product.brand || product.category?.name || "Premium Collection"}
        </p>
        
        <Link href={`/product/${product.slug}`} className="block group/title">
            <h3 className="text-[14px] font-medium text-foreground line-clamp-1 leading-snug group-hover/title:text-primary transition-colors">
                {product.name}
            </h3>
        </Link>
        
        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="font-bold text-[14px] text-foreground">
            {formatPrice(product.price)}
          </span>
          
          {product.mrp && product.mrp > product.price && (
            <div className="flex items-center gap-2">
                <span className="text-[12px] text-muted-foreground line-through opacity-50">
                    {formatPrice(product.mrp)}
                </span>
                <span className="text-[11px] font-bold text-green-600 dark:text-green-500">
                    {discount}% OFF
                </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
