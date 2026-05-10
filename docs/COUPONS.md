# Coupons

## Overview
Discount coupon system with multiple coupon types and usage limits.

---

## Features

| Feature | Description |
|---------|-------------|
| Percentage Discount | e.g., 20% off |
| Fixed Amount | e.g., ₹500 off |
| Minimum Order | Require minimum cart value |
| Usage Limits | Total and per-user limits |
| Date Range | Active from/to dates |
| Admin Management | Create, edit, delete coupons |

---

## Files

```
src/
├── services/coupon.service.ts       # Coupon operations
├── app/(admin)/admin/coupons/       # Admin coupon management
└── app/checkout/page.tsx            # Coupon application
```

---

## Coupon Schema

```typescript
interface Coupon {
  id: string;
  code: string;                      // e.g., "SAVE20"
  type: 'percentage' | 'fixed';
  value: number;                     // 20 for 20% or ₹20
  
  minOrderAmount?: number;           // Minimum cart value
  maxDiscount?: number;              // Cap for percentage
  
  usageLimit?: number;               // Total uses allowed
  usedCount: number;                 // Current usage count
  perUserLimit?: number;             // Uses per user
  
  startDate?: Timestamp;
  endDate?: Timestamp;
  
  isActive: boolean;
  createdAt: Timestamp;
}
```

---

## Admin Operations

### Create Coupon
```
1. Go to /admin/coupons
2. Click "Create Coupon"
3. Fill:
   - Code: SUMMER25
   - Type: Percentage
   - Value: 25
   - Min Order: 1000
   - Max Discount: 500
   - Usage Limit: 100
4. Set start/end dates
5. Click "Create"
```

---

## Testing Steps

### 1. Apply Valid Coupon
```
1. Add items to cart (above min order)
2. Go to checkout
3. Enter coupon code
4. Click "Apply"
5. Verify: Discount applied
6. Verify: New total shown
```

### 2. Invalid Coupon
```
1. Enter expired coupon code
2. Click "Apply"
3. Verify: Error message shown
```

### 3. Below Minimum Order
```
1. Add items below min order
2. Try to apply coupon
3. Verify: Error "Minimum order ₹X required"
```

### 4. Exceeded Usage Limit
```
1. Use coupon that reached limit
2. Try to apply
3. Verify: Error "Coupon limit reached"
```

### 5. Admin Creation
```
1. Go to /admin/coupons
2. Create new coupon
3. Go to checkout
4. Apply new coupon
5. Verify: Works correctly
```

---

## Validation Rules

| Rule | Error Message |
|------|---------------|
| Code not found | "Invalid coupon code" |
| Expired | "This coupon has expired" |
| Not yet active | "This coupon is not yet active" |
| Below minimum | "Minimum order of ₹X required" |
| Usage exceeded | "This coupon has reached its usage limit" |
| Already used (per-user) | "You have already used this coupon" |
