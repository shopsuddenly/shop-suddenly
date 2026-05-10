import { Review } from "@/types/store";
import { Star, ThumbsUp, ThumbsDown, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface ReviewListProps {
    reviews: Review[];
}

export function ReviewList({ reviews }: ReviewListProps) {
    if (reviews.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground bg-card rounded-lg border border-border">
                <p className="font-medium text-foreground mb-1">No reviews yet</p>
                <p className="text-sm">Be the first to review this product!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {reviews.map((review) => (
                <div key={review.id} className="border-b border-border last:border-0 pb-6 last:pb-0 animate-in slide-in-from-bottom-2 duration-300">
                    {/* Header: Rating & Title */}
                    <div className="flex items-center gap-3 mb-3">
                        <div className={cn(
                            "flex items-center gap-1 px-2 py-0.5 rounded text-white text-xs font-bold",
                            review.rating >= 4 ? "bg-green-600" :
                                review.rating === 3 ? "bg-green-500" :
                                    review.rating === 2 ? "bg-orange-500" : "bg-red-500"
                        )}>
                            <span>{review.rating}</span>
                            <Star className="w-3 h-3 fill-current" />
                        </div>
                        <h4 className="font-medium text-foreground line-clamp-1">
                            {review.title || "Product Review"}
                        </h4>
                    </div>

                    {/* Comment */}
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                        {review.comment}
                    </p>

                    {/* Footer: User Info & Actions */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{review.userName}</span>
                            {review.verifiedPurchase && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <CheckCircle2 className="w-3 h-3 text-muted-foreground fill-card" />
                                    <span>Certified Buyer</span>
                                </div>
                            )}
                            <span>•</span>
                            <span>
                                {review.createdAt && (typeof review.createdAt === 'object' ?
                                    formatDistanceToNow(review.createdAt.toDate(), { addSuffix: true }) :
                                    typeof review.createdAt === 'string' ? formatDistanceToNow(new Date(review.createdAt), { addSuffix: true }) : "Recently")
                                }
                            </span>
                        </div>

                        {/* Helpful Actions (Static for now) */}
                        <div className="flex items-center gap-4">
                            <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                                <ThumbsUp className="w-3 h-3" />
                                <span>{Math.floor(Math.random() * 10)}</span>
                            </button>
                            <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                                <ThumbsDown className="w-3 h-3" />
                                <span>0</span>
                            </button>
                        </div>
                    </div>
                </div>
            ))}
            <div className="pt-4">
                <p className="text-sm font-medium text-blue-600 hover:underline cursor-pointer">
                    All {reviews.length} reviews +
                </p>
            </div>
        </div>
    );
}
