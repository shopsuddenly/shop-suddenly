
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { NewsletterService } from '@/services/newsletter.service';

const subscribeSchema = z.object({
    email: z.string().email("Invalid email address"),
    source: z.string().optional().default('website')
});

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate input
        const result = subscribeSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 }
            );
        }

        const { email, source } = result.data;

        // Use shared service for consistency
        const response = await NewsletterService.subscribe(email, 'popup');

        if (!response.success && response.message !== 'This email is already subscribed!') {
            return NextResponse.json(
                { error: response.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: response.message },
            { status: 201 }
        );

    } catch (error) {
        console.error("Subscription error:", error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
