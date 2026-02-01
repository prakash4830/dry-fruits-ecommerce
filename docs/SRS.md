# System Software Requirement (SRS)

**Project:** Nectar & Nut – Premium Dry Fruits & Candies E-commerce Platform  
**Version:** 2.0  
**Date:** 2026-01-31  
**Agile Owner:** Dev (Development Team)

---

## 1. Introduction

<!-- Worker: Dev - Technical context -->

This document defines the technical specifications, architectural design, and system requirements for the Nectar & Nut e-commerce platform. The system follows a **headless architecture** with a decoupled React frontend and Django REST API backend.

---

## 2. Technical Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  React + Vite + Tailwind CSS + Framer Motion                   │
│  ├── User Module (Customer Portal)                              │
│  └── Business Module (Admin Dashboard)                          │
└─────────────────────────────────────────────────────────────────┘
                              │ HTTPS/REST
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  Django REST Framework + SimpleJWT                              │
│  ├── Authentication API                                         │
│  ├── Products API                                               │
│  ├── Cart API                                                   │
│  ├── Orders API                                                 │
│  └── Analytics API (Admin only)                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  ├── Razorpay (Payment Processing)                              │
│  ├── Resend (Transactional Emails)                              │
│  └── Django Signals (Event-driven notifications)                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  SQLite (Development) / PostgreSQL (Production)                 │
│  ├── Users & Authentication                                     │
│  ├── Products & Categories                                      │
│  ├── Cart & CartItems                                           │
│  ├── Orders & OrderItems                                        │
│  └── Analytics & Reports                                        │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

<!-- Worker: Dev - Technology decisions -->

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Frontend** | React | 18+ | UI Components |
| | Vite | 5+ | Build tool, HMR |
| | Tailwind CSS | 4+ | Utility-first styling |
| | Framer Motion | 11+ | Animations |
| | Redux Toolkit | 2+ | State management |
| | Axios | 1+ | HTTP client |
| **Backend** | Django | 5.2+ | Web framework |
| | Django REST Framework | 3.15+ | REST APIs |
| | SimpleJWT | 5+ | JWT authentication |
| | Resend | 2+ | Email service |
| | Pandas | 2+ | Data analysis |
| | ReportLab | 4+ | PDF generation |
| | Openpyxl | 3+ | Excel generation |
| **Database** | SQLite | 3+ | Development |
| | PostgreSQL | 15+ | Production |
| **Payments** | Razorpay | Latest | Payment gateway |

---

## 3. iOS 26 Liquid Glass Design System

<!-- Worker: Dev - UI/UX specifications -->

### 3.1 Core Visual Properties

```css
/* Glassmorphism Base */
.glass-panel {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 24px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

/* High-Gloss Effect */
.glass-gloss {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.25) 0%,
    rgba(255, 255, 255, 0.05) 50%,
    rgba(255, 255, 255, 0.1) 100%
  );
}
```

### 3.2 Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--glass-bg` | `rgba(255, 255, 255, 0.08)` | Panel backgrounds |
| `--glass-bg-dark` | `rgba(0, 0, 0, 0.4)` | Dark mode panels |
| `--glass-border` | `rgba(255, 255, 255, 0.18)` | Subtle borders |
| `--glass-blur` | `20px` | Backdrop blur |
| `--glass-radius` | `24px` | Border radius |
| `--primary` | `#7C3AED` | Primary accent (violet) |
| `--secondary` | `#F59E0B` | Secondary accent (amber) |

### 3.3 Animation Specifications

| Animation | Duration | Easing | Trigger |
|-----------|----------|--------|---------|
| Page transition | 400ms | `spring(1, 0.8, 0.2)` | Route change |
| Card hover | 200ms | `easeOut` | Mouse enter |
| Button press | 100ms | `easeInOut` | Click |
| Modal open | 300ms | `spring(1, 0.9, 0.1)` | State change |
| Skeleton pulse | 1500ms | `linear` | Loading |

### 3.4 Responsive Breakpoints

| Breakpoint | Min Width | Target |
|------------|-----------|--------|
| `xs` | 0px | Mobile portrait |
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |
| `2xl` | 1536px | Ultra-wide |

---

## 4. Security Requirements

<!-- Worker: QA - Security compliance -->

### 4.1 OWASP Top 10 Compliance

| Vulnerability | Prevention Strategy |
|---------------|---------------------|
| **A01: Broken Access Control** | Permission-based views, object-level checks |
| **A02: Cryptographic Failures** | HTTPS only, PBKDF2 password hashing |
| **A03: Injection** | Django ORM (no raw SQL), parameterized queries |
| **A04: Insecure Design** | Input validation, rate limiting |
| **A05: Security Misconfiguration** | Environment variables, DEBUG=False in prod |
| **A06: Vulnerable Components** | Regular dependency updates, Dependabot |
| **A07: Auth Failures** | JWT with short expiry, refresh tokens |
| **A08: Data Integrity** | CSRF protection, signed cookies |
| **A09: Logging Failures** | Structured logging, security event tracking |
| **A10: SSRF** | URL validation, allowlist for external calls |

### 4.2 Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│   API    │────▶│   JWT    │
└──────────┘     └──────────┘     └──────────┘
     │                                  │
     │  POST /api/auth/login            │
     │  {email, password}               │
     │◀─────────────────────────────────│
     │  {access_token, refresh_token}   │
     │                                  │
     │  GET /api/products               │
     │  Header: Authorization: Bearer   │
     │◀─────────────────────────────────│
     │  {products: [...]}               │
```

### 4.3 Security Headers

```python
# Django settings
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'
CSRF_COOKIE_SECURE = True  # Production
SESSION_COOKIE_SECURE = True  # Production
```

---

## 5. Database Schema

<!-- Worker: Dev - Data modeling -->

### 5.1 Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │       │   Product   │       │  Category   │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │       │ id          │       │ id          │
│ email       │       │ name        │◀──────│ name        │
│ password    │       │ slug        │       │ slug        │
│ first_name  │       │ category_id │       │ description │
│ last_name   │       │ price       │       │ image       │
│ phone       │       │ stock       │       └─────────────┘
│ is_admin    │       │ description │
└─────────────┘       │ images      │
       │              └─────────────┘
       │                     │
       ▼                     ▼
┌─────────────┐       ┌─────────────┐
│    Order    │       │  CartItem   │
├─────────────┤       ├─────────────┤
│ id          │       │ id          │
│ user_id     │       │ cart_id     │
│ status      │       │ product_id  │
│ total       │       │ quantity    │
│ razorpay_id │       └─────────────┘
│ created_at  │              │
└─────────────┘              │
       │              ┌──────┴──────┐
       ▼              │    Cart     │
┌─────────────┐       ├─────────────┤
│  OrderItem  │       │ id          │
├─────────────┤       │ user_id     │
│ id          │       │ session_id  │
│ order_id    │       │ created_at  │
│ product_id  │       └─────────────┘
│ quantity    │
│ price       │
└─────────────┘
```

---

## 6. Performance Requirements

<!-- Worker: Dev/QA - Performance targets -->

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Time to First Byte (TTFB)** | < 200ms | Server response |
| **First Contentful Paint (FCP)** | < 1.5s | Lighthouse |
| **Largest Contentful Paint (LCP)** | < 2.5s | Lighthouse |
| **Cumulative Layout Shift (CLS)** | < 0.1 | Lighthouse |
| **API Response (p95)** | < 200ms | Backend metrics |
| **Concurrent Users** | 500+ | Load testing |

---

## 7. Deployment Architecture

<!-- Worker: Dev - Infrastructure -->

| Environment | Frontend | Backend | Database |
|-------------|----------|---------|----------|
| **Development** | localhost:5173 | localhost:8000 | SQLite |
| **Staging** | Vercel Preview | Heroku/Railway | PostgreSQL |
| **Production** | Vercel/Netlify | AWS EC2/Railway | PostgreSQL |

---

## 8. API Endpoints Summary

| Module | Endpoint | Methods | Auth |
|--------|----------|---------|------|
| **Auth** | `/api/auth/register/` | POST | No |
| | `/api/auth/login/` | POST | No |
| | `/api/auth/refresh/` | POST | No |
| | `/api/auth/me/` | GET, PUT | Yes |
| **Products** | `/api/products/` | GET | No |
| | `/api/products/{slug}/` | GET | No |
| | `/api/categories/` | GET | No |
| **Cart** | `/api/cart/` | GET, POST, DELETE | Optional |
| | `/api/cart/items/` | POST, PUT, DELETE | Optional |
| **Orders** | `/api/orders/` | GET, POST | Yes |
| | `/api/orders/{id}/` | GET | Yes |
| | `/api/payments/create/` | POST | Yes |
| | `/api/payments/verify/` | POST | Yes |
| **Admin** | `/api/admin/analytics/` | GET | Admin |
| | `/api/admin/reports/` | POST | Admin |
