"use client";

import { PaymentMethod } from "@/types/order";
import { Banknote, CreditCard, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentMethodSelectorProps {
    selected: PaymentMethod | null;
    onSelect: (method: PaymentMethod) => void;
}

const paymentMethods = [
    {
        id: 'COD' as PaymentMethod,
        name: 'Cash on Delivery',
        description: 'Pay when you receive your order',
        icon: Banknote,
        enabled: true
    },
    {
        id: 'ONLINE' as PaymentMethod, // Using ONLINE generic ID for Razorpay
        name: 'Pay with Razorpay',
        description: 'UPI, Credit/Debit Card, Netbanking',
        icon: CreditCard,
        enabled: true,
        badge: 'Secure'
    }
];

export function PaymentMethodSelector({ selected, onSelect }: PaymentMethodSelectorProps) {
    return (
        <div className="space-y-3">
            {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = selected === method.id;
                const isDisabled = !method.enabled;

                return (
                    <button
                        key={method.id}
                        type="button"
                        onClick={() => method.enabled && onSelect(method.id)}
                        disabled={isDisabled}
                        className={cn(
                            "w-full p-4 border rounded-lg text-left transition-all",
                            "flex items-start gap-4",
                            isSelected && method.enabled && "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2",
                            !isSelected && method.enabled && "border-border hover:border-primary/50",
                            isDisabled && "opacity-60 cursor-not-allowed bg-muted/30"
                        )}
                    >
                        {/* Radio Circle */}
                        <div className="flex-shrink-0 mt-0.5">
                            <div
                                className={cn(
                                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                    isSelected && method.enabled
                                        ? "border-primary bg-primary"
                                        : "border-border bg-background"
                                )}
                            >
                                {isSelected && method.enabled && (
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                )}
                            </div>
                        </div>

                        {/* Icon */}
                        <div className="flex-shrink-0">
                            <Icon className={cn(
                                "w-6 h-6",
                                isSelected && method.enabled ? "text-primary" : "text-muted-foreground"
                            )} />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "font-medium",
                                    isDisabled && "text-muted-foreground"
                                )}>
                                    {method.name}
                                </span>
                                {method.badge && (
                                    <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                                        {method.badge}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                                {method.description}
                            </p>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
