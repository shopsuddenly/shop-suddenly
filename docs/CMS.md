# Content Management System (CMS)

## Overview
Manage dynamic content on the website without code changes.

---

## Features

| Feature | Description |
|---------|-------------|
| Hero Banners | Homepage carousel/banners |
| Announcements | Top bar announcements |
| Page Content | About, Contact, etc. |
| SEO Metadata | Page titles and descriptions |

---

## Files

```
src/
├── services/cms.service.ts          # CMS operations
└── app/(admin)/admin/cms/           # CMS management
```

---

## Content Types

### Hero Banners
```typescript
interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
  isActive: boolean;
  order: number;
}
```

### Announcements
```typescript
interface Announcement {
  id: string;
  text: string;
  link?: string;
  isActive: boolean;
  startDate?: Timestamp;
  endDate?: Timestamp;
}
```

---

## Testing Steps

### 1. Update Banner
```
1. Go to /admin/cms
2. Edit hero banner
3. Upload new image
4. Update text
5. Save
6. Verify: Homepage shows new banner
```

### 2. Add Announcement
```
1. Go to /admin/cms
2. Add announcement
3. Enter text
4. Set active
5. Verify: Shows on top bar
```

### 3. Disable Content
```
1. Toggle content off
2. Verify: No longer visible
3. Toggle back on
4. Verify: Visible again
```

---

## Firestore Collections

### cms_banners
```
{
  id: "banner_1",
  title: "Summer Sale",
  subtitle: "Up to 50% off",
  image: "https://...",
  buttonText: "Shop Now",
  buttonLink: "/shop",
  isActive: true,
  order: 1
}
```

### cms_announcements
```
{
  id: "ann_1",
  text: "Free shipping on orders over ₹999",
  link: "/shipping",
  isActive: true
}
```
