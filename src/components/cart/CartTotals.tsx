import { formatPrice } from "@/lib/utils";
import { CartTotals as CartTotalsType } from "@/lib/cart.utils";
import { useCartStore } from "@/store/useCartStore";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface CartTotalsProps {
    totals: CartTotalsType;
}

export function CartTotals({ totals }: CartTotalsProps) {
    const { subtotal, shipping, discountTotal, total } = totals;


    return (
        <div className="bg-card border border-border p-6 md:p-8 sticky top-32">
            <h2 className="font-serif text-xl mb-6">Order Summary</h2>

            <div className="space-y-4 pb-6 border-b border-border">
                <div className="flex items-center justify-between text-sm font-sans">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                </div>
                {discountTotal > 0 && (
                    <div className="flex items-center justify-between text-sm font-sans text-green-600">
                        <span>Discount</span>
                        <span>-{formatPrice(discountTotal)}</span>
                    </div>
                )}
                <div className="flex items-center justify-between text-sm font-sans">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shipping === 0 ? <span className="text-green-600 font-medium">Free</span> : formatPrice(shipping)}</span>
                </div>

            </div>

            <div className="flex justify-between items-center font-bold text-lg pt-4 border-t border-border mt-4">
                <span>Total</span>
                <span className="font-serif text-2xl">{formatPrice(total)}</span>
            </div>

            <Link
                href="/checkout"
                onClick={() => useCartStore.getState().clearDirectCheckoutItem()}
                className="mt-6 w-full btn-luxury flex items-center justify-center gap-2"
            >
                <span>Checkout</span>
                <ArrowRight className="w-4 h-4" />
            </Link>

            <p className="text-xs text-muted-foreground text-center mt-4">
                Taxes calculated at checkout
            </p>
        </div>
    );
}
