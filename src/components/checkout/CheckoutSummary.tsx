import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useCartStore } from "@/store/useCartStore";
import { Loader2, X, Ticket } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { CouponList } from "./CouponList";

import { CartItem } from "@/types/store"; // Import needed
import { calculateCartTotals, CartTotals } from "@/lib/cart.utils";

interface CheckoutSummaryProps {
    isProcessing?: boolean;
    onPlaceOrder: () => void;
    canPlaceOrder: boolean;
    // Optional overrides for Direct Checkout
    overrideItems?: CartItem[];
    overrideTotals?: CartTotals;
}

export function CheckoutSummary({ isProcessing, onPlaceOrder, canPlaceOrder, overrideItems, overrideTotals }: CheckoutSummaryProps) {
    const { user } = useAuth();
    const { items: storeItems, totals: storeTotals, applyCoupon, removeCoupon, activeCoupon, isLoading } = useCartStore();

    // Use overrides if provided, otherwise store state
    const items = overrideItems || storeItems;
    const totals = overrideTotals || storeTotals;

    const { subtotal, shipping, discountTotal, total } = totals;
    const [couponInput, setCouponInput] = useState("");
    const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false);

    const handleApplyCoupon = async (code: string) => {
        if (!code) return;
        await applyCoupon(code, user?.uid);
        setCouponInput("");
        setIsCouponDialogOpen(false);
    };

    return (
        <div className="bg-card border border-border p-6 md:p-8 sticky top-32">
            <h2 className="font-serif text-xl mb-6">Review Order</h2>

            {/* Condensed Items */}
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                    <div key={item.id} className="flex gap-4 items-center">
                        <div className="w-12 h-16 relative bg-muted flex-shrink-0">
                            {item.product?.images[0] && (
                                <Image
                                    src={item.product.images[0]}
                                    alt={item.product.name}
                                    fill
                                    className="object-cover"
                                />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-serif truncate">{item.product?.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity} | Size: {item.variantId || 'STD'}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-medium">{formatPrice(item.unitPrice * item.quantity)}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Coupon Input */}
            <div className="mb-6 pt-4 border-t border-border">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium">Promo Code</span>
                    <Dialog open={isCouponDialogOpen} onOpenChange={setIsCouponDialogOpen}>
                        <DialogTrigger asChild>
                            <button className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                                <Ticket className="w-3 h-3" />
                                View All Coupons
                            </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md bg-background border-border">
                            <DialogHeader>
                                <DialogTitle>Available Coupons</DialogTitle>
                            </DialogHeader>
                            <CouponList
                                onApply={handleApplyCoupon}
                                activeCode={activeCoupon?.code}
                            />
                        </DialogContent>
                    </Dialog>
                </div>

                {activeCoupon ? (
                    <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 p-3 rounded">
                        <div>
                            <p className="text-sm font-medium text-green-600 flex items-center gap-2">
                                <span className="font-mono uppercase">{activeCoupon.code}</span>
                                <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full">Applied</span>
                            </p>
                            <p className="text-xs text-green-700">
                                {activeCoupon.type === 'PERCENTAGE' ? `${activeCoupon.value}% Off` : (
                                    activeCoupon.type === 'BOGO' ? 'Buy X Get Y Free' : `₹${activeCoupon.value} Off`
                                )}
                            </p>
                            {activeCoupon.description && (
                                <p className="text-[10px] text-green-600/80 mt-1">{activeCoupon.description}</p>
                            )}
                        </div>
                        <button
                            onClick={removeCoupon}
                            className="text-red-500 hover:text-red-700 p-1"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <input
                            placeholder="Type code..."
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value)}
                            className="flex-1 bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary uppercase font-mono placeholder:normal-case"
                        />
                        <button
                            onClick={() => handleApplyCoupon(couponInput)}
                            disabled={!couponInput || isLoading}
                            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                        </button>
                    </div>
                )}
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? <span className="text-green-600 font-medium">Free</span> : formatPrice(shipping)}</span>
                </div>
                {discountTotal > 0 && (
                    <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-{formatPrice(discountTotal)}</span>
                    </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-4 border-t border-border">
                    <span>Total</span>
                    <span className="font-serif text-2xl">{formatPrice(total)}</span>
                </div>
            </div>
            <button
                onClick={onPlaceOrder}
                disabled={!canPlaceOrder || isProcessing}
                className="w-full btn-luxury flex items-center justify-center gap-2 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                    </>
                ) : (
                    <span>Place Order</span>
                )}
            </button>
        </div>
    );
}
