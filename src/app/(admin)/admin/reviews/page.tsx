"use client";

import { useEffect, useState } from "react";
import { Review } from "@/types/store";
import { ProductService } from "@/services/product.service";
import { formatDistanceToNow } from "date-fns";
import { StarRating } from "@/components/product/reviews/StarRating";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/common/Badge"; // Assuming we have a Badge component or use custom
import { Check, X, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchReviews = async () => {
        setLoading(true);
        const data = await ProductService.getAdminReviews();
        setReviews(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleStatusUpdate = async (review: Review, newStatus: 'approved' | 'rejected') => {
        setActionLoading(review.id);
        try {
            await ProductService.updateReviewStatus(review.id, review.productId, newStatus);
            toast.success(`Review ${newStatus} successfully`);

            // Optimistic update
            setReviews(prev => prev.map(r =>
                r.id === review.id ? { ...r, status: newStatus } : r
            ));
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>;
            case 'rejected':
                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>;
            default:
                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-serif">Reviews & Moderation</h1>
                <Button onClick={fetchReviews} variant="outline" size="sm">
                    Refresh
                </Button>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Product ID</th>
                                <th className="px-6 py-4 font-medium">User</th>
                                <th className="px-6 py-4 font-medium w-1/3">Review</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {reviews.map((review) => (
                                <tr key={review.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        {getStatusBadge(review.status)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/product/${review.productId}`} className="font-mono text-xs text-blue-600 hover:underline">
                                            {review.productId}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{review.userName}</div>
                                        {review.verifiedPurchase && (
                                            <div className="text-[10px] text-green-600 font-medium uppercase mt-0.5">Verified</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <StarRating rating={review.rating} size={12} />
                                            <p className="text-slate-600 line-clamp-2">{review.comment}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                        {review.createdAt ? (
                                            typeof review.createdAt === 'string'
                                                ? formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })
                                                : "Recently"
                                        ) : "Unknown"}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {review.status !== 'approved' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleStatusUpdate(review, 'approved')}
                                                    disabled={actionLoading === review.id}
                                                    className="h-8 w-8 p-0 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border-green-200"
                                                    variant="outline"
                                                    title="Approve"
                                                >
                                                    {actionLoading === review.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                                </Button>
                                            )}
                                            {review.status !== 'rejected' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleStatusUpdate(review, 'rejected')}
                                                    disabled={actionLoading === review.id}
                                                    className="h-8 w-8 p-0 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200"
                                                    variant="outline"
                                                    title="Reject"
                                                >
                                                    {actionLoading === review.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {reviews.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        No reviews found to moderate.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
