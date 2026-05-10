import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { app, auth } from './firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

let messaging: ReturnType<typeof getMessaging> | null = null;

/**
 * Initialize Firebase Messaging (client-side only)
 */
export const initializeMessaging = async () => {
    if (typeof window === 'undefined') return null;

    const supported = await isSupported();
    if (!supported) {
        console.warn('🔔 [FCM] Push notifications not supported in this browser');
        return null;
    }

    if (!messaging) {
        messaging = getMessaging(app);
    }
    return messaging;
};

/**
 * Request notification permission and get FCM token
 */
export const requestNotificationPermission = async (userId?: string): Promise<string | null> => {
    // Get current user from Firebase Auth if userId not provided
    const currentUserId = userId || auth.currentUser?.uid;

    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone);

    console.log('🔔 [FCM] Starting permission request...');
    console.log('🔔 [FCM] Current user ID:', currentUserId);
    console.log('🔔 [FCM] Is iOS:', isIOS);
    console.log('🔔 [FCM] Is Standalone (PWA):', isStandalone);
    console.log('🔔 [FCM] User Agent:', navigator.userAgent);

    try {
        console.log('🔔 [FCM] Requesting permission...');
        const permission = await Notification.requestPermission();
        console.log('🔔 [FCM] Permission result:', permission);

        if (permission !== 'granted') {
            console.log('🔔 [FCM] Notification permission denied');
            return null;
        }

        console.log('🔔 [FCM] Initializing messaging...');
        const messagingInstance = await initializeMessaging();
        if (!messagingInstance) {
            console.error('🔔 [FCM] Failed to initialize messaging');
            return null;
        }
        console.log('🔔 [FCM] Messaging initialized');

        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        if (!vapidKey) {
            console.error('🔔 [FCM] VAPID key not configured');
            return null;
        }
        console.log('🔔 [FCM] VAPID key found:', vapidKey.substring(0, 10) + '...');

        // Register service worker
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

        // Wait for service worker to be ready
        await navigator.serviceWorker.ready;

        // Wait for the service worker to be active
        if (registration.installing) {
            await new Promise<void>((resolve) => {
                registration.installing!.addEventListener('statechange', (e: Event) => {
                    if ((e.target as ServiceWorker).state === 'activated') {
                        resolve();
                    }
                });
            });
        } else if (registration.waiting) {
            await new Promise<void>((resolve) => {
                registration.waiting!.addEventListener('statechange', (e: Event) => {
                    if ((e.target as ServiceWorker).state === 'activated') {
                        resolve();
                    }
                });
            });
        }

        // Send Firebase config to service worker
        const firebaseConfig = {
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        };

        if (registration.active) {
            registration.active.postMessage({
                type: 'FIREBASE_CONFIG',
                config: firebaseConfig
            });
        }

        const token = await getToken(messagingInstance, {
            vapidKey,
            serviceWorkerRegistration: registration
        });

        console.log('🔔 [FCM] Token obtained:', token?.substring(0, 20) + '...');

        // Store token in user profile if user is logged in
        if (currentUserId && token) {
            await saveTokenToUser(currentUserId, token);
        } else if (token) {
            console.warn('🔔 [FCM] Token obtained but user not logged in - token will need to be saved later');
        }

        return token;
    } catch (error) {
        console.error('🔔 [FCM] Error getting permission:', error);
        return null;
    }
};

/**
 * Save FCM token to user's Firestore document
 */
export const saveTokenToUser = async (userId: string, token: string) => {
    console.log('🔔 [FCM] Saving token to user:', userId, 'token:', token?.substring(0, 20) + '...');

    if (!userId) {
        console.error('🔔 [FCM] Cannot save token - no userId provided');
        return;
    }

    try {
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, {
            fcmToken: token,
            fcmTokenUpdatedAt: serverTimestamp(),
            notificationsEnabled: true
        }, { merge: true });
        console.log('🔔 [FCM] Token saved successfully to user:', userId);
    } catch (error) {
        console.error('🔔 [FCM] Error saving token:', error);
    }
};

/**
 * Listen for foreground messages
 */
export const onForegroundMessage = (callback: (payload: any) => void) => {
    if (!messaging) return () => { };

    return onMessage(messaging, (payload) => {
        console.log('🔔 [FCM] Foreground message:', payload);
        callback(payload);
    });
};

/**
 * Check if notifications are supported and permission granted
 */
export const getNotificationStatus = async (): Promise<'granted' | 'denied' | 'default' | 'unsupported'> => {
    if (typeof window === 'undefined') return 'unsupported';

    const supported = await isSupported();
    if (!supported) return 'unsupported';

    return Notification.permission;
};
