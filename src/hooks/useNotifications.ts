"use client";

import { useState, useEffect, useCallback } from 'react';
import {
    requestNotificationPermission,
    getNotificationStatus,
    onForegroundMessage,
    initializeMessaging
} from '@/lib/fcm';
import { useAuth } from './useAuth';

type NotificationStatus = 'granted' | 'denied' | 'default' | 'unsupported' | 'loading';

interface UseNotificationsReturn {
    status: NotificationStatus;
    isSupported: boolean;
    isEnabled: boolean;
    requestPermission: () => Promise<boolean>;
}

export function useNotifications(): UseNotificationsReturn {
    const [status, setStatus] = useState<NotificationStatus>('loading');
    const { user } = useAuth();

    useEffect(() => {
        checkStatus();
    }, []);

    // Listen for foreground messages when enabled
    useEffect(() => {
        if (status !== 'granted') return;

        const init = async () => {
            await initializeMessaging();
            const unsubscribe = onForegroundMessage((payload) => {
                // Show toast notification for foreground messages
                if (payload.notification) {
                    showForegroundNotification(payload.notification);
                }
            });
            return unsubscribe;
        };

        const cleanup = init();
        return () => {
            cleanup.then(unsub => unsub && unsub());
        };
    }, [status]);

    const checkStatus = async () => {
        const currentStatus = await getNotificationStatus();
        setStatus(currentStatus);
    };

    const showForegroundNotification = (notification: { title?: string; body?: string }) => {
        // Use browser notification if page is not focused
        if (document.hidden && notification.title) {
            new Notification(notification.title, {
                body: notification.body,
                icon: '/icon-192x192.png'
            });
        }
    };

    const requestPermission = useCallback(async (): Promise<boolean> => {
        setStatus('loading');

        console.log('🔔 [useNotifications] Requesting permission, userId:', user?.uid);

        const token = await requestNotificationPermission(user?.uid);

        if (token) {
            setStatus('granted');

            // If token was obtained but userId wasn't available, try to save again
            if (!user?.uid) {
                console.warn('🔔 [useNotifications] Token obtained but no userId - will save when user logs in');
            }

            return true;
        }

        await checkStatus();
        return false;
    }, [user?.uid]);

    return {
        status,
        isSupported: status !== 'unsupported',
        isEnabled: status === 'granted',
        requestPermission
    };
}
