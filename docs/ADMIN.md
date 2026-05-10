# Admin Dashboard

## Overview
Comprehensive admin panel for managing the e-commerce store.

---

## Features

| Module | Description |
|--------|-------------|
| Dashboard | Analytics and overview |
| Products | Product CRUD |
| Categories | Category management |
| Orders | Order management |
| Customers | Customer list and details |
| Coupons | Coupon management |
| Marketing | Email campaigns |
| Reviews | Review moderation |
| Inventory | Stock management |
| CMS | Content management |

---

## Files

```
src/app/(admin)/admin/
├── page.tsx               # Dashboard home
├── products/              # Product management
├── categories/            # Category management
├── orders/                # Order management
├── customers/             # Customer management
├── coupons/               # Coupon management
├── marketing/             # Email marketing
├── reviews/               # Review moderation
├── inventory/             # Inventory tracking
└── cms/                   # Content management
```

---

## Admin Access

### Role Check
Admin routes are protected. Users must have `role: "admin"` in Firestore.

### Assign Admin Role
```javascript
// In Firebase console or script
db.collection('users').doc(userId).update({
  role: 'admin'
});
```

---

## Dashboard Analytics

| Metric | Description |
|--------|-------------|
| Total Revenue | Sum of all orders |
| Orders Today | Orders placed today |
| Total Customers | Registered users |
| Pending Orders | Orders awaiting action |
| Low Stock Alerts | Products below threshold |
| Recent Orders | Last 10 orders |

---

## Testing Steps

### 1. Access Dashboard
```
1. Login as admin
2. Go to /admin
3. Verify: Dashboard loads
4. Verify: Stats displayed
```

### 2. Sidebar Navigation
```
1. Click each sidebar link
2. Verify: Each page loads correctly
3. Verify: Active link highlighted
```

### 3. CRUD Operations
```
1. Create a product
2. Edit the product
3. Delete the product
4. Verify: Changes reflected
```

### 4. Order Management
```
1. Go to /admin/orders
2. View order list
3. Click order for details
4. Update status
5. Verify: Customer notified
```

---

## Shortcuts

| Keyboard | Action |
|----------|--------|
| `G P` | Go to Products |
| `G O` | Go to Orders |
| `G C` | Go to Customers |
