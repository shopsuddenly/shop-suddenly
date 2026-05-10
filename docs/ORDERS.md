# Orders

## Overview
Order processing system with status management, email notifications, and invoice generation.

---

## Features

| Feature | Description |
|---------|-------------|
| Order Creation | Create order from cart |
| Payment Integration | Razorpay payment gateway |
| Status Tracking | Order status updates |
| Email Notifications | Status change emails |
| Invoice Generation | PDF invoice download |
| Admin Management | View and manage all orders |
| Variant Stock | Auto-decrement variant stock |

---

## Order Status Flow

```
pending → confirmed → processing → shipped → delivered
    ↓
cancelled / refunded
```

| Status | Description |
|--------|-------------|
| `pending` | Order placed, awaiting payment |
| `confirmed` | Payment received |
| `processing` | Order being prepared |
| `shipped` | Order shipped with tracking |
| `delivered` | Order delivered |
| `cancelled` | Order cancelled |
| `refunded` | Refund processed |

---

## Files

```
src/
├── services/order.service.ts        # Order operations
├── services/invoice.service.ts      # Invoice generation
├── app/(admin)/admin/orders/        # Admin order management
├── app/checkout/                    # Checkout flow
├── app/order-success/               # Success page
└── app/profile/                     # User order history
```

---

## Order Schema

```typescript
interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  
  // Pricing
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  
  // Coupon
  couponId?: string;
  couponCode?: string;
  
  // Addresses
  shippingAddress: Address;
  billingAddress: Address;
  
  // Status
  status: OrderStatus;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentId?: string;
  
  // Tracking
  trackingNumber?: string;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface OrderItem {
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  quantity: number;
  price: number;
  image: string;
}
```

---

## Testing Steps

### 1. Place Order
```
1. Add products to cart
2. Go to /checkout
3. Enter/select shipping address
4. Apply coupon (optional)
5. Proceed to payment
6. Complete Razorpay payment
7. Verify: Redirected to success page
8. Verify: Order confirmation email received
```

### 2. Track Order (Customer)
```
1. Go to /profile
2. Click "Orders" tab
3. View order list
4. Click order to see details
5. Verify: Status and tracking shown
```

### 3. Manage Order (Admin)
```
1. Go to /admin/orders
2. View all orders
3. Click order to edit
4. Update status to "shipped"
5. Enter tracking number
6. Verify: Customer receives email
```

### 4. Invoice Download
```
1. View order detail
2. Click "Download Invoice"
3. Verify: PDF downloads
4. Verify: Invoice content correct
```

---

## Email Notifications

| Trigger | Email Sent |
|---------|------------|
| Order created | Order confirmation |
| Status: confirmed | Payment confirmed |
| Status: shipped | Shipping notification + tracking |
| Status: delivered | Delivery confirmation |
