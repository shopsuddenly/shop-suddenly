import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types/store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/common/Badge";

interface ProductCardProps {
  product: Product;
  className?: string; // Keeping className as it was in the original ProductCardProps
}

export function ProductCard({ product, className }: ProductCardProps) {
  return (
    <Link href={`/product/${product.slug || product.id}`} className={cn("group block", className)}>
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary mb-4">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-30">
          {product.customBadge?.trim() && <Badge>{product.customBadge}</Badge>}
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="font-serif text-lg leading-none group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        
        <div className="flex items-center gap-2 mt-2">
          <span className="font-medium">{formatPrice(product.price)}</span>
          {product.mrp && product.mrp > product.price && (
            <span className="text-muted-foreground line-through text-sm">{formatPrice(product.mrp)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
