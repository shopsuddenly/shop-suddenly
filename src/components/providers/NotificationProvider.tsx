"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { requestNotificationPermission, getNotificationStatus } from '@/lib/fcm';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [hasRequested, setHasRequested] = useState(false);

    useEffect(() => {
        // Auto-request permission when user is logged in
        const autoRequestPermission = async () => {
            // Check if already requested this session
            if (hasRequested) return;

            // Check if user dismissed previously
            const dismissed = localStorage.getItem('notification_prompt_dismissed');
            if (dismissed) return;

            // Check current permission status
            const status = await getNotificationStatus();
            if (status === 'granted' || status === 'denied' || status === 'unsupported') {
                return; // Already handled
            }

            // Wait a bit after page load for better UX
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Request permission
            console.log('🔔 [NotificationProvider] Auto-requesting permission...');
            setHasRequested(true);

            const token = await requestNotificationPermission(user?.uid);
            if (token) {
                console.log('🔔 [NotificationProvider] Permission granted, token saved');
            }
        };

        if (user?.uid) {
            autoRequestPermission();
        }
    }, [user?.uid, hasRequested]);

    return <>{children}</>;
}

