"use client";

import { formatPrice } from "@/lib/utils";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
    { id: 1, name: "Address" },
    { id: 2, name: "Summary" },
    { id: 3, name: "Payment" },
];

export function CheckoutClient() {
    const [currentStep, setCurrentStep] = useState(1);

    return (
        <section className="pt-32 pb-16">
            <div className="luxury-container max-w-4xl">
                <h1 className="font-serif text-4xl text-foreground mb-8 text-center">
                    Checkout
                </h1>

                {/* Stepper */}
                <div className="flex items-center justify-center mb-12">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex items-center">
                            <div className="flex items-center gap-3">
                                <div
                                    className={cn(
                                        "w-10 h-10 flex items-center justify-center border transition-all duration-300",
                                        currentStep > step.id
                                            ? "bg-primary border-primary text-primary-foreground"
                                            : currentStep === step.id
                                                ? "border-primary text-primary"
                                                : "border-border text-muted-foreground"
                                    )}
                                >
                                    {currentStep > step.id ? (
                                        <Check className="w-4 h-4" />
                                    ) : (
                                        <span className="font-sans text-sm">{step.id}</span>
                                    )}
                                </div>
                                <span
                                    className={cn(
                                        "font-sans text-sm uppercase tracking-luxury hidden sm:block",
                                        currentStep >= step.id
                                            ? "text-foreground"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    {step.name}
                                </span>
                            </div>
                            {index < steps.length - 1 && (
                                <ChevronRight className="w-4 h-4 mx-4 text-border" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <div className="bg-card border border-border p-8 md:p-12">
                    {currentStep === 1 && (
                        <div className="space-y-6 animate-fade-in">
                            <h2 className="font-serif text-2xl mb-6">Shipping Address</h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-sans uppercase tracking-luxury text-muted-foreground mb-2">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-transparent border border-border px-4 py-3 font-sans text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-sans uppercase tracking-luxury text-muted-foreground mb-2">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-transparent border border-border px-4 py-3 font-sans text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-sans uppercase tracking-luxury text-muted-foreground mb-2">
                                    Address
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-transparent border border-border px-4 py-3 font-sans text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                                    placeholder="Street address"
                                />
                            </div>

                            <div>
                                <input
                                    type="text"
                                    className="w-full bg-transparent border border-border px-4 py-3 font-sans text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                                    placeholder="Apartment, suite, etc. (optional)"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-sans uppercase tracking-luxury text-muted-foreground mb-2">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-transparent border border-border px-4 py-3 font-sans text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-sans uppercase tracking-luxury text-muted-foreground mb-2">
                                        Postal Code
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-transparent border border-border px-4 py-3 font-sans text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-sans uppercase tracking-luxury text-muted-foreground mb-2">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    className="w-full bg-transparent border border-border px-4 py-3 font-sans text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-6 animate-fade-in">
                            <h2 className="font-serif text-2xl mb-6">Order Summary</h2>

                            <div className="space-y-4 pb-6 border-b border-border">
                                <div className="flex items-center justify-between text-sm font-sans">
                                    <span className="text-muted-foreground">Oversized Wool Coat (M) × 1</span>
                                    <span>$495.00</span>
                                </div>
                                <div className="flex items-center justify-between text-sm font-sans">
                                    <span className="text-muted-foreground">Silk Blend Shirt (L) × 2</span>
                                    <span>$350.00</span>
                                </div>
                            </div>

                            <div className="space-y-4 pb-6 border-b border-border">
                                <div className="flex items-center justify-between text-sm font-sans">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>$845.00</span>
                                </div>
                                <div className="flex items-center justify-between text-sm font-sans">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>Free</span>
                                </div>
                                <div className="flex items-center justify-between text-sm font-sans">
                                    <span className="text-muted-foreground">Tax</span>
                                    <span>$67.60</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="font-sans text-sm uppercase tracking-luxury">Total</span>
                                <span className="font-serif text-2xl">$912.60</span>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-6 animate-fade-in">
                            <h2 className="font-serif text-2xl mb-6">Payment</h2>

                            <div>
                                <label className="block text-xs font-sans uppercase tracking-luxury text-muted-foreground mb-2">
                                    Card Number
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-transparent border border-border px-4 py-3 font-sans text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                                    placeholder="1234 5678 9012 3456"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-sans uppercase tracking-luxury text-muted-foreground mb-2">
                                        Expiry Date
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-transparent border border-border px-4 py-3 font-sans text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                                        placeholder="MM/YY"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-sans uppercase tracking-luxury text-muted-foreground mb-2">
                                        CVC
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-transparent border border-border px-4 py-3 font-sans text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                                        placeholder="123"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-sans uppercase tracking-luxury text-muted-foreground mb-2">
                                    Name on Card
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-transparent border border-border px-4 py-3 font-sans text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mt-12 pt-8 border-t border-border">
                        {currentStep > 1 ? (
                            <button
                                onClick={() => setCurrentStep(currentStep - 1)}
                                className="text-sm font-sans uppercase tracking-luxury text-muted-foreground hover:text-foreground transition-colors"
                            >
                                ← Back
                            </button>
                        ) : (
                            <Link
                                href="/cart"
                                className="text-sm font-sans uppercase tracking-luxury text-muted-foreground hover:text-foreground transition-colors"
                            >
                                ← Back to Cart
                            </Link>
                        )}

                        {currentStep < 3 ? (
                            <button
                                onClick={() => setCurrentStep(currentStep + 1)}
                                className="btn-luxury"
                            >
                                <span>Continue</span>
                            </button>
                        ) : (
                            <button className="btn-luxury">
                                <span>Place Order</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
