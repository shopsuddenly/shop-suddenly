import { OrderStatus } from "@/types/order";
import { Check, Package, Truck, Home, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderTimelineProps {
    currentStatus: OrderStatus;
    className?: string;
}

const timelineSteps: {
    status: OrderStatus;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}[] = [
        { status: 'placed', label: 'Order Placed', icon: Check },
        { status: 'packed', label: 'Packed', icon: Package },
        { status: 'shipped', label: 'Shipped', icon: Truck },
        { status: 'delivered', label: 'Delivered', icon: Home },
    ];

const statusOrder: Record<OrderStatus, number> = {
    placed: 0,
    packed: 1,
    shipped: 2,
    delivered: 3,
    cancelled: -1,
    return_requested: 4,
    return_approved: 5,
    return_rejected: 5,
    refunded: 6,
    replaced: 6
};

export function OrderTimeline({ currentStatus, className }: OrderTimelineProps) {
    const currentIndex = statusOrder[currentStatus];
    const isCancelled = currentStatus === 'cancelled';

    if (isCancelled) {
        return (
            <div className={cn("flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded", className)}>
                <X className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-red-800">Order Cancelled</span>
            </div>
        );
    }

    return (
        <div className={cn("space-y-6", className)}>
            {timelineSteps.map((step, index) => {
                const isCompleted = index <= currentIndex;
                const isCurrent = index === currentIndex;
                const Icon = step.icon;

                return (
                    <div key={step.status} className="flex items-start gap-4">
                        {/* Icon */}
                        <div
                            className={cn(
                                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                                isCompleted
                                    ? "bg-primary border-primary text-primary-foreground"
                                    : "bg-muted border-border text-muted-foreground"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-8">
                            <p
                                className={cn(
                                    "font-medium text-sm",
                                    isCompleted ? "text-foreground" : "text-muted-foreground"
                                )}
                            >
                                {step.label}
                            </p>
                            {isCurrent && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Current status
                                </p>
                            )}
                        </div>

                        {/* Connector Line */}
                        {index < timelineSteps.length - 1 && (
                            <div
                                className={cn(
                                    "absolute left-5 top-10 w-0.5 h-6 -ml-px",
                                    isCompleted ? "bg-primary" : "bg-border"
                                )}
                                style={{ transform: "translateY(100%)" }}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
