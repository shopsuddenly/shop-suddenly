// Firebase Cloud Messaging Service Worker
// This handles background push notifications

// Handle push events directly (works without Firebase SDK initialization)
self.addEventListener('push', (event) => {
    console.log('🔔 [SW] Push event received:', event);

    let notificationData = {
        title: 'Suddenly',
        body: 'You have a new notification',
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        data: { url: '/' }
    };

    // Try to parse the push data
    if (event.data) {
        try {
            const payload = event.data.json();
            console.log('🔔 [SW] Push payload:', payload);

            // Handle FCM format
            if (payload.notification) {
                notificationData.title = payload.notification.title || notificationData.title;
                notificationData.body = payload.notification.body || notificationData.body;
                if (payload.notification.icon) {
                    notificationData.icon = payload.notification.icon;
                }
            }

            // Handle data payload
            if (payload.data) {
                notificationData.data = payload.data;
                if (payload.data.title) notificationData.title = payload.data.title;
                if (payload.data.body) notificationData.body = payload.data.body;
                if (payload.data.url) notificationData.data.url = payload.data.url;
            }
        } catch (e) {
            console.log('🔔 [SW] Push data parse error:', e);
            // Try as text
            const text = event.data.text();
            if (text) {
                notificationData.body = text;
            }
        }
    }

    console.log('🔔 [SW] Showing notification:', notificationData);

    event.waitUntil(
        self.registration.showNotification(notificationData.title, {
            body: notificationData.body,
            icon: notificationData.icon,
            badge: notificationData.badge,
            tag: 'suddenly-notification',
            requireInteraction: true,
            data: notificationData.data
        })
    );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('🔔 [SW] Notification clicked:', event);
    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Focus existing window if available
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus().then(() => client.navigate(urlToOpen));
                }
            }
            // Open new window
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// Activate immediately
self.addEventListener('install', (event) => {
    console.log('🔔 [SW] Installing...');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('🔔 [SW] Activating...');
    event.waitUntil(clients.claim());
});


