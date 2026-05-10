# Shopping Cart

## Overview
Persistent shopping cart with variant selection and guest cart support.

---

## Features

| Feature | Description |
|---------|-------------|
| Add to Cart | Add products with variant |
| Update Quantity | Increase/decrease quantity |
| Remove Item | Remove from cart |
| Persistent Cart | Synced with Firestore for logged-in users |
| Guest Cart | LocalStorage for guests |
| Stock Validation | Check stock before checkout |

---

## Files

```
src/
├── services/cart.service.ts         # Cart operations
├── components/cart/                 # Cart components
├── app/cart/page.tsx                # Cart page
└── components/common/CartDrawer.tsx # Mini cart drawer
```

---

## Cart Schema

```typescript
interface CartItem {
  productId: string;
  productName: string;
  productSlug: string;
  variantId: string;
  variantName: string;
  quantity: number;
  price: number;
  image: string;
}
```

### Firestore (for logged-in users)
```
users/{userId}/cart/{itemId}
{
  productId: "prod_123",
  variantId: "v1",
  quantity: 2,
  addedAt: Timestamp
}
```

---

## Testing Steps

### 1. Add to Cart
```
1. Go to any product page
2. Select variant (size/color)
3. Click "Add to Cart"
4. Verify: Cart icon shows count
5. Verify: Toast notification appears
```

### 2. View Cart
```
1. Click cart icon
2. Verify: Cart drawer opens
3. Verify: Products listed with images
4. Verify: Subtotal calculated correctly
```

### 3. Update Quantity
```
1. Open cart
2. Click + to increase quantity
3. Verify: Total updates
4. Click - to decrease quantity
5. Verify: Total updates
```

### 4. Remove Item
```
1. Open cart
2. Click remove/trash icon
3. Verify: Item removed
4. Verify: Total updates
```

### 5. Cart Persistence (Logged-in)
```
1. Login
2. Add items to cart
3. Logout
4. Login again
5. Verify: Cart items still present
```

### 6. Stock Validation
```
1. Add item with limited stock
2. Try to add more than available
3. Verify: Error message shown
4. Proceed to checkout
5. Verify: Stock checked again
```
