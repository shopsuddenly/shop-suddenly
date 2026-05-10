import { NextResponse } from 'next/server';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    console.log('📧 [UNSUBSCRIBE] Request for:', email);

    if (!email) {
        return NextResponse.redirect(new URL('/unsubscribe?error=missing_email', request.url));
    }

    // Simple token validation (base64 of email)
    const expectedToken = Buffer.from(email).toString('base64');
    if (token !== expectedToken) {
        return NextResponse.redirect(new URL('/unsubscribe?error=invalid_token', request.url));
    }

    try {
        // Find user by email and update subscription status
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return NextResponse.redirect(new URL('/unsubscribe?error=user_not_found', request.url));
        }

        // Update user's subscription status
        const userDoc = snapshot.docs[0];
        await updateDoc(doc(db, 'users', userDoc.id), {
            emailSubscribed: false,
            unsubscribedAt: new Date().toISOString()
        });

        console.log('✅ [UNSUBSCRIBE] Unsubscribed:', email);
        return NextResponse.redirect(new URL('/unsubscribe?success=true', request.url));
    } catch (error) {
        console.error('❌ [UNSUBSCRIBE] Error:', error);
        return NextResponse.redirect(new URL('/unsubscribe?error=server_error', request.url));
    }
}
