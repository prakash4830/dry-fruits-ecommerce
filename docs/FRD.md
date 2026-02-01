# Functional Requirement Document (FRD)

**Project:** Nectar & Nut – Premium Dry Fruits & Candies E-commerce Platform  
**Version:** 2.0  
**Date:** 2026-01-31  
**Agile Owner:** BA (Business Analyst)

---

## 1. User Roles & Permissions

<!-- Worker: BA - Role definitions -->

| Role | Permissions |
|------|-------------|
| **Guest** | Browse catalog, search products, add to cart |
| **Registered Customer** | All Guest + checkout, order history, profile management |
| **Admin** | All + dashboard access, inventory, orders, reports |
| **Super Admin** | All + user management, system configuration |

---

## 2. User Module – Functional Requirements

### 2.1 Authentication & User Management

<!-- Worker: Dev - Auth flows -->

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| **FR-U01** | User Registration | High | User can register with email, password, name |
| **FR-U02** | Email Verification | Medium | User receives verification email via Resend |
| **FR-U03** | User Login | High | JWT tokens issued on successful login |
| **FR-U04** | Password Reset | High | User can reset password via email link |
| **FR-U05** | Profile Management | Medium | User can update name, phone, email |
| **FR-U06** | Address Management | High | User can add/edit/delete shipping addresses |
| **FR-U07** | Session Persistence | Medium | "Remember Me" extends token validity |

### 2.2 Product Catalog

<!-- Worker: Dev - Product features -->

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| **FR-P01** | Product Listing | High | Display products with image, name, price |
| **FR-P02** | Category Filtering | High | Filter by: Nuts, Dried Fruits, Candies |
| **FR-P03** | Product Search | High | Full-text search with autocomplete |
| **FR-P04** | Price Filtering | Medium | Filter by price range (slider) |
| **FR-P05** | Sorting | Medium | Sort by: Price, Name, Popularity, New |
| **FR-P06** | Product Detail | High | Show images, description, variants, stock |
| **FR-P07** | Related Products | Low | Show similar products on detail page |
| **FR-P08** | Out of Stock Label | Medium | Display "Out of Stock" badge |

**Product Categories:**
```
├── Premium Nuts
│   ├── Almonds
│   ├── Cashews
│   ├── Peppered Cashews
│   └── Pistachios
├── Dried Fruits
│   ├── Grapes (Raisins)
│   ├── Apricots
│   ├── Dates
│   └── Figs
├── Dry Fruit Candy
│   ├── Mixed Nut Bars
│   ├── Date Rolls
│   └── Fig Sweets
└── Foreign Candies
    ├── Imported Chocolates
    └── Gourmet Candies
```

### 2.3 Shopping Cart

<!-- Worker: Dev - Cart functionality -->

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| **FR-C01** | Add to Cart | High | Add product with quantity to cart |
| **FR-C02** | Cart Persistence | High | Cart survives page refresh (guest: session, user: DB) |
| **FR-C03** | Update Quantity | High | Increase/decrease item quantity |
| **FR-C04** | Remove Item | High | Remove individual item from cart |
| **FR-C05** | Clear Cart | Medium | Remove all items from cart |
| **FR-C06** | Cart Summary | High | Show subtotal, taxes, shipping, total |
| **FR-C07** | Stock Validation | High | Prevent adding more than available stock |
| **FR-C08** | Cart Icon Badge | Medium | Show item count on nav cart icon |

### 2.4 Checkout & Payment

<!-- Worker: Dev - Payment integration -->

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| **FR-O01** | Address Selection | High | Select or add shipping address |
| **FR-O02** | Order Summary | High | Display final order with all costs |
| **FR-O03** | Razorpay Checkout | High | Initiate Razorpay payment modal |
| **FR-O04** | Payment Methods | High | Support UPI, Cards, Netbanking, Wallets |
| **FR-O05** | Payment Success | High | Create order, show confirmation |
| **FR-O06** | Payment Failure | High | Show error, allow retry |
| **FR-O07** | Order Confirmation Email | High | Send email via Resend on success |
| **FR-O08** | Order ID Generation | High | Generate unique order reference |

**Razorpay Payment Flow:**
```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Frontend │────▶│ Backend  │────▶│ Razorpay │
└──────────┘     └──────────┘     └──────────┘
     │                │                 │
     │ 1. Create Order                  │
     │ ───────────────▶                 │
     │                │ 2. Create Order │
     │                │ ────────────────▶
     │                │◀────────────────│
     │                │  order_id       │
     │◀───────────────│                 │
     │  {order_id, amount, key}         │
     │                                  │
     │ 3. Open Razorpay Modal           │
     │ ─────────────────────────────────▶
     │◀─────────────────────────────────│
     │  {razorpay_payment_id, signature}│
     │                                  │
     │ 4. Verify Payment                │
     │ ───────────────▶                 │
     │                │ 5. Verify sig   │
     │                │ ────────────────▶
     │                │◀────────────────│
     │◀───────────────│                 │
     │  {success: true}                 │
```

### 2.5 Order Management

<!-- Worker: Dev - Order tracking -->

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| **FR-OH01** | Order History | High | List all past orders with status |
| **FR-OH02** | Order Detail | High | View full order with items, address |
| **FR-OH03** | Order Status | High | Show: Pending, Processing, Shipped, Delivered |
| **FR-OH04** | Tracking Link | Medium | Link to courier tracking (if available) |
| **FR-OH05** | Shipping Email | High | Email on status change to Shipped |
| **FR-OH06** | Reorder | Low | Quick reorder from past orders |

---

## 3. Business Module – Functional Requirements

### 3.1 Admin Dashboard

<!-- Worker: Dev - Analytics and metrics -->

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| **FR-A01** | Revenue Overview | High | Daily/Weekly/Monthly revenue charts |
| **FR-A02** | Order Volume | High | Order count trends over time |
| **FR-A03** | Top Products | Medium | Best-selling products list |
| **FR-A04** | Inventory Alerts | High | Low stock warnings (< 10 units) |
| **FR-A05** | Recent Orders | High | Latest 10 orders with status |
| **FR-A06** | Customer Count | Medium | Total registered users |

### 3.2 Inventory Management

<!-- Worker: Dev - Product CRUD -->

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| **FR-I01** | Product List | High | Paginated product table with search |
| **FR-I02** | Add Product | High | Create product with all attributes |
| **FR-I03** | Edit Product | High | Update product details |
| **FR-I04** | Delete Product | Medium | Soft delete with confirmation |
| **FR-I05** | Bulk Stock Update | Medium | Update stock for multiple items |
| **FR-I06** | Image Upload | High | Upload multiple product images |

### 3.3 Order Processing

<!-- Worker: Dev - Order fulfillment -->

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| **FR-OP01** | Order List | High | All orders with filters (status, date) |
| **FR-OP02** | Order Detail | High | Full order info, customer, items |
| **FR-OP03** | Update Status | High | Change: Pending → Processing → Shipped → Delivered |
| **FR-OP04** | Add Tracking | Medium | Enter courier tracking number |
| **FR-OP05** | Cancel Order | Medium | Cancel and refund (if applicable) |

### 3.4 Reporting

<!-- Worker: Dev - Report generation -->

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| **FR-R01** | Sales Report | High | Revenue by date range (PDF/Excel) |
| **FR-R02** | Product Report | Medium | Sales per product (PDF/Excel) |
| **FR-R03** | Inventory Report | Medium | Current stock levels (PDF/Excel) |
| **FR-R04** | Date Range Picker | High | Custom start/end date selection |
| **FR-R05** | Export Format | High | Download as PDF or Excel |

**Report Generation Tech Stack:**
- **Pandas**: Data aggregation and analysis
- **ReportLab**: PDF document generation
- **Openpyxl**: Excel file generation

---

## 4. Notification System

<!-- Worker: Dev - Email triggers -->

### 4.1 Email Notifications via Resend

| Trigger | Template | Recipient |
|---------|----------|-----------|
| User Registration | `welcome.html` | New user |
| Order Placed | `order_confirmation.html` | Customer |
| Order Shipped | `order_shipped.html` | Customer |
| Order Delivered | `order_delivered.html` | Customer |
| Password Reset | `password_reset.html` | User |
| Low Stock Alert | `low_stock_alert.html` | Admin |

### 4.2 Django Signals

```python
# Signals for automated notifications
# Worker: Dev - Event-driven architecture

@receiver(post_save, sender=Order)
def order_created_handler(sender, instance, created, **kwargs):
    if created:
        send_order_confirmation_email(instance)

@receiver(post_save, sender=Order)
def order_status_changed_handler(sender, instance, **kwargs):
    if instance.status == 'shipped':
        send_shipping_notification_email(instance)
```

---

## 5. UI/UX Requirements

<!-- Worker: Dev - Design specifications -->

### 5.1 iOS 26 Liquid Glass Design

| Element | Specification |
|---------|---------------|
| **Cards** | `backdrop-blur-xl`, `bg-white/10`, `border-white/20` |
| **Buttons** | Gradient fills, soft glow on hover |
| **Navigation** | Sticky, blurred background |
| **Modals** | Centered, spring animations |
| **Forms** | Frosted glass inputs, floating labels |
| **Loading** | Skeleton loaders with pulse |

### 5.2 Responsive Design

| Viewport | Layout |
|----------|--------|
| **Mobile** | Single column, bottom nav |
| **Tablet** | 2-column grid, side nav |
| **Desktop** | 3-4 column grid, top nav |

### 5.3 Accessibility

| Requirement | Implementation |
|-------------|----------------|
| **Keyboard Navigation** | All interactive elements focusable |
| **Color Contrast** | WCAG AA compliant |
| **Screen Readers** | ARIA labels on interactive elements |
| **Focus Indicators** | Visible focus rings |

---

## 6. Testing Requirements

<!-- Worker: QA - Test coverage -->

### 6.1 Unit Tests

| Module | Test Coverage |
|--------|---------------|
| Payment Integration | Razorpay order creation, signature verification |
| Report Generation | PDF/Excel output validation |
| Cart Logic | Add, update, remove, stock validation |
| Authentication | JWT token flow, refresh logic |

### 6.2 Integration Tests

| Flow | Test Scenario |
|------|---------------|
| Checkout | Cart → Address → Payment → Order |
| Admin Reports | Date range → Generate → Download |
| Email | Order created → Signal fired → Email sent |

### 6.3 E2E Tests

| User Journey | Steps |
|--------------|-------|
| Happy Path | Browse → Add to Cart → Checkout → Pay → Confirm |
| Guest Cart | Add to cart as guest → Register → Cart preserved |
| Admin Report | Login → Dashboard → Generate Report → Download |
