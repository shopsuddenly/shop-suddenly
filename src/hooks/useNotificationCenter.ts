"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
    NotificationCenterService,
    UserNotification
} from '@/services/notification-center.service';

interface UseNotificationCenterReturn {
    notifications: UserNotification[];
    unreadCount: number;
    loading: boolean;
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    clearAll: () => Promise<void>;
    refresh: () => Promise<void>;
}

export function useNotificationCenter(): UseNotificationCenterReturn {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<UserNotification[]>([]);
    const [loading, setLoading] = useState(true);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const fetchNotifications = useCallback(async () => {
        if (!user?.uid) {
            setNotifications([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const data = await NotificationCenterService.getUserNotifications(user.uid);
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.uid]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const markAsRead = useCallback(async (notificationId: string) => {
        try {
            await NotificationCenterService.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId ? { ...n, isRead: true } : n
                )
            );
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        if (!user?.uid) return;

        try {
            await NotificationCenterService.markAllAsRead(user.uid);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    }, [user?.uid]);

    const clearAll = useCallback(async () => {
        if (!user?.uid) return;

        try {
            await NotificationCenterService.clearAll(user.uid);
            setNotifications([]);
        } catch (error) {
            console.error('Error clearing notifications:', error);
        }
    }, [user?.uid]);

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        clearAll,
        refresh: fetchNotifications
    };
}
