# Wishlist

## Overview
Save products for later purchase with persistent wishlist.

---

## Features

| Feature | Description |
|---------|-------------|
| Add to Wishlist | Save product for later |
| Remove from Wishlist | Remove saved product |
| Quick Add to Cart | Add wishlist item to cart |
| Persistent Storage | Synced with Firestore |

---

## Files

```
src/
├── services/wishlist.service.ts     # Wishlist operations
├── hooks/useWishlist.tsx            # Wishlist hook
├── app/profile/page.tsx             # Wishlist tab in profile
└── components/product/ProductCard.tsx # Heart icon
```

---

## Schema

```typescript
// Firestore: users/{userId}/wishlist/{productId}
{
  productId: string;
  addedAt: Timestamp;
}
```

---

## Testing Steps

### 1. Add to Wishlist
```
1. Hover over any product card
2. Click heart icon
3. Verify: Heart fills with color
4. Verify: Toast shows "Added to wishlist"
```

### 2. View Wishlist
```
1. Go to /profile
2. Click "Wishlist" tab
3. Verify: Saved products listed
4. Verify: Product images and prices shown
```

### 3. Remove from Wishlist
```
1. Click heart icon again (on product)
   OR
2. Click remove in wishlist page
3. Verify: Product removed
4. Verify: Heart icon unfilled
```

### 4. Add to Cart from Wishlist
```
1. Go to wishlist
2. Click "Add to Cart" on product
3. Select variant if prompted
4. Verify: Added to cart
```

### 5. Persistence
```
1. Login
2. Add products to wishlist
3. Logout and login again
4. Verify: Wishlist preserved
```
