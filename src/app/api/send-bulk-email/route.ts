import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { generatePromotionalEmail } from '@/lib/email-templates';
import { replaceTemplateVariables } from '@/lib/marketing-templates';

interface BulkEmailRequest {
    subject: string;
    content: string;
    ctaText?: string;
    ctaUrl?: string;
    variables?: Record<string, string>;
    recipients: Array<{
        email: string;
        name: string | null;
    }>;
    campaignId: string;
}

export async function POST(request: Request) {
    console.log('📨 [BULK EMAIL API] Received bulk email request');

    try {
        const body: BulkEmailRequest = await request.json();
        const { subject, content, ctaText, ctaUrl, variables = {}, recipients, campaignId } = body;

        // Validation
        if (!subject || !content || !recipients || recipients.length === 0) {
            return NextResponse.json(
                { error: 'Missing required fields: subject, content, recipients' },
                { status: 400 }
            );
        }

        console.log('📨 [BULK EMAIL API] Campaign:', campaignId);
        console.log('📨 [BULK EMAIL API] Recipients:', recipients.length);
        console.log('📨 [BULK EMAIL API] Variables:', variables);

        // Check SMTP credentials
        if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn('⚠️ [BULK EMAIL API] SMTP credentials missing');
            return NextResponse.json({ skipped: true, message: 'SMTP not configured' });
        }

        // Create transporter
        const port = Number(process.env.SMTP_PORT) || 587;
        const isSecure = port === 465;

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: port,
            secure: isSecure,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Send emails in batches to avoid rate limiting
        const BATCH_SIZE = 10;
        const DELAY_BETWEEN_BATCHES = 1000; // 1 second

        let successCount = 0;
        let failCount = 0;
        const errors: Array<{ email: string; error: string }> = [];

        for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
            const batch = recipients.slice(i, i + BATCH_SIZE);

            console.log(`📨 [BULK EMAIL API] Sending batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(recipients.length / BATCH_SIZE)}`);

            const batchPromises = batch.map(async (recipient) => {
                try {
                    const recipientName = recipient.name || 'Valued Customer';

                    // Replace variables including recipient-specific ones
                    const allVariables = { ...variables, name: recipientName };
                    const personalizedSubject = replaceTemplateVariables(subject, allVariables);
                    const personalizedContent = replaceTemplateVariables(content, allVariables);

                    // Base URL for tracking
                    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.suddenly.com';

                    const html = generatePromotionalEmail(
                        personalizedSubject,
                        personalizedContent,
                        ctaText || 'Shop Now',
                        ctaUrl || 'https://www.suddenly.com/shop',
                        recipientName,
                        {
                            campaignId,
                            email: recipient.email,
                            baseUrl
                        }
                    );

                    await transporter.sendMail({
                        from: `"Suddenly Store" <${process.env.SMTP_USER}>`,
                        to: recipient.email,
                        subject: personalizedSubject,
                        html: html,
                    });

                    successCount++;
                    console.log(`✅ Sent to: ${recipient.email}`);
                } catch (err: any) {
                    failCount++;
                    errors.push({ email: recipient.email, error: err.message });
                    console.error(`❌ Failed for ${recipient.email}:`, err.message);
                }
            });

            await Promise.all(batchPromises);

            // Delay between batches (except for the last batch)
            if (i + BATCH_SIZE < recipients.length) {
                await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
            }
        }

        console.log(`✅ [BULK EMAIL API] Complete: ${successCount} sent, ${failCount} failed`);

        return NextResponse.json({
            success: true,
            campaignId,
            stats: {
                total: recipients.length,
                sent: successCount,
                failed: failCount,
            },
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error: any) {
        console.error('❌ [BULK EMAIL API] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

