import {
    collection,
    doc,
    getDocs,
    setDoc,
    updateDoc,
    query,
    where,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const COLLECTION_NEWSLETTER = 'newsletter_subscribers';

export interface NewsletterSubscriber {
    email: string;
    subscribedAt: string;
    isActive: boolean;
    source: 'footer' | 'checkout' | 'popup';
}

export class NewsletterService {
    /**
     * Subscribe email to newsletter
     */
    static async subscribe(email: string, source: 'footer' | 'checkout' | 'popup' = 'footer'): Promise<{ success: boolean; message: string }> {
        console.log('📧 [NEWSLETTER] Subscribing:', email);

        const normalizedEmail = email.toLowerCase().trim();

        try {
            // Check if already subscribed
            const subscribersRef = collection(db, COLLECTION_NEWSLETTER);
            const q = query(subscribersRef, where('email', '==', normalizedEmail));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const existingDoc = snapshot.docs[0];
                const data = existingDoc.data();

                if (data.isActive) {
                    console.log('ℹ️ [NEWSLETTER] Already subscribed:', normalizedEmail);
                    return { success: false, message: 'This email is already subscribed!' };
                } else {
                    // Reactivate subscription
                    await updateDoc(existingDoc.ref, {
                        isActive: true,
                        subscribedAt: serverTimestamp()
                    });
                    console.log('✅ [NEWSLETTER] Reactivated subscription:', normalizedEmail);
                    return { success: true, message: 'Welcome back! Your subscription has been reactivated.' };
                }
            }

            // Create new subscription
            const subscriberId = `SUB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const subscriberRef = doc(db, COLLECTION_NEWSLETTER, subscriberId);

            await setDoc(subscriberRef, {
                email: normalizedEmail,
                subscribedAt: serverTimestamp(),
                isActive: true,
                source
            });

            console.log('✅ [NEWSLETTER] Subscribed:', normalizedEmail);
            return { success: true, message: 'Thank you for subscribing!' };

        } catch (error) {
            console.error('❌ [NEWSLETTER] Error subscribing:', error);
            return { success: false, message: 'Something went wrong. Please try again.' };
        }
    }

    /**
     * Unsubscribe email from newsletter
     */
    static async unsubscribe(email: string): Promise<{ success: boolean; message: string }> {
        console.log('📧 [NEWSLETTER] Unsubscribing:', email);

        const normalizedEmail = email.toLowerCase().trim();

        try {
            const subscribersRef = collection(db, COLLECTION_NEWSLETTER);
            const q = query(subscribersRef, where('email', '==', normalizedEmail));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                return { success: false, message: 'This email is not subscribed.' };
            }

            const docRef = snapshot.docs[0].ref;
            await updateDoc(docRef, { isActive: false });

            console.log('✅ [NEWSLETTER] Unsubscribed:', normalizedEmail);
            return { success: true, message: 'You have been unsubscribed.' };

        } catch (error) {
            console.error('❌ [NEWSLETTER] Error unsubscribing:', error);
            return { success: false, message: 'Something went wrong. Please try again.' };
        }
    }

    /**
     * Get all active subscribers (admin)
     */
    static async getAllSubscribers(): Promise<NewsletterSubscriber[]> {
        console.log('📧 [NEWSLETTER] Fetching all subscribers...');

        try {
            const subscribersRef = collection(db, COLLECTION_NEWSLETTER);
            const q = query(subscribersRef, where('isActive', '==', true));
            const snapshot = await getDocs(q);

            const subscribers: NewsletterSubscriber[] = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    email: data.email,
                    subscribedAt: data.subscribedAt instanceof Timestamp
                        ? data.subscribedAt.toDate().toISOString()
                        : data.subscribedAt,
                    isActive: data.isActive,
                    source: data.source || 'footer'
                };
            });

            console.log('✅ [NEWSLETTER] Found', subscribers.length, 'active subscribers');
            return subscribers;

        } catch (error) {
            console.error('❌ [NEWSLETTER] Error fetching subscribers:', error);
            return [];
        }
    }

    /**
     * Get subscriber count (admin)
     */
    static async getSubscriberCount(): Promise<number> {
        try {
            const subscribersRef = collection(db, COLLECTION_NEWSLETTER);
            const q = query(subscribersRef, where('isActive', '==', true));
            const snapshot = await getDocs(q);
            return snapshot.size;
        } catch (error) {
            console.error('❌ [NEWSLETTER] Error getting count:', error);
            return 0;
        }
    }
}
