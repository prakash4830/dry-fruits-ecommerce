# Contributing to Nectar & Nut

Welcome to the **Nectar & Nut** e-commerce platform! This guide helps developers understand the project structure and how to contribute effectively.

---

## 📁 Project Structure

```
dry-fruits-ecommerce/
├── backend/                     # Django REST API
│   ├── config/                  # Project configuration
│   │   ├── settings.py          # Django settings
│   │   ├── urls.py              # Root URL configuration
│   │   └── wsgi.py              # WSGI entry point
│   ├── users/                   # User authentication & profiles
│   │   ├── models.py            # User model
│   │   ├── serializers.py       # User serializers
│   │   ├── views.py             # Auth & profile APIs
│   │   └── urls.py              # /api/auth/ routes
│   ├── products/                # Product catalog
│   │   ├── models.py            # Category, Product models
│   │   ├── serializers.py       # Product serializers
│   │   ├── views.py             # Product APIs
│   │   └── urls.py              # /api/products/ routes
│   ├── cart/                    # Shopping cart
│   │   ├── models.py            # Cart, CartItem models
│   │   ├── serializers.py       # Cart serializers
│   │   ├── views.py             # Cart APIs
│   │   └── urls.py              # /api/cart/ routes
│   ├── orders/                  # Orders & payments
│   │   ├── models.py            # Order, OrderItem models
│   │   ├── serializers.py       # Order serializers
│   │   ├── views.py             # Order APIs
│   │   ├── payments.py          # Razorpay integration
│   │   └── urls.py              # /api/orders/ routes
│   ├── analytics/               # Business analytics
│   │   ├── models.py            # Analytics models
│   │   ├── services.py          # Report generation
│   │   ├── views.py             # Dashboard APIs
│   │   └── urls.py              # /api/admin/ routes
│   ├── notifications/           # Email notifications
│   │   ├── signals.py           # Django signals
│   │   ├── services.py          # Resend email service
│   │   └── templates/           # Email templates
│   ├── requirements.txt         # Python dependencies
│   └── .env.example             # Environment template
├── frontend/                    # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Route pages
│   │   ├── hooks/               # Custom React hooks
│   │   ├── services/            # API client (Axios)
│   │   ├── store/               # Redux Toolkit state
│   │   └── styles/              # Tailwind + custom CSS
│   ├── package.json             # Node dependencies
│   └── .env.example             # Environment template
└── docs/                        # Documentation
    ├── BRD.md                   # Business Requirements
    ├── SRS.md                   # System Requirements
    └── FRD.md                   # Functional Requirements
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

```bash
# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (Production - PostgreSQL)
DATABASE_URL=postgres://user:password@localhost:5432/nectarnut

# Razorpay Payment Gateway
# Get keys from: https://dashboard.razorpay.com/app/keys
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Resend Email Service
# Get API key from: https://resend.com/api-keys
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=orders@yourdomain.com

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```bash
# API Base URL
VITE_API_URL=http://localhost:8000/api

# Razorpay Key (public key only!)
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

---

## 🚀 API Endpoints

### Authentication (`/api/auth/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Create new user account |
| POST | `/api/auth/login/` | Obtain JWT tokens |
| POST | `/api/auth/refresh/` | Refresh access token |
| GET | `/api/auth/me/` | Get current user profile |
| PUT | `/api/auth/me/` | Update current user profile |
| POST | `/api/auth/password/reset/` | Request password reset |
| POST | `/api/auth/password/confirm/` | Confirm password reset |

### Products (`/api/products/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories/` | List all categories |
| GET | `/api/products/` | List products (paginated) |
| GET | `/api/products/?category=nuts` | Filter by category |
| GET | `/api/products/?search=almond` | Search products |
| GET | `/api/products/{slug}/` | Get product detail |

### Cart (`/api/cart/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart/` | Get current cart |
| POST | `/api/cart/items/` | Add item to cart |
| PUT | `/api/cart/items/{id}/` | Update item quantity |
| DELETE | `/api/cart/items/{id}/` | Remove item from cart |
| DELETE | `/api/cart/` | Clear entire cart |

### Orders (`/api/orders/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders/` | List user's orders |
| POST | `/api/orders/` | Create order from cart |
| GET | `/api/orders/{id}/` | Get order detail |
| POST | `/api/payments/create/` | Create Razorpay order |
| POST | `/api/payments/verify/` | Verify payment signature |

### Admin (`/api/admin/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/analytics/` | Get dashboard metrics |
| POST | `/api/admin/reports/sales/` | Generate sales report |
| POST | `/api/admin/reports/inventory/` | Generate inventory report |
| GET | `/api/admin/orders/` | List all orders (admin) |
| PUT | `/api/admin/orders/{id}/` | Update order status |

---

## 🔐 Third-Party API Keys

### Razorpay (Payment Gateway)

1. Create account at [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Go to **Settings** → **API Keys**
3. Generate **Test Mode** keys for development
4. Copy `Key ID` and `Key Secret` to `.env`

**Important Files:**
- `backend/orders/payments.py` - Razorpay client initialization
- `frontend/src/services/payment.js` - Frontend Razorpay integration

### Resend (Email Service)

1. Create account at [Resend](https://resend.com)
2. Go to **API Keys** → **Create API Key**
3. Verify your sending domain or use `onboarding@resend.dev` for testing
4. Copy API key to `RESEND_API_KEY` in `.env`

**Important Files:**
- `backend/notifications/services.py` - Resend email service
- `backend/notifications/templates/` - Email HTML templates

---

## 🗄️ Database Configuration

### Development (SQLite)
No configuration needed. SQLite file created automatically at `backend/db.sqlite3`.

### Production (PostgreSQL)

```bash
# Install PostgreSQL
brew install postgresql  # macOS
sudo apt install postgresql  # Ubuntu

# Create database
createdb nectarnut

# Set DATABASE_URL in .env
DATABASE_URL=postgres://user:password@localhost:5432/nectarnut
```

**Connection String Format:**
```
postgres://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
```

---

## 🏷️ Agile Worker Annotations

The codebase uses comments to indicate which team member (PM, Dev, QA) is responsible for specific logic blocks. This follows the Agile SDLC methodology.

### Annotation Format

```python
# Worker: PM - Business logic description
# Worker: Dev - Technical implementation details
# Worker: QA - Testing requirements
# Worker: BA - Requirement traceability
```

### Examples

```python
# Worker: PM - Order status flow must follow business rules
ORDER_STATUS_CHOICES = [
    ('pending', 'Pending'),
    ('processing', 'Processing'),
    ('shipped', 'Shipped'),
    ('delivered', 'Delivered'),
]

# Worker: Dev - Razorpay signature verification
def verify_payment_signature(razorpay_order_id, razorpay_payment_id, signature):
    # Worker: QA - Unit test required for this function
    ...

# Worker: BA - Maps to FR-O03 in FRD
class CheckoutView(APIView):
    ...
```

---

## 🧪 Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
python manage.py test

# Run specific module tests
python manage.py test orders.tests.test_payments
python manage.py test analytics.tests.test_reports

# Run with coverage
pip install coverage
coverage run --source='.' manage.py test
coverage report
```

### Frontend Tests

```bash
cd frontend

# Run tests
npm run test

# Run with coverage
npm run test:coverage
```

---

## 🛠️ Development Workflow

### 1. Setup Environment

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Edit with your keys
python manage.py migrate
python manage.py createsuperuser

# Frontend
cd frontend
npm install
cp .env.example .env  # Edit with your API URL
```

### 2. Run Development Servers

```bash
# Terminal 1 - Backend
cd backend
python manage.py runserver

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 3. Code Style

- **Python**: Follow PEP 8, use `black` formatter
- **JavaScript**: Follow ESLint config, use Prettier
- **Commits**: Use conventional commits (feat:, fix:, docs:, etc.)

---

## 📞 Support

For questions or issues:
1. Check existing documentation in `/docs`
2. Review the FRD for functional requirements
3. Contact the Tech Lead for architecture decisions
