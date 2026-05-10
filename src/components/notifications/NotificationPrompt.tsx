"use client";

import { useState } from 'react';
import { Bell, BellOff, X, Check, Loader2 } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationPromptProps {
    onClose?: () => void;
}

export function NotificationPrompt({ onClose }: NotificationPromptProps) {
    const { status, isSupported, requestPermission } = useNotifications();
    const [loading, setLoading] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    // Don't show if already granted, denied, or unsupported
    if (!isSupported || status === 'granted' || status === 'denied' || dismissed) {
        return null;
    }

    const handleEnable = async () => {
        setLoading(true);
        await requestPermission();
        setLoading(false);
        onClose?.();
    };

    const handleDismiss = () => {
        setDismissed(true);
        // Store in localStorage to not show again this session
        localStorage.setItem('notification_prompt_dismissed', 'true');
        onClose?.();
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-4">
            <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Bell className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground mb-1">Enable Notifications</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            Get updates on orders, sales, and exclusive offers.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={handleEnable}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Check className="w-4 h-4" />
                                )}
                                Enable
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Not now
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// Bell icon for header with notification status
export function NotificationBell() {
    const { status, isSupported, requestPermission } = useNotifications();
    const [loading, setLoading] = useState(false);

    // Check if on iOS
    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone);

    const handleClick = async () => {
        if (!isSupported) {
            if (isIOS && !isStandalone) {
                alert('To enable notifications on iPhone:\n\n1. Tap the Share button (↑)\n2. Select "Add to Home Screen"\n3. Open the app from your Home Screen\n4. Then notifications will work!');
            }
            return;
        }

        if (status !== 'granted') {
            setLoading(true);
            await requestPermission();
            setLoading(false);
        }
    };

    // Always show bell, but with different states
    const getTitle = () => {
        if (!isSupported) {
            return isIOS ? 'Add to Home Screen to enable' : 'Notifications not supported';
        }
        return status === 'granted' ? 'Notifications enabled' : 'Enable notifications';
    };

    return (
        <button
            onClick={handleClick}
            className="relative p-2 rounded-full hover:bg-muted transition-colors"
            title={getTitle()}
        >
            {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : status === 'granted' ? (
                <Bell className="w-5 h-5 text-primary" />
            ) : !isSupported ? (
                <BellOff className="w-5 h-5 text-muted-foreground/50" />
            ) : (
                <BellOff className="w-5 h-5 text-muted-foreground" />
            )}
            {status === 'granted' && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            )}
        </button>
    );
}

