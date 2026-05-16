"use client";

import { useEffect, useState } from "react";
import { Review } from "@/types/store";
import { ProductService } from "@/services/product.service";
import { ReviewList } from "./ReviewList";
import { ReviewForm } from "./ReviewForm";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { StarRating } from "./StarRating";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewSectionProps {
    productId: string;
    averageRating?: number;
    reviewCount?: number;
}

export function ReviewSection({ productId, averageRating = 0, reviewCount = 0 }: ReviewSectionProps) {
    const { user, isLoading: authLoading } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [canReview, setCanReview] = useState(false);
    const [verifying, setVerifying] = useState(false);

    const fetchReviews = async () => {
        const data = await ProductService.getReviews(productId);
        setReviews(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    useEffect(() => {
        const checkEligibility = async () => {
            if (user) {
                setVerifying(true);
                const isVerified = await ProductService.checkVerifiedPurchase(user.uid, productId);
                setCanReview(isVerified);
                setVerifying(false);
            } else {
                setCanReview(false);
            }
        };

        if (!authLoading) {
            checkEligibility();
        }
    }, [user, productId, authLoading]);

    return (
        <section className="py-8 md:py-16 border-t border-border mt-8 md:mt-16" id="reviews">
            <div className="flex flex-col md:flex-row gap-12">
                {/* Summary Column */}
                {/* Summary Column - Stats Board */}
                <div className="md:w-1/3 space-y-8">
                    <h2 className="font-serif text-3xl text-foreground">Ratings & Reviews</h2>

                    <div className="bg-card p-4 md:p-6 rounded-2xl border border-border shadow-sm">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="text-center">
                                <div className="text-5xl font-bold text-foreground mb-1">
                                    {averageRating.toFixed(1)}<span className="text-2xl text-muted-foreground">★</span>
                                </div>
                                <p className="text-sm text-muted-foreground font-medium">{reviewCount} Ratings &</p>
                                <p className="text-sm text-muted-foreground font-medium">{reviews.length} Reviews</p>
                            </div>
                            <div className="h-16 w-px bg-border" />
                            <div className="flex-1 space-y-2">
                                {[5, 4, 3, 2, 1].map((star) => {
                                    const count = reviews.filter(r => Math.round(r.rating) === star).length;
                                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                                    return (
                                        <div key={star} className="flex items-center gap-3 text-xs">
                                            <span className="font-medium w-3 text-muted-foreground">{star} ★</span>
                                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={cn("h-full rounded-full transition-all duration-500",
                                                        star >= 4 ? "bg-green-500" :
                                                            star === 3 ? "bg-green-400" :
                                                                star === 2 ? "bg-orange-400" : "bg-red-500"
                                                    )}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="w-8 text-right text-muted-foreground">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {user ? (
                            <>
                                {verifying ? (
                                    <p className="text-sm text-muted-foreground text-center">Checking eligibility...</p>
                                ) : canReview ? (
                                    !showForm && (
                                        <Button
                                            onClick={() => setShowForm(true)}
                                            className="w-full bg-primary text-primary-foreground border border-primary hover:bg-primary/90 shadow-sm"
                                        >
                                            Rate Product
                                        </Button>
                                    )
                                ) : (
                                    <div className="bg-muted/50 p-4 rounded-lg text-xs text-muted-foreground flex gap-2 items-start border border-border">
                                        <Lock size={14} className="mt-0.5 shrink-0" />
                                        <span>
                                            Only verified purchasers can leave reviews.
                                        </span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-muted/50 p-4 rounded-lg text-xs text-muted-foreground text-center border border-border">
                                <a href={`/login?redirect=/product/${productId}`} className="font-medium text-foreground hover:underline">Log in</a> to write a review.
                            </div>
                        )}
                    </div>
                </div>

                {/* Reviews List / Form Column */}
                <div className="md:w-2/3">
                    {showForm && user ? (
                        <div className="mb-10">
                            <ReviewForm
                                productId={productId}
                                userId={user.uid}
                                userName={user.displayName || "Anonymous"}
                                onSuccess={() => {
                                    setShowForm(false);
                                    fetchReviews();
                                    // Optimistic update for stats could happen here or parent, 
                                    // but we rely on re-fetch for now logic resides in service
                                    // Ideally we'd trigger a context refresh for the product data too
                                }}
                                onCancel={() => setShowForm(false)}
                            />
                        </div>
                    ) : null}

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-24 bg-muted animate-pulse rounded" />
                            ))}
                        </div>
                    ) : (
                        <ReviewList reviews={reviews} />
                    )}
                </div>
            </div>
        </section>
    );
}
