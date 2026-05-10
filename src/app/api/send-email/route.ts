import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { generateOrderEmail, generateStatusUpdateEmail, generateWelcomeEmail, generateContactEmail } from '@/lib/email-templates';

export async function POST(request: Request) {
    console.log('📨 [EMAIL API] Received request');
    try {
        const body = await request.json();
        const { order, type, status, userEmail, userName } = body; // type: 'confirmation' | 'status_update' | 'welcome'

        const emailToUse = userEmail || order?.customerEmail;

        console.log('📨 [EMAIL API] Payload:', {
            orderId: order?.id,
            email: emailToUse,
            type: type || 'confirmation',
            status: status
        });

        if (type === 'contact') {
            const { name, email, subject: msgSubject, message } = body;
            // For contact form, we send TO the admin (SMTP_USER)
            const adminEmail = process.env.SMTP_USER || 'admin@suddenly.com';

            // Create Transporter
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

            await transporter.sendMail({
                from: `"Suddenly Website" <${process.env.SMTP_USER}>`,
                to: adminEmail,
                replyTo: email, // Reply to the user
                subject: `New Message: ${msgSubject}`,
                html: generateContactEmail(name, email, msgSubject, message),
            });

            return NextResponse.json({ success: true, message: 'Message sent' });
        }

        // Validation based on type
        if (type === 'welcome') {
            if (!emailToUse) {
                return NextResponse.json({ error: 'Missing email for welcome message' }, { status: 400 });
            }
        } else {
            if (!order || !emailToUse) {
                console.error('❌ [EMAIL API] Missing order or email');
                return NextResponse.json({ error: 'Missing order or email' }, { status: 400 });
            }
        }

        // Check if SMTP credentials are configured
        const hasHost = !!process.env.SMTP_HOST;
        const hasUser = !!process.env.SMTP_USER;
        const hasPass = !!process.env.SMTP_PASS;

        if (!hasHost || !hasUser || !hasPass) {
            console.warn('⚠️ [EMAIL API] SMTP credentials missing. Skipping email send.');
            return NextResponse.json({ skipped: true, message: 'SMTP not configured' });
        }

        // Create Transporter
        const port = Number(process.env.SMTP_PORT) || 587;
        const isSecure = port === 465;

        console.log('🔧 [EMAIL API] Configuring Transporter:', {
            host: process.env.SMTP_HOST,
            port: port,
            secure: isSecure,
            user: process.env.SMTP_USER ? '***' : 'missing'
        });

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: port,
            secure: isSecure,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Generate HTML based on type
        let html = '';
        let subject = '';

        if (type === 'status_update' && status) {
            html = generateStatusUpdateEmail(order, status);
            subject = `Order Update: ${status.charAt(0).toUpperCase() + status.slice(1)} - #${order.id}`;
        } else if (type === 'welcome') {
            html = generateWelcomeEmail(userName || 'Valued Customer');
            subject = 'Welcome to Suddenly - Luxury Awaits';
        } else {
            // Default to confirmation
            html = generateOrderEmail(order);
            subject = `Order Confirmation #${order.id}`;
        }

        // Send Email
        console.log(`🚀 [EMAIL API] Sending "${type || 'confirmation'}" email to:`, emailToUse);
        const info = await transporter.sendMail({
            from: `"Suddenly Store" <${process.env.SMTP_USER}>`, // sender address
            to: emailToUse,
            subject: subject,
            html: html,
        });

        console.log('✅ [EMAIL API] Email sent successfully:', info.messageId);

        return NextResponse.json({ success: true, messageId: info.messageId });

    } catch (error: any) {
        console.error('❌ [EMAIL API] Unexpected Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
