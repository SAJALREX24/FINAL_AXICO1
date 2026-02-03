# Alaxico - Medical Equipment E-Commerce Platform

## Project Overview
A professional, trustworthy, and scalable medical equipment e-commerce platform targeting hospitals, clinics, doctors, diagnostic centers, distributors, and individual buyers. **Branded as "Alaxico - Trusted Healthcare Partner"**.

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
- **Frontend**: React 18, Tailwind CSS, Shadcn/UI, Embla Carousel
- **Backend**: FastAPI (Python), Pydantic
- **Database**: MongoDB
- **Authentication**: JWT (72-hour expiry) + Emergent Google OAuth
- **Payments**: Razorpay (needs real API keys)
- **Charts**: Recharts (for admin dashboard)

## Alaxico Product Line (Featured in Hero Slider)
Based on the Alaxico Catalog:
1. **Piston Compressor Nebulizer** - Respiratory therapy, 3-year warranty
2. **Electronic Blood Pressure Monitor** - Rechargeable, voice broadcast, 99 memory data
3. **Flexible Digital Thermometer** - Super flexible tip for comfort, ideal for infants
4. **Steamer Cum Vaporizer** - Steam therapy, 350ml capacity
5. **Electric Hot Water Bag** - Superfast heating, low power consumption
6. **Natural Rubber Hot Water Bag** - 2L capacity, explosion proof

## Core Features Implemented

### ✅ User-Facing Features
| Feature | Status | Notes |
|---------|--------|-------|
| Homepage with Hero Slider | ✅ Complete | 6-slide carousel with Alaxico products |
| Product Catalog | ✅ Complete | Category filtering, search |
| Product Detail Page | ✅ Complete | Specifications, reviews, EMI calculator |
| Bulk Order Form (B2B) | ✅ Complete | Full form with submission to DB |
| Cart & Checkout | ✅ Complete | Add/remove items, quantity management |
| User Authentication | ✅ Complete | JWT + Google OAuth |
| User Dashboard | ✅ Complete | Orders history, PDF invoice download |
| WhatsApp Chat | ✅ Complete | Floating button |
| Recently Viewed | ✅ Complete | localStorage tracking |
| Customer Reviews | ✅ Complete | Display approved reviews |

### ✅ Admin Panel Features
| Feature | Status | Notes |
|---------|--------|-------|
| Products Management | ✅ Complete | Add, view, delete products |
| Orders Management | ✅ Complete | View all orders |
| Bulk Enquiries | ✅ Complete | View, update status |
| Reviews Management | ✅ Complete | Approve/reject reviews |
| Verification Management | ✅ Complete | Approve/reject user verifications |
| Sales Dashboard | ✅ Complete | Revenue, orders, charts |

## Branding Updates (Completed Feb 2025)
- ✅ Logo updated to Alaxico logo in Navbar
- ✅ Favicon updated to Alaxico logo
- ✅ Page title: "Alaxico | Trusted Healthcare Partner"
- ✅ Meta description updated for SEO
- ✅ Hero slider updated with 6 Alaxico catalog products
- ✅ Contact email: support@alaxico.com

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google/login` - Google OAuth initiate
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List products (with filters)
- `GET /api/products/{id}` - Get single product
- `GET /api/categories` - List categories
- `POST /api/products/calculate-emi` - EMI calculator

### Orders
- `POST /api/orders/create-razorpay-order` - Create order
- `POST /api/orders/verify-payment` - Verify payment
- `GET /api/orders/my-orders` - User's orders
- `GET /api/orders/{order_id}/invoice` - PDF invoice

### Admin
- `GET /api/admin/dashboard-stats` - Sales dashboard data
- `POST /api/admin/products` - Create product
- `DELETE /api/admin/products/{id}` - Delete product
- `GET /api/admin/orders` - All orders
- `GET /api/admin/bulk-enquiries` - All enquiries
- `GET /api/admin/reviews` - All reviews
- `GET /api/admin/verifications` - All verification requests

## Database Schema
```
products: { name, category, price, discountPrice, stock, isFeatured, description, imageUrl, specifications }
users: { name, email, password_hash, phone, role, is_verified, avatar_seed }
orders: { user_id, products, total_amount, razorpay_order_id, status, created_at }
bulk_enquiries: { buyer_type, quantity, organization_details, contact_details, status }
reviews: { product_id, user_id, rating, comment, approved }
```

## Test Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@medequipmart.com | admin123 |
| Hospital | hospital@example.com | demo123 |
| Clinic | clinic@example.com | demo123 |
| Doctor | doctor@example.com | demo123 |

## Pending/Blocked Items
⚠️ **Razorpay Payment**: Uses placeholder test keys. Needs real API keys:
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

## Future Tasks (Backlog)
- P1: Deploy to alaxico.com domain (after Razorpay keys)
- P2: Email notifications for order status
- P2: Wishlist / "Save for Later"
- P2: Product Comparison feature
- P3: Advanced RFQ system for B2B
- P3: Advanced search filters

## File Structure
```
/app
├── backend/
│   ├── .env
│   ├── server.py
│   └── requirements.txt
└── frontend/
    ├── public/
    │   └── index.html (Alaxico title, favicon, meta)
    └── src/
        ├── components/
        │   ├── Navbar.js (Alaxico logo)
        │   ├── HeroSlider.js (6 Alaxico product slides)
        │   ├── SalesDashboard.js
        │   ├── EMICalculator.js
        │   └── RecentlyViewed.js
        ├── pages/
        │   ├── Home.js
        │   ├── Auth.js (Google login)
        │   └── AuthCallback.js
        └── utils/
            └── avatars.js
```

## Last Updated
February 3, 2025

## Recent Changes
- Completed Alaxico branding integration
- Updated hero slider with 6 catalog product images
- Updated page title, favicon, and meta description
- Updated contact email to support@alaxico.com
