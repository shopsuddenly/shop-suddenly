import { NextResponse } from 'next/server';
import { doc, setDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Transparent 1x1 pixel GIF
const PIXEL_GIF = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
);

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('c');
    const email = searchParams.get('e');

    console.log('📊 [TRACK OPEN] Campaign:', campaignId, 'Email:', email);

    if (campaignId && email) {
        try {
            // Record the open event
            const openRef = doc(db, 'email_campaigns', campaignId, 'opens', email.replace(/[.#$/[\]]/g, '_'));
            await setDoc(openRef, {
                email: email,
                openedAt: serverTimestamp(),
                userAgent: request.headers.get('user-agent') || 'unknown'
            }, { merge: true });

            // Increment campaign open count
            const campaignRef = doc(db, 'email_campaigns', campaignId);
            await setDoc(campaignRef, {
                openCount: increment(1)
            }, { merge: true });

            console.log('✅ [TRACK OPEN] Recorded open for:', email);
        } catch (error) {
            console.error('❌ [TRACK OPEN] Error:', error);
        }
    }

    // Return transparent 1x1 pixel GIF
    return new NextResponse(PIXEL_GIF, {
        headers: {
            'Content-Type': 'image/gif',
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    });
}
