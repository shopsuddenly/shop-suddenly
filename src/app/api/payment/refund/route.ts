import { NextRequest, NextResponse } from "next/server";
import { processRefund } from "@/lib/refund.utils";

export async function POST(req: NextRequest) {
    try {
        const { paymentId, amount } = await req.json();

        if (!paymentId) {
            return NextResponse.json({ error: "Payment ID is required" }, { status: 400 });
        }

        const refund = await processRefund(paymentId, amount);

        return NextResponse.json({ success: true, refund });
    } catch (error: any) {
        console.error("Refund API Error:", error);
        return NextResponse.json(
            { error: "Refund failed", details: error.message },
            { status: 500 }
        );
    }
}
