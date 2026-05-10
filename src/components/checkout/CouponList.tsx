"use client";

import { useState, useEffect } from "react";
import { Coupon } from "@/types/store";
import { CouponService } from "@/services/coupon.service";
import { useCartStore } from "@/store/useCartStore";
import { calculateCartTotals } from "@/lib/cart.utils";
import { Loader2, TicketPercent, Check } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CouponListProps {
    onApply: (code: string) => void;
    activeCode?: string;
}

export function CouponList({ onApply, activeCode }: CouponListProps) {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const { items, totals } = useCartStore();

    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const allCoupons = await CouponService.getAllCoupons();
                const now = new Date();

                // Filter active coupons
                const active = allCoupons.filter(c =>
                    c.isActive &&
                    new Date(c.startDate) <= now &&
                    new Date(c.endDate) >= now
                );

                // Sort by highest potential saving
                const sorted = active.sort((a, b) => {
                    const savingA = calculatePotentialSaving(a);
                    const savingB = calculatePotentialSaving(b);
                    return savingB - savingA;
                });

                setCoupons(sorted);
            } catch (error) {
                console.error("Failed to fetch coupons", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCoupons();
    }, [items]); // Re-fetch/re-calc when items change

    const calculatePotentialSaving = (coupon: Coupon) => {
        // Create a temporary cart state simulation
        const tempTotals = calculateCartTotals(items, [coupon]);
        return tempTotals.discountTotal;
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>;
    }

    if (coupons.length === 0) {
        return <p className="text-center text-muted-foreground p-8">No coupons available at the moment.</p>;
    }

    return (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {coupons.map((coupon) => {
                const saving = calculatePotentialSaving(coupon);
                const isActive = activeCode === coupon.code;

                return (
                    <div
                        key={coupon.id}
                        className={cn(
                            "relative border rounded-lg p-4 transition-all",
                            isActive ? "bg-green-500/5 border-green-500/30" : "bg-card border-border hover:border-primary/50"
                        )}
                    >
                        {/* Ticket Perforation Holes (Visual Flair) */}
                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-background border-r border-border" />
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-background border-l border-border" />

                        <div className="flex justify-between items-start gap-4 ml-2 mr-2">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-mono font-bold text-lg uppercase tracking-wider">{coupon.code}</span>
                                    {isActive && <span className="bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1"><Check className="w-3 h-3" /> Applied</span>}
                                </div>
                                <p className="text-sm text-foreground/80 font-medium mb-1">
                                    {saving > 0 ? (
                                        <span className="text-green-600">Save {formatPrice(saving)}</span>
                                    ) : (
                                        <span className="text-muted-foreground">Not applicable on this cart</span>
                                    )}
                                </p>
                                {coupon.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-2">{coupon.description}</p>
                                )}
                                {!coupon.description && (
                                    <p className="text-xs text-muted-foreground">
                                        {coupon.type === 'BOGO'
                                            ? `Buy ${coupon.buyQuantity} get ${coupon.getQuantity} free`
                                            : `${coupon.type === 'PERCENTAGE' ? coupon.value + '% Off' : 'Flat Off'}`
                                        }
                                    </p>
                                )}
                            </div>

                            <button
                                onClick={() => onApply(coupon.code)}
                                disabled={isActive}
                                className={cn(
                                    "px-4 py-2 text-sm font-medium rounded transition-colors shrink-0",
                                    isActive
                                        ? "text-green-600 cursor-default"
                                        : "text-primary hover:bg-primary/10"
                                )}
                            >
                                {isActive ? "Applied" : "Apply"}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
