import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface PushNotificationPayload {
    title: string;
    body: string;
    icon?: string;
    url?: string;
    data?: Record<string, string>;
}

export class NotificationService {
    /**
     * Get all users with FCM tokens (for push notifications)
     */
    static async getUsersWithTokens(): Promise<Array<{ userId: string; email: string; fcmToken: string }>> {
        console.log('🔔 [NOTIFICATION SERVICE] Fetching users with FCM tokens...');

        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('notificationsEnabled', '==', true));
            const snapshot = await getDocs(q);

            const users: Array<{ userId: string; email: string; fcmToken: string }> = [];
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                if (data.fcmToken) {
                    users.push({
                        userId: doc.id,
                        email: data.email || '',
                        fcmToken: data.fcmToken
                    });
                }
            });

            console.log('✅ [NOTIFICATION SERVICE] Found', users.length, 'users with tokens');
            return users;
        } catch (error) {
            console.error('❌ [NOTIFICATION SERVICE] Error fetching users:', error);
            throw error;
        }
    }

    /**
     * Get ALL user IDs (for in-app notification center)
     */
    static async getAllUserIds(): Promise<string[]> {
        console.log('🔔 [NOTIFICATION SERVICE] Fetching all user IDs...');

        try {
            const usersRef = collection(db, 'users');
            const snapshot = await getDocs(usersRef);

            const userIds = snapshot.docs.map(doc => doc.id);

            console.log('✅ [NOTIFICATION SERVICE] Found', userIds.length, 'total users');
            return userIds;
        } catch (error) {
            console.error('❌ [NOTIFICATION SERVICE] Error fetching user IDs:', error);
            throw error;
        }
    }

    /**
     * Get FCM token for a specific user
     */
    static async getUserToken(userId: string): Promise<string | null> {
        try {
            const { doc, getDoc } = await import('firebase/firestore');
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists() && userSnap.data().fcmToken) {
                return userSnap.data().fcmToken;
            }
            return null;
        } catch (error) {
            console.error('❌ [NOTIFICATION SERVICE] Error getting user token:', error);
            return null;
        }
    }
}

