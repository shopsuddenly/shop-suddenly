import { NextResponse } from 'next/server';
import { NotificationCenterService } from '@/services/notification-center.service';

interface SendNotificationRequest {
    tokens: string[];
    userIds?: string[];  // NEW: User IDs for storing in notification center
    title: string;
    body: string;
    icon?: string;
    url?: string;
    data?: Record<string, string>;
}

export async function POST(request: Request) {
    console.log('🔔 [PUSH API] Received notification request');

    try {
        const body: SendNotificationRequest = await request.json();
        const { tokens, userIds, title, body: notificationBody, icon, url, data } = body;

        if (!tokens || tokens.length === 0 || !title || !notificationBody) {
            return NextResponse.json(
                { error: 'Missing required fields: tokens, title, body' },
                { status: 400 }
            );
        }

        // Store notifications in Firestore (for notification center)
        let storedCount = 0;
        if (userIds && userIds.length > 0) {
            console.log('🔔 [PUSH API] Storing notifications for', userIds.length, 'users');
            try {
                storedCount = await NotificationCenterService.createNotificationsForUsers(
                    userIds,
                    { title, body: notificationBody, icon, url }
                );
                console.log('✅ [PUSH API] Stored', storedCount, 'notifications');
            } catch (storeError) {
                console.error('⚠️ [PUSH API] Failed to store notifications:', storeError);
                // Continue with push even if storage fails
            }
        }

        // Check for Firebase Admin credentials
        const serviceAccount = process.env.FB_SERVICE_ACCOUNT_KEY;
        if (!serviceAccount) {
            console.warn('⚠️ [PUSH API] Firebase Admin SDK not configured');
            return NextResponse.json({
                skipped: true,
                message: 'Firebase Admin SDK not configured. Set FB_SERVICE_ACCOUNT_KEY env variable.',
                stored: storedCount
            });
        }

        // Dynamic import of firebase-admin to avoid client-side issues
        const admin = await import('firebase-admin');

        // Initialize Admin SDK if not already initialized
        if (!admin.apps.length) {
            const credentials = JSON.parse(serviceAccount);
            admin.initializeApp({
                credential: admin.credential.cert(credentials)
            });
        }

        const messaging = admin.messaging();

        // Prepare message payload
        const message = {
            notification: {
                title,
                body: notificationBody,
                ...(icon && { imageUrl: icon })
            },
            data: {
                ...data,
                url: url || '/',
                timestamp: Date.now().toString()
            },
            tokens: tokens
        };

        console.log('🔔 [PUSH API] Sending to', tokens.length, 'devices');

        // Send multicast message
        const response = await messaging.sendEachForMulticast(message);

        console.log(`✅ [PUSH API] Success: ${response.successCount}, Failed: ${response.failureCount}`);

        return NextResponse.json({
            success: true,
            stats: {
                total: tokens.length,
                sent: response.successCount,
                failed: response.failureCount,
                stored: storedCount
            }
        });

    } catch (error: any) {
        console.error('❌ [PUSH API] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

