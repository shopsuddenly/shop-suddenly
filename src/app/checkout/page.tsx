"use client";

import { AddressSelector } from "@/components/checkout/AddressSelector";
import { CheckoutSummary } from "@/components/checkout/CheckoutSummary";
import { useAuth } from "@/hooks/useAuth";
import { useCartStore } from "@/store/useCartStore";
import { Address } from "@/types/user";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { calculateCartTotals } from "@/lib/cart.utils";

export default function CheckoutPage() {
    const { user, isLoading: authLoading } = useAuth();
    const { items: cartItems, directCheckoutItem, clearDirectCheckoutItem, activeCoupon } = useCartStore(); // Get activeCoupon
    const router = useRouter();

    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

    // Derived state for what we are actually checking out
    const itemsToCheckout = useMemo(() => {
        return directCheckoutItem ? [directCheckoutItem] : cartItems;
    }, [directCheckoutItem, cartItems]);

    const checkoutTotals = useMemo(() => {
        const coupons = activeCoupon ? [activeCoupon] : [];
        return calculateCartTotals(itemsToCheckout, coupons);
    }, [itemsToCheckout, activeCoupon]);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login?redirect=/checkout");
        }
    }, [user, authLoading, router]);

    // Cleanup direct checkout on unmount ? No, maybe on successful order?
    // If user leaves checkout properly, we clear? 
    // Usually, if they navigate away (back), they might want t keep it?
    // Let's rely on explicit clear or overwrite.

    // If user navigates back to shop, maybe we clear?
    // For now, no auto-cleanup on unmount to prevent accidental loss if page refresh.

    if (authLoading || !user) {
        return <div className="h-screen flex items-center justify-center">Loading...</div>;
    }

    if (itemsToCheckout.length === 0) {
        return (
            <div className="py-32 text-center">
                <h1 className="text-2xl font-serif">Your cart is empty</h1>
                <button onClick={() => router.push('/shop')} className="text-primary hover:underline mt-4">Go to Shop</button>
            </div>
        );
    }

    return (
        <section className="pt-32 pb-16 min-h-screen bg-background">
            <div className="luxury-container">
                <h1 className="font-serif text-4xl md:text-5xl mb-12">
                    {directCheckoutItem ? "Buy Now Checkout" : "Checkout"}
                </h1>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Address Section */}
                        <AddressSelector
                            selectedAddressId={selectedAddress?.id}
                            onSelect={setSelectedAddress}
                        />

                        {/* Future: Payment Method Section */}
                    </div>

                    {/* Right Column: Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-card border border-border p-6 rounded-lg sticky top-32">
                            <h2 className="font-serif text-xl mb-6">Order Summary</h2>
                            <CheckoutSummary
                                onPlaceOrder={() => router.push('/checkout/payment')}
                                isProcessing={false}
                                canPlaceOrder={!!selectedAddress}
                                overrideItems={directCheckoutItem ? itemsToCheckout : undefined}
                                overrideTotals={directCheckoutItem ? checkoutTotals : undefined}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}