"use client";

import { useState, useMemo } from "react";
import { calculateCartTotals } from "@/lib/cart.utils";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCartStore } from "@/store/useCartStore";
import { useAddress } from "@/hooks/useAddress";
import { PaymentMethodSelector } from "@/components/checkout/PaymentMethodSelector";
import { CheckoutSummary } from "@/components/checkout/CheckoutSummary";
import { PaymentMethod, CreateOrderData, OrderItem } from "@/types/order";
import { OrderService } from "@/services/order.service";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function PaymentPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { items: cartItems, totals: cartTotals, clearCart, activeCoupon, directCheckoutItem } = useCartStore();
    const { addresses } = useAddress();

    const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    // Derived state for what we are actually checking out
    const items = directCheckoutItem ? [directCheckoutItem] : cartItems;

    // Recalculate totals ensuring we use the correct items
    // If direct checkout, we must recalculate because store.totals might be for the cart
    // Recalculate totals ensuring we use the correct items
    // If direct checkout, we must recalculate because store.totals might be for the cart
    const totals = useMemo(() => {
        if (directCheckoutItem) {
            const coupons = activeCoupon ? [activeCoupon] : [];
            return calculateCartTotals([directCheckoutItem], coupons);
        }
        return cartTotals;
    }, [directCheckoutItem, activeCoupon, cartTotals]);


    // Get default or first address
    const selectedAddress = addresses.find(a => a.isDefault) || addresses[0];

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePlaceOrder = async () => {
        console.log('💳 [PAYMENT] Place Order clicked');

        if (!selectedPayment) {
            toast.error("Please select a payment method");
            return;
        }

        if (!selectedAddress) {
            toast.error("Please add a delivery address");
            router.push('/checkout');
            return;
        }

        if (!user) {
            toast.error("Please log in to place order");
            router.push('/login?redirect=/checkout/payment');
            return;
        }

        if (items.length === 0) {
            toast.error("Your cart is empty");
            router.push('/shop');
            return;
        }

        setIsPlacingOrder(true);

        try {
            // Common Order Data Preparation
            const orderItems: OrderItem[] = items.map(item => ({
                productId: item.productId,
                name: item.product?.name || 'Unknown Product',
                variantId: item.variantId,
                size: item.variantId,
                image: item.product?.images[0] || '',
                quantity: item.quantity,
                unitPrice: item.unitPrice
            }));

            // --- RAZORPAY FLOW ---
            if (selectedPayment === 'ONLINE') {
                const isLoaded = await loadRazorpay();
                if (!isLoaded) {
                    throw new Error('Razorpay SDK failed to load');
                }

                // 1. Create Order on Backend
                const orderRes = await fetch('/api/payment/create-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: totals.total,
                        currency: 'INR',
                        receipt: `rcpt_${Date.now()}`
                    })
                });

                if (!orderRes.ok) throw new Error('Failed to create Razorpay order');
                const orderData = await orderRes.json();

                // 2. Open Razorpay Modal
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // We need to expose this client-side or fetch from server config
                    amount: orderData.amount,
                    currency: orderData.currency,
                    name: "Ecom Project", // Replace with actual store name
                    description: "Order Payment",
                    order_id: orderData.id,
                    handler: async function (response: any) {
                        try {
                            // 3. Verify Payment
                            const verifyRes = await fetch('/api/payment/verify', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature
                                })
                            });

                            const verifyData = await verifyRes.json();

                            if (verifyData.verified) {
                                // 4. Create Order in Firestore
                                await createOrderInFirestore(orderItems, {
                                    razorpayOrderId: response.razorpay_order_id,
                                    razorpayPaymentId: response.razorpay_payment_id
                                });
                            } else {
                                toast.error('Payment verification failed');
                            }
                        } catch (err) {
                            console.error('Payment verification error:', err);
                            toast.error('Payment failed after processing');
                        }
                    },
                    prefill: {
                        name: selectedAddress.name,
                        email: user.email,
                        contact: selectedAddress.phone
                    },
                    theme: {
                        color: "#000000"
                    }
                };

                const rzp1 = new (window as any).Razorpay(options);
                rzp1.open();
                rzp1.on('payment.failed', function (response: any) {
                    toast.error(response.error.description || "Payment failed");
                    setIsPlacingOrder(false);
                });

                // Note: setIsPlacingOrder(false) is handled in handler or payment.failed
                return;
            }

            // --- COD FLOW ---
            await createOrderInFirestore(orderItems);

        } catch (error: any) {
            console.error('❌ [PAYMENT] Order placement failed:', error);
            toast.error(error.message || "Failed to place order");
            setIsPlacingOrder(false);
        }
    };

    const createOrderInFirestore = async (orderItems: OrderItem[], paymentDetails?: { razorpayOrderId: string, razorpayPaymentId: string }) => {
        try {
            console.log('💳 [PAYMENT] Creating Firestore Order...');
            console.log('💳 [PAYMENT] Received Payment Details:', paymentDetails);

            const orderData: CreateOrderData = {
                userId: user!.uid,
                customerEmail: user!.email || '',
                items: orderItems,
                totals: totals,
                addressSnapshot: {
                    name: selectedAddress.name,
                    phone: selectedAddress.phone,
                    addressLine1: selectedAddress.addressLine1,
                    addressLine2: selectedAddress.addressLine2,
                    city: selectedAddress.city,
                    state: selectedAddress.state,
                    postalCode: selectedAddress.postalCode,
                    country: selectedAddress.country
                },
                paymentMethod: selectedPayment!,
                ...paymentDetails, // Spread razorpay IDs if present
                ...(paymentDetails ? { paymentStatus: 'paid' } : {}), // If we have payment details (verified), mark as paid
                ...(activeCoupon && {
                    couponResult: {
                        code: activeCoupon.code,
                        discountAmount: totals.discountTotal,
                        couponId: activeCoupon.id || ''
                    }
                })
            };

            const order = await OrderService.createOrder(orderData);
            console.log('✅ [PAYMENT] Order created:', order.id);
            console.log('📋 [PAYMENT] Created Order Object:', order);

            // Clear cart
            await clearCart();

            // Send Email
            fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order, userEmail: user!.email })
            }).catch(err => console.error('Email error:', err));

            toast.success("Order placed successfully!");
            router.push(`/order-success?orderId=${order.id}`);

        } catch (error: any) {
            throw error; // Re-throw to be caught by main handler
        } finally {
            setIsPlacingOrder(false);
        }
    };

    // Redirect if no address
    if (!selectedAddress && addresses.length === 0) {
        return (
            <div className="pt-32 pb-16 text-center">
                <h1 className="font-serif text-3xl mb-4">No Address Found</h1>
                <p className="text-muted-foreground mb-6">Please add a delivery address to continue</p>
                <Link href="/checkout" className="btn-luxury inline-block">
                    Add Address
                </Link>
            </div>
        );
    }

    return (
        <section className="pt-32 pb-16 min-h-screen bg-background">
            <div className="luxury-container">
                <h1 className="font-serif text-4xl md:text-5xl mb-12">Payment</h1>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Left: Payment Method Selection */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Delivery Address Summary */}
                        {selectedAddress && (
                            <div className="bg-card border border-border p-6 rounded-lg">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="font-serif text-xl">Delivery Address</h2>
                                    <Link
                                        href="/checkout"
                                        className="text-sm text-primary hover:underline"
                                    >
                                        Change
                                    </Link>
                                </div>
                                <div className="text-sm space-y-1">
                                    <p className="font-medium">{selectedAddress.name}</p>
                                    <p className="text-muted-foreground">{selectedAddress.addressLine1}</p>
                                    {selectedAddress.addressLine2 && (
                                        <p className="text-muted-foreground">{selectedAddress.addressLine2}</p>
                                    )}
                                    <p className="text-muted-foreground">
                                        {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}
                                    </p>
                                    <p className="text-muted-foreground">Phone: {selectedAddress.phone}</p>
                                </div>
                            </div>
                        )}

                        {/* Payment Method */}
                        <div>
                            <h2 className="font-serif text-2xl mb-6">Select Payment Method</h2>
                            <PaymentMethodSelector
                                selected={selectedPayment}
                                onSelect={setSelectedPayment}
                            />
                        </div>

                        {/* Place Order Button (Mobile) */}
                        <div className="lg:hidden">
                            <button
                                onClick={handlePlaceOrder}
                                disabled={!selectedPayment || isPlacingOrder}
                                className="w-full btn-luxury py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isPlacingOrder ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                                        Processing...
                                    </>
                                ) : (
                                    'Place Order'
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Right: Order Summary */}
                    <div className="lg:col-span-1">
                        <CheckoutSummary
                            onPlaceOrder={handlePlaceOrder}
                            isProcessing={isPlacingOrder}
                            canPlaceOrder={!!selectedPayment}
                            overrideItems={items}
                            overrideTotals={totals}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
