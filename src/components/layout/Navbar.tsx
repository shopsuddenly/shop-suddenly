"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShoppingBag, User, Menu, X, Heart, Sun, Moon, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCartStore } from "@/store/useCartStore";
import { useTheme } from "next-themes";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "New Arrivals", href: "/shop?filter=new" },
  { name: "Collections", href: "/shop?filter=collections" },
  { name: "About", href: "/about" },
];

const quickSearches = ["T-Shirts", "Hoodies", "Jackets", "Oversized", "New Arrivals"];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [mounted, setMounted] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { user, isAdmin } = useAuth();
  const { items } = useCartStore();
  const { theme, setTheme } = useTheme();

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const profileLink = isAdmin ? "/admin" : user ? "/profile" : "/login";

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on path change
  React.useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Focus input when search opens
  React.useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery("");
    }
  }, [searchOpen]);

  // Close search on Escape
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const handleQuickSearch = (term: string) => {
    router.push(`/shop?search=${encodeURIComponent(term)}`);
    setSearchOpen(false);
  };

  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled
            ? "bg-background/90 backdrop-blur-xl border-b border-border/50 py-3 shadow-soft"
            : "bg-gradient-to-b from-black/50 via-black/10 to-transparent py-5"
        )}
      >
        <div className="container mx-auto px-3 md:px-8 flex items-center justify-between">
          {/* Left Side: Menu Toggle & Desktop Nav */}
          <div className="flex-1 flex items-center justify-start">
            <button
              suppressHydrationWarning
              className={cn(
                "lg:hidden p-2 -ml-2 transition-colors",
                isScrolled ? "text-foreground" : "text-white"
              )}
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <nav className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-xs font-medium uppercase tracking-widest transition-colors hover:text-primary",
                    pathname === link.href ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Logo (Center) */}
          <div className="flex-shrink-0 flex justify-center">
            <Link href="/" className="flex items-center">
              <span className={cn(
                "text-lg md:text-2xl font-display font-black uppercase tracking-tight transition-colors",
                isScrolled ? "text-[#482D1B] dark:text-foreground" : "text-white"
              )}>
                SUDDENLY
              </span>
            </Link>
          </div>

          {/* Actions (Right) */}
          <div className="flex-1 flex items-center justify-end space-x-0.5 md:space-x-4">


            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle Theme"
              className={cn(
                "transition-colors",
                isScrolled ? "text-muted-foreground hover:text-foreground" : "text-white/70 hover:text-white"
              )}
            >
              {mounted ? (theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />) : <div className="w-5 h-5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              aria-label="Account"
              className={cn(
                "transition-colors",
                isScrolled ? "text-muted-foreground hover:text-foreground" : "text-white/70 hover:text-white",
                (user || isAdmin) && "text-primary"
              )}
              asChild
            >
              <Link href={profileLink}>
                <User className="w-5 h-5" />
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "relative transition-colors",
                isScrolled ? "text-muted-foreground hover:text-foreground" : "text-white/70 hover:text-white"
              )}
              aria-label="Shopping Cart"
              asChild
            >
              <Link href="/cart">
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                    {totalItems}
                  </span>
                )}
              </Link>
            </Button>
          </div>
        </div>

        {/* Mobile Menu Sidebar */}
        {mobileMenuOpen && (
          <>
            <div
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <div className="fixed top-0 left-0 bottom-0 w-[80vw] max-w-[320px] bg-background z-[60] lg:hidden p-6 flex flex-col shadow-2xl">
              <div className="flex items-center justify-between mb-10">
                <span className="text-2xl font-display font-bold tracking-tighter text-[#482D1B] dark:text-foreground">SUDDENLY</span>
                <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu" className="p-2">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Search */}
              <form
                onSubmit={handleSearch}
                className="flex items-center gap-2 mb-8 bg-secondary/50 rounded-xl px-4 py-3"
              >
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
                {searchQuery && (
                  <button type="submit" className="text-primary">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </form>

              <div className="flex-1 overflow-y-auto py-4 space-y-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "block text-xl font-medium tracking-tight transition-colors",
                      pathname === link.href ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              <div className="mt-auto pt-8 border-t border-border">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 mb-6">
                  <span className="text-sm font-medium">Appearance</span>
                  <div className="flex bg-background rounded-lg p-1">
                    <button
                      onClick={() => setTheme("light")}
                      className={cn(
                        "p-1.5 rounded-md transition-all",
                        theme === "light" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                      )}
                    >
                      <Sun className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setTheme("dark")}
                      className={cn(
                        "p-1.5 rounded-md transition-all",
                        theme === "dark" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                      )}
                    >
                      <Moon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <Button className="w-full py-6 rounded-2xl text-lg font-medium" asChild>
                  <Link href="/shop" onClick={() => setMobileMenuOpen(false)}>
                    Shop Collection
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </header>

      {/* Full-Screen Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[200] bg-background/98 backdrop-blur-xl flex flex-col animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-border">
            <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Search</span>
            <button
              onClick={() => setSearchOpen(false)}
              suppressHydrationWarning
              className="p-2 rounded-full hover:bg-secondary transition-colors"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="px-6 md:px-12 pt-12 pb-8">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full bg-transparent text-3xl md:text-5xl font-bold text-foreground placeholder:text-muted-foreground/30 outline-none pl-10 pb-4 border-b-2 border-border focus:border-primary transition-colors"
              />
              {searchQuery && (
                <button
                  type="submit"
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground rounded-full p-3 hover:opacity-90 transition-opacity"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </form>
          </div>

          {/* Quick Searches */}
          <div className="px-6 md:px-12">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
              Quick Searches
            </p>
            <div className="flex flex-wrap gap-3">
              {quickSearches.map((term) => (
                <button
                  key={term}
                  suppressHydrationWarning
                  onClick={() => handleQuickSearch(term)}
                  className="px-5 py-2.5 rounded-full border border-border text-sm font-medium hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-200"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
