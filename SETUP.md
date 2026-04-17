# eGROCERY Setup Guide

## Prerequisites
- Node.js 18+
- PostgreSQL 15+ running locally

## First-time Setup

### 1. Configure database
Edit `backend/.env` and set your PostgreSQL credentials:
```
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/egrocer"
```

### 2. Install dependencies
```bash
npm install --prefix backend
npm install --prefix frontend
```

### 3. Set up the database
```bash
# Run migrations (creates all tables)
npm run db:migrate --prefix backend

# Seed with sample data (30 products, 2 users)
npm run db:seed --prefix backend
```

## Running the App

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Demo Accounts

| Role     | Email                     | Password        |
|----------|---------------------------|-----------------|
| Customer | customer@example.com      | Customer@1234   |
| Admin    | admin@egrocer.com         | Admin@1234      |

## Iteration 1 Features Implemented

### Backend APIs
- `POST /api/auth/register` — User registration (FR-101, FR-102, FR-103)
- `POST /api/auth/login` — Login with lockout after 5 attempts (FR-104, FR-105)
- `GET /api/auth/me` — Get current user
- `GET /api/categories` — Full 3-level department tree (FR-201)
- `GET /api/products` — List/search products (FR-202, FR-203, FR-205)
- `GET /api/products/:id` — Product detail + recommendations (FR-801, FR-802)
- `GET /api/cart` — View cart (FR-303, FR-304)
- `POST /api/cart/items` — Add to cart (FR-301, FR-305)
- `PATCH /api/cart/items/:id` — Update quantity
- `DELETE /api/cart/items/:id` — Remove item
- `POST /api/orders` — Place order (FR-401, FR-404)
- `GET /api/orders` — Order history (FR-405)
- `PATCH /api/orders/:id/status` — Admin status update (FR-406)

### Frontend Pages
- `/` — Home with department grid + featured products
- `/products` — Browse/search with sidebar category filter
- `/products/:id` — Product detail with recommendations
- `/cart` — Shopping cart management
- `/checkout` — Order placement (delivery or pick-up)
- `/orders` — Order history
- `/login` — Login form
- `/register` — Registration form

## Running Tests

From `backend/`:

```bash
npm test              # Run all unit tests (Jest, verbose)
npm run test:watch    # Re-run tests on file changes
```

Test files live in `backend/tests/`.

## Next Iteration Ideas
- Admin panel (catalogue management, order management)
- Email notifications on order placement
- Promotions/discount codes
- User profile management
- Low-stock alerts
