"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

interface Category {
  name: string;
  image: string;
  link: string;
}

interface CategoryStripProps {
  categories?: Category[];
}

export function CategoryStrip({ categories = [] }: CategoryStripProps) {
  return (
    <section className="py-20 md:py-32 bg-background overflow-hidden">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Discover More</span>
                <h2 className="text-display-md md:text-display-lg tracking-tighter">Shop by Category</h2>
            </div>
            <p className="text-muted-foreground text-lg max-w-sm">
                Explore our curated collections of premium essentials for every aspect of your life.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.slice(0, 4).map((category, index) => (
            <Link
              key={category.name}
              href={category.link}
              className="group relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-secondary"
            >
              {category.image && (
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
              )}
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              
              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
                    <div className="flex items-center text-white/70 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                        Explore Collection
                        <ArrowUpRight className="ml-2 w-4 h-4" />
                    </div>
                </div>
              </div>

              {/* Numbering */}
              <div className="absolute top-8 left-8">
                <span className="text-white/30 font-display text-lg font-bold">0{index + 1}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
