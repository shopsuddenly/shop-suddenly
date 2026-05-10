# Authentication

## Overview
User authentication using Firebase Auth with email/password and Google OAuth.

---

## Features

| Feature | Description |
|---------|-------------|
| Email Registration | Sign up with email, name, password |
| OTP Verification | Email OTP before account creation |
| Google OAuth | One-click Google sign-in |
| Password Reset | Reset via email link |
| Session Management | Firebase Auth state |
| Admin Role | Role-based access control |

---

## User Roles

| Role | Access |
|------|--------|
| `user` | Customer features |
| `admin` | Full admin dashboard access |

---

## Files

```
src/
├── services/auth.service.ts          # Auth logic
├── hooks/useAuth.ts                   # Auth hook
├── components/auth/AuthProvider.tsx   # Auth context
├── app/(auth)/
│   ├── login/page.tsx                 # Login page
│   ├── register/page.tsx              # Registration
│   └── reset-password/                # Password reset
└── app/api/auth/
    ├── send-otp/route.ts              # Send OTP
    └── verify-otp/route.ts            # Verify OTP
```

---

## API Endpoints

### POST /api/auth/send-otp
Send OTP to email for verification.

**Request:**
```json
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

### POST /api/auth/verify-otp
Verify OTP code.

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

---

## Testing Steps

### 1. Email Registration
```
1. Go to /register
2. Enter name, email, password
3. Click "Send OTP"
4. Check email for 6-digit code
5. Enter OTP
6. Click "Verify & Create Account"
7. Verify: Redirected to shop
```

### 2. Google Sign-In
```
1. Go to /login
2. Click "Continue with Google"
3. Select Google account
4. Verify: Redirected to shop
5. Verify: User created in Firestore
```

### 3. Password Reset
```
1. Go to /login
2. Click "Forgot Password?"
3. Enter email
4. Check email for reset link
5. Click link, set new password
6. Verify: Can login with new password
```

---

## Firestore Schema

### users
```
{
  email: "user@example.com",
  displayName: "John Doe",
  photoURL: "https://...",
  role: "user" | "admin",
  createdAt: Timestamp
}
```

### otp_verifications
```
{
  email: "user@example.com",
  otp: "123456",
  verified: false,
  expiresAt: Timestamp,
  createdAt: Timestamp
}
```
