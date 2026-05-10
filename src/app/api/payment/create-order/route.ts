import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { OrderService } from "@/services/order.service";

export async function POST(req: NextRequest) {
    try {
        const { amount, currency = "INR", receipt } = await req.json();

        // Amount expected in paise (smallest currency unit)
        // e.g. 500 INR = 50000 paise
        const options = {
            amount: Math.round(amount * 100),
            currency,
            receipt,
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({
            id: order.id,
            currency: order.currency,
            amount: order.amount,
        });
    } catch (error: any) {
        console.error("Error creating Razorpay order:", error);
        return NextResponse.json(
            { error: "Error creating order", details: error.message },
            { status: 500 }
        );
    }
}
