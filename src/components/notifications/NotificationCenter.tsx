"use client";

import { useState, useRef, useEffect } from 'react';
import { useNotificationCenter } from '@/hooks/useNotificationCenter';
import { Bell, BellOff, X, Check, CheckCheck, Trash2, Loader2, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export function NotificationCenter() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    const {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        clearAll
    } = useNotificationCenter();

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Close on escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    const handleNotificationClick = async (notification: typeof notifications[0]) => {
        // Mark as read
        if (!notification.isRead) {
            await markAsRead(notification.id);
        }

        // Navigate if URL provided
        if (notification.url && notification.url !== '/') {
            setIsOpen(false);
            router.push(notification.url);
        }
    };

    const handleClearAll = async () => {
        await clearAll();
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead();
    };

    return (
        <div className="relative" ref={popoverRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-muted transition-colors"
                title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
            >
                <Bell className={cn("w-5 h-5", unreadCount > 0 ? "text-primary" : "text-muted-foreground")} />

                {/* Unread Badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary text-primary-foreground text-[10px] font-medium rounded-full flex items-center justify-center px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Popover */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 rounded-lg hover:bg-muted transition-colors"
                        >
                            <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                    </div>

                    {/* Actions Bar */}
                    {notifications.length > 0 && (
                        <div className="flex items-center gap-2 p-2 border-b border-border bg-background/50">
                            <button
                                onClick={handleMarkAllRead}
                                disabled={unreadCount === 0}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <CheckCheck className="w-3.5 h-3.5" />
                                Mark all read
                            </button>
                            <button
                                onClick={handleClearAll}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Clear all
                            </button>
                        </div>
                    )}

                    {/* Notifications List */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                                    <BellOff className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-medium text-foreground mb-1">No notifications</p>
                                <p className="text-xs text-muted-foreground">You're all caught up!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {notifications.map((notification) => (
                                    <button
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={cn(
                                            "w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors",
                                            !notification.isRead && "bg-primary/5"
                                        )}
                                    >
                                        <div className="flex gap-3">
                                            {/* Unread Indicator */}
                                            <div className="flex-shrink-0 pt-1">
                                                {!notification.isRead ? (
                                                    <span className="block w-2 h-2 bg-primary rounded-full" />
                                                ) : (
                                                    <Check className="w-4 h-4 text-muted-foreground/50" />
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className={cn(
                                                    "text-sm truncate",
                                                    !notification.isRead ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
                                                )}>
                                                    {notification.title}
                                                </h4>
                                                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                                    {notification.body}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                    </span>
                                                    {notification.url && notification.url !== '/' && (
                                                        <ExternalLink className="w-3 h-3 text-muted-foreground" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
