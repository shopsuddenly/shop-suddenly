"use client";

import { EmptyState } from "@/components/feedback/EmptyState";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { CartItemCard } from "./CartItemCard";
import { CartTotals } from "./CartTotals";
import { useEffect, useState } from "react";

export function CartClient() {
    const { items, totals, _hasHydrated } = useCartStore();

    console.log('📄 [CART PAGE] Rendering CartClient', {
        hasHydrated: _hasHydrated,
        itemCount: items.length,
        items: items.map(i => ({ id: i.id, name: i.product?.name, qty: i.quantity }))
    });

    // Wait for hydration
    if (!_hasHydrated) {
        console.log('⏳ [CART PAGE] Waiting for hydration...');
        return <div className="h-screen flex items-center justify-center">Loading...</div>;
    }

    if (items.length === 0) {
        console.log('📭 [CART PAGE] Cart is empty, showing EmptyState');
        return (
            <section className="pt-32 pb-16">
                <div className="luxury-container">
                    <EmptyState
                        title="Your bag is empty"
                        description="Looks like you haven't added anything to your bag yet. Explore our collections and find something you'll love."
                        icon={<ShoppingBag className="w-16 h-16" />}
                        actionLabel="Continue Shopping"
                        actionLink="/shop"
                    />
                </div>
            </section>
        );
    }

    return (
        <section className="pt-32 pb-16">
            <div className="luxury-container">
                <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-12">
                    Shopping Bag
                </h1>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-0">
                        {/* Header */}
                        <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-border text-xs font-sans uppercase tracking-luxury text-muted-foreground">
                            <div className="col-span-6">Product</div>
                            <div className="col-span-2 text-center">Size</div>
                            <div className="col-span-2 text-center">Quantity</div>
                            <div className="col-span-2 text-right">Total</div>
                        </div>

                        {/* Items */}
                        {items.map((item) => (
                            <CartItemCard key={item.id} item={item} />
                        ))}

                        {/* Continue Shopping */}
                        <div className="pt-8">
                            <Link
                                href="/shop"
                                className="text-sm font-sans uppercase tracking-luxury text-muted-foreground hover:text-foreground transition-colors"
                            >
                                ← Continue Shopping
                            </Link>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="lg:col-span-1">
                        <CartTotals totals={totals} />
                    </div>
                </div>
            </div>
        </section>
    );
}

