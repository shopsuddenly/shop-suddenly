"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    FolderTree,
    Settings,
    LogOut,
    Users,
    Star,
    Ticket,
    Mail,
    RotateCcw,
    Headphones,
    Receipt
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const menuItemClass = (path: string) => `flex items-center gap-3 px-3 py-2 rounded-md transition-colors font-sans text-sm tracking-wide ${pathname === path
        ? "bg-primary/10 text-primary border-r-2 border-primary"
        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
        }`;

    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border/40 flex flex-col shrink-0 bg-card/30 backdrop-blur-xl">
                <div className="h-20 flex items-center px-6 border-b border-border/40">
                    <Link href="/admin" className="font-serif text-2xl tracking-wide text-foreground">
                        Go<span className="text-primary">Admin</span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <div className="text-[10px] font-sans uppercase tracking-luxury text-muted-foreground px-3 mb-2 mt-2">Overview</div>
                    <Link href="/admin" className={menuItemClass('/admin')}>
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Dashboard</span>
                    </Link>

                    <div className="text-[10px] font-sans uppercase tracking-luxury text-muted-foreground px-3 mb-2 mt-6">Management</div>
                    <Link href="/admin/products" className={menuItemClass('/admin/products')}>
                        <Package className="w-4 h-4" />
                        <span>Products</span>
                    </Link>
                    <Link href="/admin/categories" className={menuItemClass('/admin/categories')}>
                        <FolderTree className="w-4 h-4" />
                        <span>Categories</span>
                    </Link>
                    <Link href="/admin/orders" className={menuItemClass('/admin/orders')}>
                        <Users className="w-4 h-4" />
                        <span>Orders</span>
                    </Link>
                    <Link href="/admin/reviews" className={menuItemClass('/admin/reviews')}>
                        <Star className="w-4 h-4" />
                        <span>Reviews</span>
                    </Link>
                    <Link href="/admin/coupons" className={menuItemClass('/admin/coupons')}>
                        <Ticket className="w-4 h-4" />
                        <span>Coupons</span>
                    </Link>
                    <Link
                        href="/admin/inventory"
                        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname === '/admin/inventory'
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                            }`}
                    >
                        <Package className="w-5 h-5" />
                        Inventory
                    </Link>
                    <Link href="/admin/cms" className={menuItemClass('/admin/cms')}>
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Content</span>
                    </Link>
                    <Link href="/admin/marketing" className={menuItemClass('/admin/marketing')}>
                        <Mail className="w-4 h-4" />
                        <span>Marketing</span>
                    </Link>
                    <Link href="/admin/returns" className={menuItemClass('/admin/returns')}>
                        <RotateCcw className="w-4 h-4" />
                        <span>Returns</span>
                    </Link>
                    <Link href="/admin/support" className={menuItemClass('/admin/support')}>
                        <Headphones className="w-4 h-4" />
                        <span>Support</span>
                    </Link>

                    <div className="text-[10px] font-sans uppercase tracking-luxury text-muted-foreground px-3 mb-2 mt-6">System</div>
                    <Link href="/admin/gst-config" className={menuItemClass('/admin/gst-config')}>
                        <Receipt className="w-4 h-4" />
                        <span>GST & Tax</span>
                    </Link>
                    <Link href="/admin/settings" className={menuItemClass('/admin/settings')}>
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-border/40">
                    <button
                        onClick={() => {
                            logout(); // Fire and forget
                            window.location.href = '/';
                        }}
                        className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-background">
                {children}
            </main>
        </div >
    );
}
