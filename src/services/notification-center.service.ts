import {
    collection,
    doc,
    getDocs,
    setDoc,
    deleteDoc,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    Timestamp,
    writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const COLLECTION_NOTIFICATIONS = 'notifications';

export interface UserNotification {
    id: string;
    userId: string;
    title: string;
    body: string;
    icon?: string;
    url?: string;
    isRead: boolean;
    createdAt: string;
}

export class NotificationCenterService {
    /**
     * Get user's notifications (latest 50)
     */
    static async getUserNotifications(userId: string): Promise<UserNotification[]> {
        console.log('🔔 [NOTIF CENTER] Fetching notifications for user:', userId);

        try {
            const notificationsRef = collection(db, COLLECTION_NOTIFICATIONS);
            // Simple query without orderBy to avoid needing composite index
            const q = query(
                notificationsRef,
                where('userId', '==', userId)
            );

            const snapshot = await getDocs(q);
            console.log('🔔 [NOTIF CENTER] Query returned', snapshot.size, 'docs');

            const notifications: UserNotification[] = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    userId: data.userId,
                    title: data.title,
                    body: data.body,
                    icon: data.icon,
                    url: data.url,
                    isRead: data.isRead || false,
                    createdAt: data.createdAt instanceof Timestamp
                        ? data.createdAt.toDate().toISOString()
                        : data.createdAt || new Date().toISOString()
                };
            });

            // Sort client-side and limit to 50
            notifications.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            const limited = notifications.slice(0, 50);
            console.log('✅ [NOTIF CENTER] Found', limited.length, 'notifications');
            return limited;
        } catch (error) {
            console.error('❌ [NOTIF CENTER] Error fetching notifications:', error);
            return [];
        }
    }

    /**
     * Get unread count for user
     */
    static async getUnreadCount(userId: string): Promise<number> {
        try {
            const notificationsRef = collection(db, COLLECTION_NOTIFICATIONS);
            const q = query(
                notificationsRef,
                where('userId', '==', userId),
                where('isRead', '==', false)
            );

            const snapshot = await getDocs(q);
            return snapshot.size;
        } catch (error) {
            console.error('❌ [NOTIF CENTER] Error getting unread count:', error);
            return 0;
        }
    }

    /**
     * Mark single notification as read
     */
    static async markAsRead(notificationId: string): Promise<void> {
        console.log('🔔 [NOTIF CENTER] Marking as read:', notificationId);

        try {
            const notificationRef = doc(db, COLLECTION_NOTIFICATIONS, notificationId);
            await updateDoc(notificationRef, { isRead: true });
            console.log('✅ [NOTIF CENTER] Marked as read');
        } catch (error) {
            console.error('❌ [NOTIF CENTER] Error marking as read:', error);
            throw error;
        }
    }

    /**
     * Mark all notifications as read for user
     */
    static async markAllAsRead(userId: string): Promise<void> {
        console.log('🔔 [NOTIF CENTER] Marking all as read for user:', userId);

        try {
            const notificationsRef = collection(db, COLLECTION_NOTIFICATIONS);
            const q = query(
                notificationsRef,
                where('userId', '==', userId),
                where('isRead', '==', false)
            );

            const snapshot = await getDocs(q);
            const batch = writeBatch(db);

            snapshot.docs.forEach(docSnap => {
                batch.update(docSnap.ref, { isRead: true });
            });

            await batch.commit();
            console.log('✅ [NOTIF CENTER] Marked', snapshot.size, 'as read');
        } catch (error) {
            console.error('❌ [NOTIF CENTER] Error marking all as read:', error);
            throw error;
        }
    }

    /**
     * Clear all notifications for user
     */
    static async clearAll(userId: string): Promise<void> {
        console.log('🔔 [NOTIF CENTER] Clearing all for user:', userId);

        try {
            const notificationsRef = collection(db, COLLECTION_NOTIFICATIONS);
            const q = query(
                notificationsRef,
                where('userId', '==', userId)
            );

            const snapshot = await getDocs(q);
            const batch = writeBatch(db);

            snapshot.docs.forEach(docSnap => {
                batch.delete(docSnap.ref);
            });

            await batch.commit();
            console.log('✅ [NOTIF CENTER] Cleared', snapshot.size, 'notifications');
        } catch (error) {
            console.error('❌ [NOTIF CENTER] Error clearing notifications:', error);
            throw error;
        }
    }

    /**
     * Create a notification for a user
     */
    static async createNotification(data: {
        userId: string;
        title: string;
        body: string;
        icon?: string;
        url?: string;
    }): Promise<string> {
        console.log('🔔 [NOTIF CENTER] Creating notification for user:', data.userId);

        try {
            const notificationId = `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const notificationRef = doc(db, COLLECTION_NOTIFICATIONS, notificationId);

            await setDoc(notificationRef, {
                userId: data.userId,
                title: data.title,
                body: data.body,
                icon: data.icon || '/icon-192x192.png',
                url: data.url || '/',
                isRead: false,
                createdAt: serverTimestamp()
            });

            console.log('✅ [NOTIF CENTER] Created notification:', notificationId);
            return notificationId;
        } catch (error) {
            console.error('❌ [NOTIF CENTER] Error creating notification:', error);
            throw error;
        }
    }

    /**
     * Create notifications for multiple users (batch)
     */
    static async createNotificationsForUsers(
        userIds: string[],
        notification: { title: string; body: string; icon?: string; url?: string }
    ): Promise<number> {
        console.log('🔔 [NOTIF CENTER] Creating notifications for', userIds.length, 'users');

        try {
            const batch = writeBatch(db);
            let count = 0;

            for (const userId of userIds) {
                const notificationId = `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${count}`;
                const notificationRef = doc(db, COLLECTION_NOTIFICATIONS, notificationId);

                batch.set(notificationRef, {
                    userId,
                    title: notification.title,
                    body: notification.body,
                    icon: notification.icon || '/icon-192x192.png',
                    url: notification.url || '/',
                    isRead: false,
                    createdAt: serverTimestamp()
                });

                count++;

                // Firestore batch limit is 500
                if (count >= 500) {
                    await batch.commit();
                    console.log('🔔 [NOTIF CENTER] Committed batch of 500');
                }
            }

            await batch.commit();
            console.log('✅ [NOTIF CENTER] Created', count, 'notifications');
            return count;
        } catch (error) {
            console.error('❌ [NOTIF CENTER] Error creating batch notifications:', error);
            throw error;
        }
    }
}
