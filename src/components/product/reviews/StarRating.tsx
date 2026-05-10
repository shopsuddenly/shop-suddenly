import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
    rating: number; // 0 to 5
    maxRating?: number;
    size?: number;
    editable?: boolean;
    onRatingChange?: (rating: number) => void;
    className?: string; // Additional classes for container
}

export function StarRating({
    rating,
    maxRating = 5,
    size = 16,
    editable = false,
    onRatingChange,
    className
}: StarRatingProps) {
    return (
        <div className={cn("flex items-center gap-0.5", className)}>
            {Array.from({ length: maxRating }).map((_, index) => {
                const isFull = index < Math.floor(rating);
                const isHalf = index === Math.floor(rating) && rating % 1 !== 0; // Not handling half stars in editable for now
                const starResult = index + 1;

                return (
                    <button
                        key={index}
                        type="button"
                        disabled={!editable}
                        onClick={() => editable && onRatingChange?.(starResult)}
                        className={cn(
                            "transition-colors",
                            editable ? "cursor-pointer hover:scale-110" : "cursor-default"
                        )}
                    >
                        <Star
                            size={size}
                            className={cn(
                                "fill-current",
                                index < rating
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-muted fill-transparent"
                            )}
                        />
                    </button>
                );
            })}
        </div>
    );
}
