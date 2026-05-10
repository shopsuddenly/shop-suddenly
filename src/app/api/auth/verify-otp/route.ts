import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';

export async function POST(request: Request) {
    try {
        const { email, otp } = await request.json();

        if (!email || !otp) {
            return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
        }

        const otpDocRef = doc(db, 'otp_requests', email);
        const otpSnapshot = await getDoc(otpDocRef);

        if (!otpSnapshot.exists()) {
            return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
        }

        const data = otpSnapshot.data();

        // Check Expiry
        // Firestore timestamp to Date
        const expiresAt = data.expiresAt.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt); // handle both Firestore Timestamp and JS Date
        if (new Date() > expiresAt) {
            await deleteDoc(otpDocRef); // Cleanup
            return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
        }

        // Verify Code
        if (data.otp !== otp) {
            return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
        }

        // Success - Delete used OTP logic?
        // Actually, we should probably keep it marked as verified OR just return success 
        // and let the client proceed.
        // Better security: Return a signed token? 
        // For this simple implementation, we just trust the return.
        // We delete it so it can't be reused.
        await deleteDoc(otpDocRef);

        return NextResponse.json({ success: true, message: 'OTP verified' });

    } catch (error: any) {
        console.error('❌ [OTP-VERIFY] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
