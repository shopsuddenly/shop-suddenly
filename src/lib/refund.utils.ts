import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";

export async function processRefund(paymentId: string, amount?: number) {
    try {
        const options: any = {
            payment_id: paymentId
        };

        // If amount is provided (partial refund), convert to paise
        if (amount) {
            options.amount = Math.round(amount * 100);
        }

        const refund = await razorpay.payments.refund(paymentId, options);
        return refund;
    } catch (error) {
        console.error("Razorpay Refund Error:", error);
        throw error;
    }
}
