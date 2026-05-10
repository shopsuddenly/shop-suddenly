# Return Management System

Complete order return & refund system with 3-day return window, admin approval, and replacement orders.

## Overview

```
Order Delivered → 3-Day Window → User Requests Return → Admin Reviews → Refund OR Replacement
```

## User Features

### Return Window
- Return button visible **only within 3 days** of delivery
- Button appears on order detail page (`/account/orders/[id]`)
- Invoice download also only available after delivery

### Request Return
1. Navigate to order detail
2. Click **"Request Return"** button
3. Select reason:
   - Product is defective
   - Wrong item received
   - Not as described
   - Size doesn't fit
   - Quality not as expected
   - Damaged during shipping
   - Other reason
4. Add optional details
5. Submit request

### Return Status Display
- **Pending** - Awaiting admin review
- **Approved** - Return accepted, refund/replacement in progress
- **Rejected** - Return denied with admin notes

## Admin Features

### Returns Dashboard
**URL:** `/admin/returns`

| Feature | Description |
|---------|-------------|
| Returns List | Table of all return requests |
| Filter by Status | All, Pending, Approved, Rejected |
| Stats Cards | Total, Pending, Approved, Rejected counts |
| Quick Actions | View order details |

### Processing Returns
1. Go to `/admin/returns`
2. Click **View** on pending return
3. Review request details (reason, notes)
4. Choose resolution:
   - **Refund** - Mark payment as refunded
   - **Replacement** - Create new order

### Replacement Options
| Option | Description |
|--------|-------------|
| Same Items | Creates replacement with original order items |
| Custom Replacement | Open modal to select different products/sizes |

### Custom Replacement Modal
1. Select "Create Replacement Order" resolution
2. Click **"Custom Replacement"** button
3. For each item, can:
   - Adjust quantity
   - Click "Change" to select different product
   - Search products and select variant/size
4. Click **"Create Replacement"**

## Order Statuses

| Status | Description |
|--------|-------------|
| `delivered` | Order delivered, return window open |
| `return_requested` | User requested return |
| `return_approved` | Admin approved return |
| `return_rejected` | Admin rejected return |
| `refunded` | Payment refunded |
| `replaced` | Replacement order created |

## Data Schema

### ReturnRequest (embedded in Order)
```typescript
interface ReturnRequest {
    requestedAt: string;
    reason: ReturnReason;
    details?: string;
    status: 'pending' | 'approved' | 'rejected';
    resolution?: 'refund' | 'replacement';
    adminNotes?: string;
    processedAt?: string;
    replacementOrderId?: string;
}
```

### Return Reasons
- `defective`
- `wrong_item`
- `not_as_described`
- `size_issue`
- `quality_issue`
- `damaged_in_transit`
- `other`

## Service Methods

### OrderService

| Method | Description |
|--------|-------------|
| `isReturnWindowOpen(order)` | Check if within 3 days of delivery |
| `requestReturn(orderId, reason, details)` | User submits return request |
| `processReturn(orderId, approve, resolution, notes)` | Admin approves/rejects |
| `getReturnRequests(status?)` | Get all return requests |
| `createReplacementOrder(orderId)` | Create with same items |
| `createCustomReplacementOrder(orderId, items)` | Create with custom items |

## File Structure

```
src/
├── app/
│   ├── account/orders/[id]/page.tsx      # User order detail + return
│   └── (admin)/admin/
│       ├── returns/page.tsx              # Returns management list
│       └── orders/[id]/page.tsx          # Admin order + return actions
├── components/
│   ├── orders/
│   │   └── ReturnRequestModal.tsx        # User return request form
│   └── admin/
│       └── ReplacementOrderModal.tsx     # Custom replacement selector
├── services/
│   └── order.service.ts                  # Return methods
└── types/
    └── order.ts                          # ReturnRequest type
```

## Notifications

When admin processes return:
- In-app notification sent to user
- Title: "Return Approved" or "Return Rejected"
- Links to order detail page
