import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Payment is verified
            return NextResponse.json({ verified: true });
        } else {
            return NextResponse.json(
                { verified: false, error: "Invalid signature" },
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error("Error verifying payment:", error);
        return NextResponse.json(
            { error: "Error verifying payment", details: error.message },
            { status: 500 }
        );
    }
}
