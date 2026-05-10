# Products & Inventory

## Overview
Product catalog management with categories, variants, and inventory tracking.

---

## Features

| Feature | Description |
|---------|-------------|
| Product CRUD | Create, read, update, delete products |
| Categories | Organize products by category |
| Variants | Size/color variants with individual stock |
| Image Gallery | Multiple product images |
| Search | Full-text product search |
| Filters | Filter by category, price, availability |
| Inventory | Stock management and alerts |

---

## Files

```
src/
├── services/product.service.ts       # Product operations
├── hooks/useProductSearch.ts         # Search hook
├── app/(admin)/admin/
│   ├── products/                     # Product management
│   ├── categories/                   # Category management
│   └── inventory/                    # Inventory tracking
├── app/shop/page.tsx                 # Shop listing
└── app/product/[slug]/page.tsx       # Product detail
```

---

## Product Schema

```typescript
interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  mrp?: number;                    // Original price for discount
  categoryId: string;
  images: string[];
  variants: ProductVariant[];
  stock: number;                   // Total stock (computed)
  isActive: boolean;
  averageRating?: number;
  reviewCount?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface ProductVariant {
  id: string;
  name: string;                    // e.g., "S", "M", "L"
  stock: number;
  sku?: string;
}
```

---

## Admin Operations

### Create Product
```
1. Go to /admin/products/new
2. Fill: Name, slug, description, price
3. Select category
4. Upload images
5. Add variants with stock
6. Click "Create Product"
```

### Update Inventory
```
1. Go to /admin/inventory
2. View all products with stock levels
3. Click product to edit stock
4. Update variant quantities
5. Save changes
```

---

## Testing Steps

### 1. Product Listing
```
1. Go to /shop
2. Verify: Products displayed in grid
3. Verify: Filters work (category, price)
4. Verify: Search returns relevant results
```

### 2. Product Detail
```
1. Click any product
2. Verify: Images display correctly
3. Verify: Variants selectable
4. Verify: Price and discount shown
5. Verify: Add to cart works
```

### 3. Admin Product CRUD
```
1. Login as admin
2. Go to /admin/products
3. Create new product
4. Verify: Product appears in shop
5. Edit product, change price
6. Verify: Price updated in shop
7. Delete product
8. Verify: Product removed from shop
```

---

## Firestore Collections

### products
```
{
  id: "prod_123",
  slug: "luxury-leather-bag",
  name: "Luxury Leather Bag",
  description: "...",
  price: 4999,
  mrp: 6999,
  categoryId: "cat_bags",
  images: ["url1", "url2"],
  variants: [
    { id: "v1", name: "Black", stock: 10 },
    { id: "v2", name: "Brown", stock: 5 }
  ],
  stock: 15,
  isActive: true,
  createdAt: Timestamp
}
```

### categories
```
{
  id: "cat_bags",
  name: "Bags",
  slug: "bags",
  description: "...",
  image: "url",
  parentId: null,
  order: 1
}
```
