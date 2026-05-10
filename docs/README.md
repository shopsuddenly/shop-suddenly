# Suddenly E-commerce Documentation

## Project Overview
Suddenly is a luxury fashion e-commerce platform built with Next.js 14, Firebase, and a modern dark-themed UI.

---

## Documentation Index

| Document | Description |
|----------|-------------|
| [AUTHENTICATION.md](./AUTHENTICATION.md) | User registration, login, OTP verification |
| [PRODUCTS.md](./PRODUCTS.md) | Product management, categories, inventory |
| [ORDERS.md](./ORDERS.md) | Order processing, status updates, tracking |
| [CART.md](./CART.md) | Shopping cart functionality |
| [WISHLIST.md](./WISHLIST.md) | Wishlist feature |
| [COUPONS.md](./COUPONS.md) | Discount coupon system |
| [EMAIL_MARKETING.md](./EMAIL_MARKETING.md) | Bulk email campaigns |
| [REVIEWS.md](./REVIEWS.md) | Product reviews and ratings |
| [ADMIN.md](./ADMIN.md) | Admin dashboard features |
| [CMS.md](./CMS.md) | Content management system |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS, Custom Design System |
| Backend | Firebase (Auth, Firestore, Storage) |
| Email | Nodemailer with SMTP |
| Payments | Razorpay |
| Hosting | Vercel |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Firebase project
- SMTP credentials (for emails)
- Razorpay account (for payments)

### Installation
```bash
git clone <repository-url>
cd ecomproject
npm install
cp .env.example .env
# Fill in environment variables
npm run dev
```

### Environment Variables
See `.env.example` for all required variables.

---

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── (admin)/        # Admin dashboard pages
│   ├── (auth)/         # Auth pages (login, register)
│   ├── api/            # API routes
│   ├── shop/           # Shop pages
│   ├── product/        # Product detail pages
│   ├── cart/           # Cart page
│   ├── checkout/       # Checkout flow
│   └── profile/        # User profile
├── components/         # React components
│   ├── admin/          # Admin-specific components
│   ├── common/         # Shared components
│   ├── layout/         # Layout components
│   ├── product/        # Product components
│   └── ui/             # Base UI components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and config
├── services/           # Firebase service layer
├── types/              # TypeScript types
└── providers/          # Context providers
```

---

## Feature Summary

### Customer Features
- Browse products with filters
- Product search
- Add to cart / wishlist
- Checkout with Razorpay
- Order tracking
- Product reviews

### Admin Features
- Dashboard with analytics
- Product management (CRUD)
- Category management
- Order management
- Customer management
- Coupon management
- Email marketing
- Content management (CMS)
- Inventory tracking

---

## Deployment

### Vercel
```bash
vercel --prod
```

### Firebase Rules
```bash
firebase deploy --only firestore:rules
```
