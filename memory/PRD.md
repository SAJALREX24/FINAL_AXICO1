# Alaxico Medical Equipment E-Commerce Platform - PRD

## Project Title
Medical Equipment E-Commerce Website (Branded as "Alaxico")

## Original Problem Statement
Build a professional, trustworthy, and scalable medical equipment e-commerce platform targeting hospitals, clinics, doctors, diagnostic centers, distributors, and individual buyers.

## User Personas
- **Hospitals/Clinics**: Large volume B2B buyers needing bulk orders
- **Doctors/Healthcare Professionals**: Individual buyers for clinic equipment
- **Distributors**: B2B resellers needing wholesale pricing
- **Individual Buyers**: Home healthcare equipment purchasers

## Core Requirements

### User-Facing Features
- ✅ Homepage with professional medical design, hero carousel, featured products, trust indicators
- ✅ Product Catalog with category browsing and listings
- ✅ Rich Product Detail Page with galleries, feature highlights, specs, expandable sections
- ✅ Functional Like/Share buttons on product pages
- ✅ Bulk Order Generation (B2B) via form
- ✅ Search & Filter capabilities
- ✅ Retail Cart & Checkout
- ✅ Multiple Payment Methods (Razorpay, UPI, COD, Bank Transfer, Pay Later)
- ✅ User Accounts (Email/Password & Google Login)
- ✅ User Dashboard with order history
- ✅ Verified customer reviews with photo/video uploads
- ✅ Floating WhatsApp chat integration
- ✅ Full Mobile Responsiveness (2-column grids, full-screen navigation, responsive admin)

### Admin Panel Features
- ✅ Full Product Management (Create/Edit/Delete) - Mobile responsive
- ✅ Rich product content editing (galleries, highlights, specifications)
- ✅ Payment method configuration per product
- ✅ Category Management
- ✅ Order Management (Retail & Bulk) - Mobile responsive
- ✅ User and Verification Management - Mobile responsive
- ✅ Customer Reviews Management (with media preview) - Mobile responsive
- ✅ Sales Analytics Dashboard

## Tech Stack
- **Frontend**: React, Tailwind CSS, Shadcn/UI, Lucide Icons
- **Backend**: FastAPI, Pydantic
- **Database**: MongoDB (Motor async driver)
- **Authentication**: JWT + Emergent Google OAuth
- **Payments**: Razorpay (Cards, UPI, NetBanking), COD, Bank Transfer, Pay Later

## What's Been Implemented

### February 2026
- ✅ **Comprehensive Mobile Responsiveness**:
  - Login/Auth page fully responsive
  - Full-screen mobile navigation menu (replaces drawer)
  - Admin panel Products tab with mobile-friendly card layout
  - Admin panel Reviews tab with proper overflow handling
  - Admin panel Orders/Enquiries/Verifications all responsive
  - 2-column product grids on all mobile views
  - Responsive text sizing throughout the application

### January 2026
- ✅ Custom Medical-themed Heartbeat Loader
- ✅ Cart Page Redesign (Medkart-inspired)
- ✅ Review System v2 with photo/video upload support
- ✅ UPI Payment option added
- ✅ EMI option removed per user request

### December 2025
- Complete UI overhaul to professional "light purple" theme
- Rich Product Detail Page v2
- Multi-Payment Method System
- Admin Panel Enhancements
- Full test suite for payment methods

## Known Limitations
- **Razorpay UPI QR**: UPI QR code requires enabling in Razorpay Dashboard settings
- **Product Data**: Currently using placeholder product data - needs real Alaxico catalog

## P0 - Critical (Completed)
- ✅ Multi-payment method feature
- ✅ Like/Share buttons on product detail page
- ✅ Admin product editing with payment methods
- ✅ Mobile responsiveness (all pages and admin panel)

## P1 - High Priority (Pending)
- ⏳ UPI QR code in Razorpay (user needs to enable in dashboard)
- ⏳ Add real Alaxico products from catalog with correct pricing/specs
- ⏳ Deploy to alaxico.com domain

## P2 - Medium Priority (Backlog)
- Verify Like/Share button functionality
- Email notifications for order status updates
- Wishlist / "Save for Later" functionality
- Product Comparison feature
- Invoice PDF downloads

## P3 - Low Priority (Future)
- Advanced "Request for Quote" (RFQ) system for B2B
- Advanced search with filters for price, brand, availability
- Refactor large components (Admin.js, ProductDetail.js)

## Test Credentials
- **Admin**: admin@medequipmart.com / admin123
- **User**: clinic@example.com / demo123

## Test Files
- `/app/backend/tests/test_payment_methods.py`
- `/app/backend/tests/test_medequipmart_api.py`

## API Endpoints

### Payment Methods
- `GET /api/payment-methods` - List all available payment methods
- `GET /api/cart/payment-methods` - Get available methods for cart items
- `POST /api/orders/create-cod-order` - Create COD/Bank Transfer/Pay Later order

### Product Features
- `POST /api/products/{id}/like` - Toggle like on product
- `GET /api/products/{id}/liked` - Check if user liked product
- `GET /api/products/{id}/related` - Get related products

### Admin
- `POST /api/admin/products` - Create product with payment methods
- `PUT /api/admin/products/{id}` - Update product with payment methods
