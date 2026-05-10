# Email Marketing Feature

## Overview
Bulk promotional email system for sending marketing campaigns to registered users.

---

## Features

### 1. Campaign Management
- Create and send email campaigns to all registered users
- Track campaign status (draft, sending, sent, failed)
- View campaign history with analytics

### 2. Pre-built Templates
| Template | Description |
|----------|-------------|
| Custom | Write your own content |
| Sale Announcement | Announce discounts with coupon codes |
| Flash Sale | 24-hour urgency campaigns |
| New Arrivals | Showcase new products |
| Newsletter | Monthly updates |
| Cart Reminder | Abandoned cart emails |

### 3. Variable Substitution
- `{name}` - Recipient's name (personalized per user)
- `{discount}` - Discount percentage
- `{code}` - Coupon code

### 4. Analytics Tracking
- **Open Tracking** - 1x1 pixel embedded in emails
- **Click Tracking** - CTA links wrapped with redirect tracker
- **Dashboard** - View opens, clicks, and engagement rates

---

## File Structure

```
src/
├── services/
│   └── campaign.service.ts      # Campaign CRUD & analytics
├── lib/
│   ├── email-templates.ts       # Email HTML templates
│   └── marketing-templates.ts   # Pre-built template definitions
├── app/
│   ├── api/
│   │   ├── send-bulk-email/route.ts  # Bulk send endpoint
│   │   └── track/
│   │       ├── open/route.ts    # Open tracking pixel
│   │       └── click/route.ts   # Click tracking redirect
│   └── (admin)/admin/marketing/
│       ├── page.tsx             # Campaign list & composer
│       └── [id]/page.tsx        # Campaign detail/analytics
```

---

## Environment Variables

Add to `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
NEXT_PUBLIC_APP_URL=https://www.suddenly.com
```

---

## Testing Steps

### 1. Access Marketing Page
```
1. Login as admin
2. Navigate to /admin/marketing
3. Verify: Stats cards show subscriber count
```

### 2. Create Campaign with Template
```
1. Click "Sale Announcement" template
2. Fill in:
   - Discount: 50
   - Coupon Code: SALE50
3. Verify: Subject and content auto-filled
4. Verify: Variables replaced in preview
```

### 3. Send Test Campaign
```
1. Click "Preview" to verify email design
2. Click "Send to X Users"
3. Confirm dialog appears
4. Click OK to send
5. Verify: Toast shows success message
6. Verify: Campaign appears in history table
```

### 4. Verify Email Delivery
```
1. Check recipient inbox
2. Verify: Email received with correct content
3. Verify: Personalized greeting with user name
4. Verify: CTA button links correctly
```

### 5. Test Open Tracking
```
1. Open received email
2. Wait 5 seconds
3. Refresh /admin/marketing
4. Verify: Open count incremented
5. Click campaign to view detail
6. Verify: User email appears in Opens tab
```

### 6. Test Click Tracking
```
1. Click CTA button in email
2. Verify: Redirected to shop page
3. Refresh campaign detail page
4. Verify: Click count incremented
5. Verify: User email appears in Clicks tab
```

### 7. Campaign Analytics Dashboard
```
1. Click any campaign in history
2. Verify: Stats cards show recipients, opens, clicks
3. Verify: Click-to-open rate calculated
4. Verify: Opens tab shows user engagement
5. Verify: Clicks tab shows link clicks
```

---

## API Endpoints

### POST /api/send-bulk-email
Send bulk emails to recipients.

**Request:**
```json
{
  "subject": "Sale Announcement",
  "content": "50% off everything!",
  "ctaText": "Shop Now",
  "ctaUrl": "https://suddenly.com/shop",
  "variables": { "discount": "50", "code": "SALE50" },
  "recipients": [{ "email": "user@example.com", "name": "John" }],
  "campaignId": "CAMP-123"
}
```

**Response:**
```json
{
  "success": true,
  "stats": { "total": 10, "sent": 9, "failed": 1 }
}
```

### GET /api/track/open
Returns 1x1 transparent GIF and records open event.

**Query Params:**
- `c` - Campaign ID
- `e` - User email

### GET /api/track/click
Records click event and redirects to destination.

**Query Params:**
- `c` - Campaign ID
- `e` - User email
- `url` - Destination URL

---

## Firestore Collections

### email_campaigns
```
{
  id: "CAMP-1234567890",
  subject: "Sale Announcement",
  content: "...",
  ctaText: "Shop Now",
  ctaUrl: "https://...",
  status: "sent",
  recipientCount: 50,
  openCount: 25,
  clickCount: 10,
  sentAt: Timestamp,
  createdBy: "admin",
  createdAt: Timestamp
}
```

### email_campaigns/{id}/opens
```
{
  email: "user@example.com",
  openedAt: Timestamp,
  userAgent: "Mozilla/5.0..."
}
```

### email_campaigns/{id}/clicks
```
{
  email: "user@example.com",
  url: "https://suddenly.com/shop",
  clickedAt: Timestamp,
  userAgent: "Mozilla/5.0..."
}
```

---

## Deployment

```bash
# Push code to Vercel
git add .
git commit -m "Add email marketing feature"
git push

# Deploy Firestore rules
firebase deploy --only firestore:rules
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| SMTP not configured | Add SMTP_* env vars in Vercel |
| Tracking 404 | Deploy code to Vercel first |
| Opens not recording | Check Firestore rules deployed |
| Emails not sending | Verify SMTP credentials |
