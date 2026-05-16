"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Heart, ShoppingBag, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";

interface BottomNavProps {
  onSearchClick: () => void;
}

export function BottomNav({ onSearchClick }: BottomNavProps) {
  const pathname = usePathname();
  const { items } = useCartStore();
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // Hidden on admin pages and desktop
  if (pathname?.startsWith("/admin")) return null;

  const navItems = [
    { label: "Home", icon: Home, href: "/" },
    { label: "Shop", icon: LayoutGrid, href: "/shop" },
    { label: "Search", icon: Search, onClick: onSearchClick },
    { label: "Wishlist", icon: Heart, href: "/account/wishlist" },
    { label: "Bag", icon: ShoppingBag, href: "/cart", badge: cartCount },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden block">
      {/* Visual background with high-end glassmorphism */}
      <div className="bg-background/80 backdrop-blur-2xl border-t border-border/50 safe-bottom shadow-[0_-8px_30px_rgb(0,0,0,0.12)]">
        <div className="flex items-center justify-around h-20 px-4">
          {navItems.map((item) => {
            const isActive = "href" in item && pathname === item.href;
            const Icon = item.icon;

            const content = (
              <div className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1.5 transition-all duration-300 relative px-2",
                isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
              )}>
                <div className="relative">
                  <Icon className={cn("w-6 h-6 transition-transform", isActive && "stroke-[2.5px]")} />
                  {("badge" in item) && item.badge! > 0 && (
                    <span className="absolute -top-2 -right-3 w-5 h-5 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-bold border-2 border-background animate-in zoom-in duration-300 shadow-lg">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={cn(
                  "text-[10px] font-bold tracking-tighter uppercase",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>

                {/* Refined Active Indicator */}
                {isActive && (
                  <div className="absolute -bottom-1 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgb(var(--primary))] animate-in fade-in zoom-in duration-500" />
                )}
              </div>
            );

            if ("href" in item) {
              return (
                <Link key={item.label} href={item.href!} className="flex-1 h-full">
                  {content}
                </Link>
              );
            }

            return (
              <button key={item.label} suppressHydrationWarning onClick={item.onClick} className="flex-1 h-full">
                {content}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
