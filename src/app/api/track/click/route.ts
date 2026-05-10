import { NextResponse } from 'next/server';
import { doc, setDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('c');
    const email = searchParams.get('e');
    const url = searchParams.get('url');

    console.log('📊 [TRACK CLICK] Campaign:', campaignId, 'Email:', email, 'URL:', url);

    if (campaignId && email && url) {
        try {
            // Record the click event
            const clickRef = doc(
                db,
                'email_campaigns',
                campaignId,
                'clicks',
                `${email.replace(/[.#$/[\]]/g, '_')}_${Date.now()}`
            );
            await setDoc(clickRef, {
                email: email,
                url: url,
                clickedAt: serverTimestamp(),
                userAgent: request.headers.get('user-agent') || 'unknown'
            });

            // Increment campaign click count
            const campaignRef = doc(db, 'email_campaigns', campaignId);
            await setDoc(campaignRef, {
                clickCount: increment(1)
            }, { merge: true });

            console.log('✅ [TRACK CLICK] Recorded click for:', email);
        } catch (error) {
            console.error('❌ [TRACK CLICK] Error:', error);
        }
    }

    // Redirect to the actual URL
    const redirectUrl = url || 'https://www.suddenly.com';
    return NextResponse.redirect(redirectUrl);
}
