"use client";

import { useState } from "react";
import { StarRating } from "./StarRating";
import { ProductService } from "@/services/product.service";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
    productId: string;
    userId: string;
    userName: string;
    onSuccess: () => void;
    onCancel?: () => void;
    className?: string;
}

export function ReviewForm({ productId, userId, userName, onSuccess, onCancel, className }: ReviewFormProps) {
    const [rating, setRating] = useState(5);
    const [title, setTitle] = useState("");
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Please select a rating");
            return;
        }
        if (!comment.trim()) {
            toast.error("Please write a comment");
            return;
        }

        setLoading(true);
        try {
            await ProductService.addReview({
                userId,
                userName,
                productId,
                rating,
                title,
                comment
            });
            toast.success("Review submitted! It will appear publicly after approval.");
            setComment("");
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit review. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={cn("bg-card border border-border rounded-lg p-6 max-w-2xl animate-in fade-in zoom-in-95 duration-200", className)}>
            <h3 className="font-serif text-lg mb-4 text-foreground">Write a Review</h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Rating</label>
                    <StarRating
                        rating={rating}
                        editable={true}
                        size={24}
                        onRatingChange={setRating}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Awesome Product!"
                        className="w-full rounded-md border border-input bg-background p-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Your Review</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="What did you like or dislike?"
                        rows={4}
                        className="w-full rounded-md border border-input bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-primary text-primary-foreground text-sm font-medium rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Submit Review
                    </button>
                </div>
            </div>
        </form>
    );
}
