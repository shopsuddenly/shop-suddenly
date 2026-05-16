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
    <section className="pt-6 pb-8 md:py-32 bg-background/50">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-20 gap-6 md:gap-8">
          <div className="space-y-3">
            {subtitle && (
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/80">{subtitle}</span>
            )}
            <h2 className="text-4xl md:text-6xl font-display tracking-tight text-foreground leading-[1.1]">{title}</h2>
          </div>
          
          <div className="flex items-center gap-8">
            <Link href={viewAllLink} className="group flex items-center text-[11px] font-bold uppercase tracking-[0.2em] hover:text-primary transition-all duration-300">
                <span className="border-b border-transparent group-hover:border-primary pb-0.5">Explore All</span>
                <ArrowRight className="ml-3 w-3.5 h-3.5 transition-transform group-hover:translate-x-1.5" />
            </Link>
            <div className="hidden md:flex items-center gap-3">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => scroll("left")}
                    className="w-12 h-12 rounded-full border-border/50 hover:border-foreground hover:bg-foreground hover:text-background transition-all duration-500 group/btn"
                >
                    <ChevronLeft className="w-5 h-5 transition-transform group-active/btn:-translate-x-1" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => scroll("right")}
                    className="w-12 h-12 rounded-full border-border/50 hover:border-foreground hover:bg-foreground hover:text-background transition-all duration-500 group/btn"
                >
                    <ChevronRight className="w-5 h-5 transition-transform group-active/btn:translate-x-1" />
                </Button>
            </div>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-8 overflow-x-auto scrollbar-hide pb-12 -mx-3 px-3 md:mx-0 md:px-0"
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
