"use client";

import { Package, Truck, AlertCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

interface OrderCardProps {
    orderId: string;
    status: string;
    total: number;
    items: any[];
    itemCount: number;
}

export function OrderCard({ orderId, status, total, items, itemCount }: OrderCardProps) {
    return (
        <div className="mt-2 bg-card rounded-lg border border-border overflow-hidden max-w-[280px]">
            <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    <span className="font-mono text-xs font-medium">{orderId.slice(-8)}</span>
                </div>
                <OrderStatusBadge status={status as any} />
            </div>

            <div className="p-3 space-y-3">
                <div className="space-y-2">
                    {items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                            <span className="w-5 h-5 bg-muted rounded flex items-center justify-center text-[10px] text-muted-foreground font-medium">
                                x{item.quantity}
                            </span>
                            <span className="truncate flex-1">{item.name}</span>
                        </div>
                    ))}
                    {itemCount > items.length && (
                        <p className="text-[10px] text-muted-foreground pl-7">
                            +{itemCount - items.length} more items
                        </p>
                    )}
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-medium">{formatPrice(total)}</span>
                </div>
            </div>
        </div>
    );
}
