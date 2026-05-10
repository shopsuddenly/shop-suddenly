"use client";

import { useEffect, useState } from "react";
import { X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // Check if user has dismissed before
        const dismissed = localStorage.getItem('installPromptDismissed');
        if (dismissed) {
            return;
        }

        // Listen for beforeinstallprompt event
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);

            // Show prompt after a delay (user engagement)
            setTimeout(() => {
                setShowPrompt(true);
            }, 5000); // Show after 5 seconds
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Check if already installed via appinstalled event
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setShowPrompt(false);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        // Show install prompt
        deferredPrompt.prompt();

        // Wait for user choice
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted install');
        } else {
            console.log('User dismissed install');
        }

        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('installPromptDismissed', 'true');
    };

    if (isInstalled || !showPrompt || !deferredPrompt) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-in slide-in-from-bottom duration-300">
            <div className="bg-gradient-to-r from-purple-600 to-violet-600 text-white p-4 rounded-lg shadow-2xl border border-purple-400/20">
                <button
                    onClick={handleDismiss}
                    className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
                    aria-label="Dismiss"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-lg flex-shrink-0">
                        <Download className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-serif text-lg font-semibold mb-1">
                            Install Suddenly
                        </h3>
                        <p className="text-sm text-white/90 leading-relaxed">
                            Get the app experience! Faster loading, offline access, and one-tap shopping.
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleDismiss}
                        className="flex-1 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                    >
                        Not Now
                    </button>
                    <button
                        onClick={handleInstall}
                        className="flex-1 px-4 py-2 bg-white text-purple-600 hover:bg-white/90 rounded-lg text-sm font-semibold transition-colors"
                    >
                        Install
                    </button>
                </div>
            </div>
        </div>
    );
}
