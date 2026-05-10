# Push Notifications (FCM)

## Overview
Real-time push notifications using Firebase Cloud Messaging (FCM).

---

## Features

| Feature | Description |
|---------|-------------|
| Permission Request | Ask user for notification permission |
| Token Storage | Save FCM token to user profile |
| Foreground Messages | Show notifications when app is open |
| Background Messages | Service worker handles background |
| Admin Push | Send push from marketing page |

---

## Files

```
src/
├── lib/fcm.ts                      # FCM client service
├── hooks/useNotifications.ts        # Notification hook
├── components/notifications/
│   └── NotificationPrompt.tsx      # Permission UI
├── services/notification.service.ts # Token fetching
└── app/api/send-notification/route.ts # Push API

public/
└── firebase-messaging-sw.js        # Service worker
```

---

## Environment Setup

Add to `.env`:
```env
# Get from Firebase Console > Project Settings > Cloud Messaging
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key

# Get from Firebase Console > Service Accounts > Generate new private key
# Paste entire JSON as a single line
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

### Getting VAPID Key:
1. Go to Firebase Console
2. Project Settings → Cloud Messaging
3. Scroll to "Web Push certificates"
4. Generate key pair
5. Copy the key

### Getting Service Account:
1. Go to Firebase Console
2. Project Settings → Service accounts
3. Click "Generate new private key"
4. Download JSON file
5. Minify to single line and add to env

---

## Usage

### 1. Show Permission Prompt
```tsx
import { NotificationPrompt } from '@/components/notifications/NotificationPrompt';

// In your layout or page
<NotificationPrompt />
```

### 2. Use NotificationBell in Header
```tsx
import { NotificationBell } from '@/components/notifications/NotificationPrompt';

// In your header
<NotificationBell />
```

### 3. Use Hook Directly
```tsx
import { useNotifications } from '@/hooks/useNotifications';

function Component() {
    const { status, isEnabled, requestPermission } = useNotifications();
    
    return (
        <button onClick={requestPermission}>
            {isEnabled ? 'Enabled' : 'Enable Notifications'}
        </button>
    );
}
```

---

## Testing Steps

### 1. Request Permission
```
1. Open app in browser
2. Wait for notification prompt (or click bell icon)
3. Click "Enable"
4. Browser permission popup appears
5. Click "Allow"
6. Verify: Token saved to user profile in Firestore
```

### 2. Send Test Notification
```
1. Open browser console
2. Run:
   fetch('/api/send-notification', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       tokens: ['user-fcm-token'],
       title: 'Test',
       body: 'Hello World'
     })
   })
3. Verify: Notification appears
```

### 3. Background Notification
```
1. Enable notifications
2. Minimize browser or switch tab
3. Trigger push notification
4. Verify: System notification appears
5. Click notification
6. Verify: Opens app with correct URL
```

---

## API Endpoint

### POST /api/send-notification

**Request:**
```json
{
  "tokens": ["fcm-token-1", "fcm-token-2"],
  "title": "Sale Alert!",
  "body": "50% off everything!",
  "icon": "https://example.com/icon.png",
  "url": "/shop",
  "data": { "campaignId": "123" }
}
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 2,
    "sent": 2,
    "failed": 0
  }
}
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Permission denied | User must click Allow in browser |
| Token not saving | Check Firestore rules allow write |
| Admin SDK error | Add FIREBASE_SERVICE_ACCOUNT_KEY |
| VAPID error | Add NEXT_PUBLIC_FIREBASE_VAPID_KEY |
| No background notifications | Register service worker |
