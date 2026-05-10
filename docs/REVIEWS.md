# Reviews & Ratings

## Overview
Product review system with star ratings and admin moderation.

---

## Features

| Feature | Description |
|---------|-------------|
| Star Ratings | 1-5 star rating |
| Review Text | Written reviews |
| Verified Badge | For reviewed products purchased |
| Average Rating | Auto-calculated product rating |
| Admin Moderation | Approve/reject reviews |

---

## Files

```
src/
├── app/(admin)/admin/reviews/       # Admin review management
├── app/product/[slug]/page.tsx      # Reviews display
└── components/product/ReviewSection.tsx # Review component
```

---

## Schema

```typescript
interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;           // 1-5
  title?: string;
  content: string;
  isVerifiedPurchase: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
}
```

---

## Testing Steps

### 1. Submit Review
```
1. Go to product page (must have purchased)
2. Scroll to reviews section
3. Select star rating
4. Write review
5. Submit
6. Verify: Review appears as pending
```

### 2. View Reviews
```
1. Go to any product page
2. Scroll to reviews
3. Verify: Average rating shown
4. Verify: Individual reviews listed
```

### 3. Admin Moderation
```
1. Go to /admin/reviews
2. View pending reviews
3. Approve or reject review
4. Verify: Status updated
5. Verify: Approved shows on product
```
