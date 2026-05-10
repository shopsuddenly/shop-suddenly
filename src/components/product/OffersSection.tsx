import { Tag, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { CouponService } from "@/services/coupon.service";
import { Coupon } from "@/types/store";
import { toast } from "sonner"; // Optional: for error handling

export function OffersSection() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const allCoupons = await CouponService.getAllCoupons();
                // Client-side filter for Active & Valid Date coupons
                const validCoupons = allCoupons.filter(c => {
                    const now = new Date();
                    return (
                        c.isActive &&
                        new Date(c.startDate) <= now &&
                        new Date(c.endDate) >= now
                    );
                });
                setCoupons(validCoupons);
            } catch (error) {
                console.error("Failed to fetch offers", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCoupons();
    }, []);

    if (loading) {
        return (
            <div className="space-y-4 py-4 animate-pulse">
                <div className="h-6 w-32 bg-secondary rounded" />
                <div className="space-y-3">
                    <div className="h-10 w-full bg-secondary rounded" />
                    <div className="h-10 w-full bg-secondary rounded" />
                </div>
            </div>
        );
    }

    if (coupons.length === 0) return null;

    return (
        <div className="space-y-4 py-4">
            <h3 className="font-serif text-lg font-medium text-foreground">Available offers</h3>

            <div className="space-y-3">
                {coupons.slice(0, 4).map((coupon) => (
                    <div key={coupon.id} className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <Tag className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5 fill-green-600" />
                        <p className="text-sm font-sans text-muted-foreground leading-relaxed">
                            <span className="font-bold text-foreground">{coupon.code}</span>
                            {" "}
                            {coupon.description || (
                                <>
                                    Get <span className="font-medium text-foreground">
                                        {coupon.type === 'PERCENTAGE' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                                    </span>
                                    {coupon.minPurchase ? ` on orders above ₹${coupon.minPurchase}` : ""}
                                </>
                            )}
                            {" "}
                            <button className="text-primary hover:underline font-medium ml-1">
                                T&C
                            </button>
                        </p>
                    </div>
                ))}
            </div>

            {coupons.length > 4 && (
                <button className="text-primary font-medium text-sm hover:underline font-sans">
                    View {coupons.length - 4} more offers
                </button>
            )}
        </div>
    );
}
