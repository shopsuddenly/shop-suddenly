"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { Product } from "@/types/store";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ProductSliderProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllLink?: string;
}

export function ProductSlider({ title, subtitle, products, viewAllLink = "/shop" }: ProductSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="py-20 md:py-32 bg-background/50">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="space-y-4">
            {subtitle && (
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary">{subtitle}</span>
            )}
            <h2 className="text-display-md md:text-display-lg tracking-tighter">{title}</h2>
          </div>
          
          <div className="flex items-center gap-6">
            <Link href={viewAllLink} className="group flex items-center text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">
                View All Products
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <div className="hidden md:flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => scroll("left")}
                    className="w-12 h-12 rounded-xl border-border/50 hover:border-primary hover:text-primary transition-all duration-300"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => scroll("right")}
                    className="w-12 h-12 rounded-xl border-border/50 hover:border-primary hover:text-primary transition-all duration-300"
                >
                    <ChevronRight className="w-5 h-5" />
                </Button>
            </div>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-8 overflow-x-auto scrollbar-hide pb-12 -mx-4 px-4 md:mx-0 md:px-0"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {products.map((product, index) => (
            <div
              key={`${product.id}-${index}`}
              className="flex-shrink-0 w-[280px] md:w-[340px]"
              style={{ scrollSnapAlign: "start" }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
