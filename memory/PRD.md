# MedEquipMart - Medical Equipment E-Commerce Platform

## Project Overview
A professional, trustworthy, and scalable medical equipment e-commerce platform targeting hospitals, clinics, doctors, diagnostic centers, distributors, and individual buyers.

## Original Problem Statement
Build a medical equipment e-commerce website inspired by Dr. Orgs with:
- Product catalog with category browsing
- Bulk order generation (B2B) for hospitals/clinics
- Retail cart & checkout with Razorpay integration
- Admin panel for full management
- User accounts with verification badges
- WhatsApp chat integration

## Target Users
- **Hospitals** - Bulk equipment purchases
- **Clinics** - Medium-scale equipment needs
- **Doctors** - Personal practice equipment
- **Distributors** - Wholesale purchases
- **Individual Buyers** - Retail medical devices

## Tech Stack
- **Frontend**: React 18, Tailwind CSS, Shadcn/UI, Lottie-React
- **Backend**: FastAPI (Python), Pydantic
- **Database**: MongoDB
- **Authentication**: JWT (72-hour expiry)
- **Payments**: Razorpay (MOCKED - needs real API keys)

## Core Features Implemented

### ✅ User-Facing Features
| Feature | Status | Notes |
|---------|--------|-------|
| Homepage with hero section | ✅ Complete | Animated background, floating icons |
| Product Catalog | ✅ Complete | Category filtering, search |
| Product Detail Page | ✅ Complete | Specifications, reviews |
| Bulk Order Form (B2B) | ✅ Complete | Full form with submission to DB |
| Cart & Checkout | ✅ Complete | Add/remove items, quantity management |
| User Authentication | ✅ Complete | Login, Register with JWT |
| User Dashboard | ✅ Complete | Orders history, bulk enquiries |
| WhatsApp Chat | ✅ Complete | Floating button with pre-filled message |
| Lottie Animations | ✅ Complete | Category icons animated |
| Featured Products | ✅ Complete | 8 products displayed on home |
| Customer Reviews | ✅ Complete | Display approved reviews |

### ✅ Admin Panel Features
| Feature | Status | Notes |
|---------|--------|-------|
| Products Management | ✅ Complete | Add, view, delete products |
| Orders Management | ✅ Complete | View all orders |
| Bulk Enquiries | ✅ Complete | View, update status |
| Reviews Management | ✅ Complete | Approve/reject reviews |
| Verification Management | ✅ Complete | Approve/reject user verifications |
| Stats Dashboard | ✅ Complete | Products, orders, enquiries counts |

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List products (with filters)
- `GET /api/products/{id}` - Get single product
- `GET /api/categories` - List categories

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove/{id}` - Remove item

### Orders
- `POST /api/orders/create-razorpay-order` - Create order (MOCKED)
- `POST /api/orders/verify-payment` - Verify payment (MOCKED)
- `GET /api/orders/my-orders` - User's orders

### Bulk Enquiries
- `POST /api/bulk-enquiries` - Submit enquiry
- `GET /api/bulk-enquiries/my-enquiries` - User's enquiries

### Admin (Protected)
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/{id}` - Update product
- `DELETE /api/admin/products/{id}` - Delete product
- `GET /api/admin/orders` - All orders
- `GET /api/admin/bulk-enquiries` - All enquiries
- `PUT /api/admin/bulk-enquiries/{id}` - Update status
- `GET /api/admin/reviews` - All reviews
- `PUT /api/admin/reviews/{id}` - Approve/reject
- `GET /api/admin/verifications` - All verification requests
- `PUT /api/admin/verifications/{id}` - Approve/reject

## Database Schema

### Collections
```
products: { id, name, description, category, price, image, specifications, availability, created_at }
users: { id, email, name, phone, password, role, verification_status, buyer_type, organization_name, created_at }
orders: { id, user_id, items, total_amount, payment_status, razorpay_order_id, razorpay_payment_id, delivery_address, created_at }
bulk_enquiries: { id, user_id, product_id, buyer_type, quantity, organization_name, contact_details, message, status, created_at }
reviews: { id, user_id, product_id, rating, comment, approved, created_at }
verification_requests: { id, user_id, buyer_type, organization_name, documents, status, created_at }
carts: { id, user_id, items, updated_at }
```

## Test Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@medequipmart.com | admin123 |
| Hospital | hospital@example.com | demo123 |
| Clinic | clinic@example.com | demo123 |
| Doctor | doctor@example.com | demo123 |

## MOCKED/Pending Integration
⚠️ **Razorpay Payment**: Uses placeholder test keys. User needs to provide real API keys:
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

## File Structure
```
/app
├── backend/
│   ├── .env (MONGO_URL, JWT_SECRET, RAZORPAY keys)
│   ├── server.py (FastAPI application)
│   ├── seed_data.py (Database seeding)
│   ├── requirements.txt
│   └── tests/
│       └── test_medequipmart_api.py
└── frontend/
    ├── .env (REACT_APP_BACKEND_URL)
    ├── package.json
    ├── src/
    │   ├── App.js
    │   ├── App.css
    │   ├── index.css
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   ├── ProductCard.js
    │   │   ├── Footer.js
    │   │   ├── WhatsAppButton.js
    │   │   ├── LottieIcon.js
    │   │   ├── VerificationBadge.js
    │   │   └── ui/ (Shadcn components)
    │   ├── contexts/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── Home.js
    │   │   ├── Products.js
    │   │   ├── ProductDetail.js
    │   │   ├── Cart.js
    │   │   ├── Checkout.js
    │   │   ├── Auth.js
    │   │   ├── Dashboard.js
    │   │   ├── Admin.js
    │   │   └── BulkOrder.js
    │   └── utils/
    │       └── api.js
```

## Deployment Checklist
- [ ] Provide Razorpay API keys
- [ ] Update WhatsApp number if needed
- [ ] Replace seed data with real products
- [ ] Set strong JWT_SECRET for production
- [ ] Configure custom domain

## Test Results
- **Backend**: 31/31 tests passed (100%)
- **Frontend**: All features verified working

## Last Updated
February 3, 2025
