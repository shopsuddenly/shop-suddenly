"use client";

import { useEffect, useState } from "react";
import { CouponService } from "@/services/coupon.service";
import { Coupon } from "@/types/store";
import { formatPrice } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { Plus, Loader2, Trash2, Edit, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCoupons();
    }, []);

    const loadCoupons = async () => {
        try {
            const data = await CouponService.getAllCoupons();
            setCoupons(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load coupons");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, code: string) => {
        if (!confirm(`Are you sure you want to delete coupon ${code}?`)) return;
        try {
            await CouponService.deleteCoupon(id);
            toast.success("Coupon deleted");
            loadCoupons();
        } catch (error) {
            toast.error("Failed to delete coupon");
        }
    };

    const toggleStatus = async (coupon: Coupon) => {
        try {
            await CouponService.updateCoupon(coupon.id!, { isActive: !coupon.isActive });
            toast.success(`Coupon ${coupon.isActive ? 'deactivated' : 'activated'}`);
            loadCoupons();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-3xl md:text-4xl text-foreground">Coupons</h1>
                    <p className="text-muted-foreground mt-1">Manage discount codes and promotions</p>
                </div>
                <Link href="/admin/coupons/new">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Coupon
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted border-b border-border">
                            <tr>
                                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Code</th>
                                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Value</th>
                                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Min Purchase</th>
                                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Usage</th>
                                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {coupons.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                        No coupons found. Create one to get started.
                                    </td>
                                </tr>
                            ) : (
                                coupons.map((coupon) => (
                                    <tr key={coupon.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-4 py-4 font-mono font-bold text-foreground">{coupon.code}</td>
                                        <td className="px-4 py-4 text-muted-foreground">{coupon.type}</td>
                                        <td className="px-4 py-4 font-medium text-green-400">
                                            {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : formatPrice(coupon.value)}
                                        </td>
                                        <td className="px-4 py-4 text-muted-foreground">
                                            {coupon.minPurchase ? formatPrice(coupon.minPurchase) : '-'}
                                        </td>
                                        <td className="px-4 py-4 text-muted-foreground">
                                            {coupon.usedCount} / {coupon.usageLimit || '∞'}
                                        </td>
                                        <td className="px-4 py-4">
                                            <button
                                                onClick={() => toggleStatus(coupon)}
                                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${coupon.isActive
                                                    ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                                    : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                                                    }`}
                                            >
                                                {coupon.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                {coupon.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-4 py-4 text-right flex items-center justify-end gap-2">
                                            <Link href={`/admin/coupons/${coupon.id}`}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDelete(coupon.id!, coupon.code)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
