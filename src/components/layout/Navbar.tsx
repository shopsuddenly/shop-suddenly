"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingBag, User, Menu, X, Heart, Sun, Moon, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCartStore } from "@/store/useCartStore";
import { useTheme } from "next-themes";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "New Arrivals", href: "/shop?filter=new" },
  { name: "Collections", href: "/shop?filter=collections" },
  { name: "About", href: "/about" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
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
  }, [pathname]);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled 
          ? "bg-background/90 backdrop-blur-xl border-b border-border/50 py-3 shadow-soft" 
          : "bg-gradient-to-b from-black/50 via-black/10 to-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between relative">
        {/* Mobile Menu Toggle */}
        <button
          className={cn(
            "lg:hidden p-2 -ml-2 transition-colors",
            isScrolled ? "text-foreground" : "text-white"
          )}
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0">
          <span className={cn(
            "text-lg md:text-2xl font-display font-black uppercase tracking-tight transition-colors",
            isScrolled ? "text-foreground" : "text-white"
          )}>
            SUDDENLY
          </span>
        </Link>

        {/* Desktop Nav Links */}
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

        {/* Desktop & Mobile Actions */}
        <div className="flex items-center space-x-0.5 md:space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
                "transition-colors",
                isScrolled ? "text-muted-foreground hover:text-foreground" : "text-white/70 hover:text-white"
            )}
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </Button>
          
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
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          <Link href={profileLink}>
            <Button 
                variant="ghost" 
                size="icon" 
                aria-label="Account" 
                className={cn(
                    "transition-colors",
                    isScrolled ? "text-muted-foreground hover:text-foreground" : "text-white/70 hover:text-white",
                    (user || isAdmin) && "text-primary"
                )}
            >
              <User className="w-5 h-5" />
            </Button>
          </Link>

          <Link href="/cart">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "relative transition-colors",
                isScrolled ? "text-muted-foreground hover:text-foreground" : "text-white/70 hover:text-white"
              )}
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile Menu Sidebar */}
      {mobileMenuOpen && (
          <>
            <div
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <div
              className="fixed top-0 left-0 bottom-0 w-[80vw] max-w-[320px] bg-background z-[60] lg:hidden p-6 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between mb-10">
                <span className="text-2xl font-display font-bold tracking-tighter">SUDDENLY</span>
                <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu" className="p-2">
                  <X className="w-6 h-6" />
                </button>
              </div>

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
                <Link href="/shop" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full py-6 rounded-2xl text-lg font-medium">
                    Shop Collection
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}
    </header>
  );
}
