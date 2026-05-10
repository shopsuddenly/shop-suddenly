"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { CouponService } from "@/services/coupon.service";
import { Coupon } from "@/types/store";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, CalendarIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

export default function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Dates
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date>(new Date());

    const [formData, setFormData] = useState<Partial<Coupon>>({
        code: "",
        type: "PERCENTAGE",
        value: 0,
        minPurchase: 0,
        maxDiscount: 0,
        usageLimit: 0,
        isActive: true
    });

    useEffect(() => {
        loadCoupon();
    }, []);

    const loadCoupon = async () => {
        try {
            const coupon = await CouponService.getCouponById(id);
            if (!coupon) {
                toast.error("Coupon not found");
                router.push("/admin/coupons");
                return;
            }
            setFormData(coupon);
            setStartDate(new Date(coupon.startDate));
            setEndDate(new Date(coupon.endDate));
        } catch (error) {
            toast.error("Failed to load coupon");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : (name === 'code' ? value.toUpperCase() : value)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (formData.type !== 'BOGO' && (!formData.code || !formData.value)) throw new Error("Code and Value are required");
            if (formData.type === 'BOGO' && !formData.code) throw new Error("Code is required");

            await CouponService.updateCoupon(id, {
                code: formData.code!,
                description: formData.description,
                type: formData.type as 'PERCENTAGE' | 'FIXED' | 'BOGO',
                value: formData.type === 'BOGO' ? 0 : formData.value!,
                minPurchase: formData.minPurchase || 0,
                maxDiscount: formData.maxDiscount || 0,
                usageLimit: formData.usageLimit || 0,
                limitPerUser: formData.limitPerUser || 0,
                buyQuantity: formData.buyQuantity || 0,
                getQuantity: formData.getQuantity || 0,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                isActive: formData.isActive
            });
            toast.success("Coupon updated successfully");
            router.push("/admin/coupons");
        } catch (error: any) {
            toast.error(error.message || "Failed to update coupon");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/admin/coupons">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="font-serif text-3xl md:text-4xl text-foreground">Edit Coupon</h1>
                    <p className="text-muted-foreground">Modify discount code details</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-6">

                {/* Code & Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Coupon Code</label>
                        <input
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            placeholder="e.g. SAVE20"
                            className="w-full bg-background border border-border rounded px-3 py-2 text-foreground font-mono uppercase focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Description</label>
                        <input
                            name="description"
                            value={formData.description || ''}
                            onChange={handleChange}
                            placeholder="e.g. Get 20% off on all items"
                            className="w-full bg-background border border-border rounded px-3 py-2 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Type & Discount */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Discount Type</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full bg-background border border-border rounded px-3 py-2 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        >
                            <option value="PERCENTAGE">Percentage (%)</option>
                            <option value="FIXED">Fixed Amount (₹)</option>
                            <option value="BOGO">Buy X Get Y (Free)</option>
                        </select>
                    </div>
                </div>

                {/* Value & Max Discount */}
                {formData.type !== 'BOGO' && (
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Discount Value</label>
                            <input
                                type="number"
                                name="value"
                                value={formData.value}
                                onChange={handleChange}
                                min="0"
                                className="w-full bg-background border border-border rounded px-3 py-2 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                required
                            />
                            <p className="text-xs text-muted-foreground">{formData.type === 'PERCENTAGE' ? '% Off' : '₹ Off'}</p>
                        </div>

                        {formData.type === 'PERCENTAGE' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Max Discount (₹)</label>
                                <input
                                    type="number"
                                    name="maxDiscount"
                                    value={formData.maxDiscount}
                                    onChange={handleChange}
                                    min="0"
                                    placeholder="0 for unlimited"
                                    className="w-full bg-background border border-border rounded px-3 py-2 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Requirements & Limits */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Min Purchase (₹)</label>
                        <input
                            type="number"
                            name="minPurchase"
                            value={formData.minPurchase}
                            onChange={handleChange}
                            min="0"
                            className="w-full bg-background border border-border rounded px-3 py-2 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Global Usage Limit</label>
                        <input
                            type="number"
                            name="usageLimit"
                            value={formData.usageLimit}
                            onChange={handleChange}
                            min="0"
                            placeholder="0 for unlimited"
                            className="w-full bg-background border border-border rounded px-3 py-2 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Limit Per User</label>
                        <input
                            type="number"
                            name="limitPerUser"
                            value={formData.limitPerUser || 0}
                            onChange={handleChange}
                            min="0"
                            placeholder="0 for unlimited"
                            className="w-full bg-background border border-border rounded px-3 py-2 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    {/* Placeholder for alignment */}
                    <div className="hidden md:block"></div>
                </div>

                {/* BOGO Fields */}
                {formData.type === 'BOGO' && (
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg space-y-4">
                        <h3 className="text-sm font-medium text-primary">Buy X Get Y Free</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Buy Quantity</label>
                                <input
                                    type="number"
                                    name="buyQuantity"
                                    value={formData.buyQuantity || 1}
                                    onChange={handleChange}
                                    min="1"
                                    className="w-full bg-background border border-border rounded px-3 py-2 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Get Quantity (Free)</label>
                                <input
                                    type="number"
                                    name="getQuantity"
                                    value={formData.getQuantity || 1}
                                    onChange={handleChange}
                                    min="1"
                                    className="w-full bg-background border border-border rounded px-3 py-2 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            For every {formData.buyQuantity || 1} items purchased, {formData.getQuantity || 1} cheapest items will be free.
                        </p>
                    </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2 flex flex-col">
                        <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal bg-background border-border text-foreground hover:bg-muted",
                                        !startDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-card border-border">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={(date) => date && setStartDate(date)}
                                    initialFocus
                                    className="text-foreground"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2 flex flex-col">
                        <label className="text-sm font-medium text-muted-foreground">End Date</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal bg-background border-border text-foreground hover:bg-muted",
                                        !endDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-card border-border">
                                <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={(date) => date && setEndDate(date)}
                                    initialFocus
                                    className="text-foreground"
                                    disabled={(date) => date < startDate}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
