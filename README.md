# eGROCERY – Groceries Made Easy

A full-stack grocery e-commerce web application built for eGROCERY, Inc. (Singapore).  
Customers can browse products, manage a cart, and place orders for home delivery or warehouse pick-up.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Database | PostgreSQL 15+ (via Prisma ORM) |
| Auth | JWT (30-minute sessions) |

---

## Prerequisites

Make sure you have the following installed before proceeding:

- [Node.js](https://nodejs.org/) v18 or higher
- [PostgreSQL](https://www.postgresql.org/download/) v15 or higher, running locally
- [Git](https://git-scm.com/)

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/HusseinSafwan02/eGrocer.git
cd eGrocer
```

### 2. Install dependencies

```bash
npm install --prefix backend
npm install --prefix frontend
```

### 3. Configure environment variables

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and fill in your PostgreSQL credentials:

```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/egrocer"
JWT_SECRET="replace-with-a-long-random-string"
PORT=5000
FRONTEND_URL="http://localhost:5173"
```

> **Note:** Never commit your `.env` file. It is already listed in `.gitignore`.

### 4. Set up the database

Create the `egrocer` database in PostgreSQL first:

```sql
CREATE DATABASE egrocer;
```

Then run migrations and seed sample data:

```bash
# Create all tables
npm run db:migrate --prefix backend

# Seed 30 sample products, departments, and two demo users
npm run db:seed --prefix backend
```

---

## Running the App

Open **two separate terminals**:

**Terminal 1 — Backend API:**
```bash
cd backend
npm run dev
# Running at http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Running at http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Demo Accounts

Seeded automatically by `npm run db:seed`:

| Role | Email | Password |
|---|---|---|
| Customer | customer@example.com | Customer@1234 |
| Administrator | admin@egrocer.com | Admin@1234 |

---

## Project Structure

```
eGrocer/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   ├── seed.js             # Sample data
│   │   └── migrations/         # Auto-generated migration files
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT authentication middleware
│   │   ├── routes/
│   │   │   ├── auth.js         # Register, login, session
│   │   │   ├── products.js     # Product catalogue & search
│   │   │   ├── categories.js   # Department/category tree
│   │   │   ├── cart.js         # Shopping cart
│   │   │   └── orders.js       # Order placement & history
│   │   └── index.js            # Express app entry point
│   ├── .env.example            # Environment variable template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx      # Persistent navigation bar
│   │   │   └── ProductCard.jsx # Reusable product tile
│   │   ├── context/
│   │   │   ├── AuthContext.jsx # Global auth state
│   │   │   └── CartContext.jsx # Global cart state
│   │   ├── pages/
│   │   │   ├── Home.jsx        # Landing page
│   │   │   ├── Products.jsx    # Browse & search
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── services/
│   │   │   └── api.js          # Axios instance with JWT interceptor
│   │   └── App.jsx             # Routes
│   └── package.json
├── .gitignore
├── .gitattributes
├── package.json                # Root scripts
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Login, receive JWT |
| GET | `/api/auth/me` | ✅ | Get current user |
| GET | `/api/categories` | — | Full department tree |
| GET | `/api/products` | — | List / search products |
| GET | `/api/products/:id` | — | Product detail + recommendations |
| GET | `/api/cart` | ✅ | View cart |
| POST | `/api/cart/items` | ✅ | Add item to cart |
| PATCH | `/api/cart/items/:productId` | ✅ | Update quantity |
| DELETE | `/api/cart/items/:productId` | ✅ | Remove item |
| POST | `/api/orders` | ✅ | Place order |
| GET | `/api/orders` | ✅ | Order history |
| PATCH | `/api/orders/:id/status` | 🔐 Admin | Update order status |

---

## Useful Scripts

From the project root:

```bash
npm run dev:backend       # Start backend in dev mode
npm run dev:frontend      # Start frontend in dev mode
npm run db:migrate        # Run pending migrations
npm run db:seed           # Seed sample data
npm run db:setup          # Migrate + seed in one command
```

From `backend/`:

```bash
npx prisma studio         # Open visual database browser at localhost:5555
npx prisma migrate reset  # Wipe and re-create the database (dev only)
```

---

## Contributing

1. Create a new branch for your feature: `git checkout -b feature/your-feature-name`
2. Commit your changes with a clear message
3. Push and open a pull request against `main`

> Always run `npm run db:migrate --prefix backend` after pulling changes that include new Prisma migrations.
