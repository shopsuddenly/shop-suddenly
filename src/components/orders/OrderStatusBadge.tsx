import { OrderStatus } from "@/types/order";
import { cn } from "@/lib/utils";

interface OrderStatusBadgeProps {
    status: OrderStatus;
    className?: string;
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
    placed: {
        label: "Order Placed",
        className: "bg-gray-100 text-gray-800 border-gray-300"
    },
    packed: {
        label: "Packed",
        className: "bg-blue-100 text-blue-800 border-blue-300"
    },
    shipped: {
        label: "Shipped",
        className: "bg-purple-100 text-purple-800 border-purple-300"
    },
    delivered: {
        label: "Delivered",
        className: "bg-green-100 text-green-800 border-green-300"
    },
    cancelled: {
        label: "Cancelled",
        className: "bg-red-100 text-red-800 border-red-300"
    },
    return_requested: {
        label: "Return Requested",
        className: "bg-amber-100 text-amber-800 border-amber-300"
    },
    return_approved: {
        label: "Return Approved",
        className: "bg-teal-100 text-teal-800 border-teal-300"
    },
    return_rejected: {
        label: "Return Rejected",
        className: "bg-rose-100 text-rose-800 border-rose-300"
    },
    refunded: {
        label: "Refunded",
        className: "bg-emerald-100 text-emerald-800 border-emerald-300"
    },
    replaced: {
        label: "Replaced",
        className: "bg-cyan-100 text-cyan-800 border-cyan-300"
    }
};

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <span
            className={cn(
                "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border",
                config.className,
                className
            )}
        >
            {config.label}
        </span>
    );
}
