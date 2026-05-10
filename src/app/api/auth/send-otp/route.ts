import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { generateOtpEmail } from '@/lib/email-templates';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: Request) {
    try {
        const { email, name } = await request.json();

        if (!email || !name) {
            return NextResponse.json({ error: 'Email and name are required' }, { status: 400 });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store in Firestore
        // We use a dedicated collection 'otp_requests' keyed by email
        // Security: This collection should be writeable by anyone (api) but readable ONLY by server/admin
        // Since we are using client SDK here in API route, we need to ensure Rules allow this write
        // Ideally we would use firebase-admin, but for now we rely on the specific doc path
        await setDoc(doc(db, 'otp_requests', email), {
            otp,
            email,
            createdAt: serverTimestamp(),
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
            verified: false
        });

        // Send Email
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: `"Suddenly Store" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Your Verification Code',
            html: generateOtpEmail(otp, name),
        });

        return NextResponse.json({ success: true, message: 'OTP sent' });

    } catch (error: any) {
        console.error('❌ [OTP-SEND] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
