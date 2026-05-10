"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, TrendingUp, History, ArrowRight } from "lucide-react";
import { Drawer } from "vaul";
import { cn } from "@/lib/utils";

interface MobileSearchProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSearch({ isOpen, onOpenChange }: MobileSearchProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const trending = ["Men's Streetwear", "Luxury Watches", "Oversized Tees", "Minimalist Sneakers"];
  const recent = ["Summer Drop", "Black Hoodie", "Suddenly Exclusive"];

  useEffect(() => {
    if (isOpen && inputRef.current) {
        // Delay focus to allow drawer animation to complete
        const timer = setTimeout(() => {
            inputRef.current?.focus();
        }, 300);
        return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent | string) => {
    const searchTerm = typeof e === 'string' ? e : query;
    if (typeof e !== 'string') e.preventDefault();
    
    if (searchTerm.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      onOpenChange(false);
      setQuery("");
    }
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md" />
        <Drawer.Content 
          className="fixed inset-x-0 bottom-0 z-[101] flex h-[92vh] flex-col rounded-t-[32px] bg-background border-t border-border outline-none"
        >
          {/* Accessibility Title (Radix requirement) */}
          <Drawer.Title className="sr-only">Search Suddenly</Drawer.Title>
          
          {/* Drag Handle */}
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mt-4 mb-6" />

          <div className="px-6 space-y-8 flex-1 overflow-y-auto pb-safe">
            {/* Search Header */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <form onSubmit={handleSearch}>
                  <input
                    ref={inputRef}
                    type="search"
                    placeholder="Search for items, brands..."
                    className="w-full h-14 pl-12 pr-4 bg-secondary/50 rounded-2xl text-base font-sans focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </form>
              </div>
              <button 
                onClick={() => onOpenChange(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground haptic-press"
              >
                Cancel
              </button>
            </div>

            {/* Trending Searches */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <h3 className="text-xs font-sans uppercase tracking-[0.2em]">Trending Now</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {trending.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleSearch(item)}
                    className="px-4 py-2 bg-secondary rounded-full text-sm font-sans hover:bg-primary/10 hover:text-primary transition-all haptic-press"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Searches */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <History className="w-4 h-4" />
                <h3 className="text-xs font-sans uppercase tracking-[0.2em]">Recent Explorations</h3>
              </div>
              <div className="space-y-1">
                {recent.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleSearch(item)}
                    className="w-full flex items-center justify-between py-3 group haptic-press"
                  >
                    <span className="text-foreground/80 group-hover:text-foreground font-sans">{item}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* Suggestions Card */}
            <div className="p-8 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl border border-primary/10">
                <h4 className="font-serif text-xl mb-2 text-gold">Shop the Edit</h4>
                <p className="text-sm text-muted-foreground mb-4">Discover curated luxury essentials chosen for the Suddenly aesthetic.</p>
                <button 
                    onClick={() => {
                        router.push('/shop');
                        onOpenChange(false);
                    }}
                    className="text-xs font-sans uppercase tracking-luxury text-primary flex items-center gap-1"
                >
                    View All Collections <ArrowRight className="w-3 h-3" />
                </button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
