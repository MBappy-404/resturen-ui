# Foodie Paradise — Restaurant Management System

A comprehensive full-stack restaurant management system with an admin dashboard and customer-facing e-commerce website.

## Features

### Admin Dashboard
- **Dashboard** — Real-time statistics, charts, recent orders, revenue tracking
- **Menu Management** — Categories & items CRUD, pricing, availability, tags
- **Order Management** — Create, track, update orders with status workflow
- **Kitchen Display (KDS)** — Real-time order queue for kitchen staff
- **Table Management** — Floor layout, status tracking, capacity management
- **Reservations** — Booking management with status workflow
- **Staff Management** — Employee profiles, roles, shifts, attendance
- **Inventory** — Stock tracking, low-stock alerts, usage history
- **Customers** — Customer database with order history
- **Invoice Management** — Invoice generation and print support
- **Reports & Analytics** — Sales, revenue, top items, order trends
- **Organization Settings** — Restaurant info, tax, service charge, hours
- **User Settings** — Profile, password, theme preferences

### E-Commerce (Customer Website)
- **Homepage** — Hero banner, featured dishes, popular items, CTA
- **Menu Browser** — Category filter, search, add to cart
- **Food Detail** — Full item view, variants, addons, reviews
- **Shopping Cart** — Drawer-based cart with quantity management
- **Checkout** — Delivery/pickup, contact info, coupon, payment selection
- **Order Tracking** — Real-time status tracking with timeline
- **Customer Profile** — Account info, order stats, loyalty points
- **Order History** — Past orders with status
- **About & Contact** — Restaurant info, contact form

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite + Tailwind CSS v4 |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Auth** | JWT (dual: Admin + Customer) |
| **Animations** | Framer Motion |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Forms** | React Hook Form + Zod |
| **Notifications** | React Hot Toast |

## Project Structure

```
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/        # Admin layout (Sidebar, Topbar)
│   │   │   ├── customer-layout/ # Customer layout (Navbar, Footer, CartDrawer)
│   │   │   └── ui/            # Reusable UI (Modal, DataTable, Badge, etc.)
│   │   ├── context/           # Auth, Cart, Theme contexts
│   │   ├── pages/
│   │   │   ├── admin/         # 15 admin pages
│   │   │   └── customer/      # 10 customer pages
│   │   ├── services/          # API service layer
│   │   ├── App.jsx            # Main routing
│   │   └── main.jsx           # Entry point
│   └── package.json
├── server/                    # Express Backend
│   ├── controllers/           # 12 controllers
│   ├── models/                # 17 MongoDB models
│   ├── routes/                # 12 route files (80+ endpoints)
│   ├── middleware/             # Auth, validation, error handling
│   ├── utils/                 # Helpers
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/MBappy-404/resturent-mangment.git
cd resturent-mangment
```

2. **Set up environment variables**
```bash
cp .env.example server/.env
# Edit server/.env with your MongoDB URI and JWT secret
```

3. **Install dependencies**
```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

4. **Run development servers**
```bash
# Terminal 1 — Backend (port 5000)
cd server && npm run dev

# Terminal 2 — Frontend (port 3000)
cd client && npm run dev
```

5. **Open in browser**
- Customer site: http://localhost:3000
- Admin panel: http://localhost:3000/admin

### Demo Credentials
```
Admin: admin@restaurant.com / admin123
```

## API Endpoints

The backend provides 80+ RESTful API endpoints:

- `POST /api/auth/register` — Admin registration
- `POST /api/auth/login` — Admin login
- `CRUD /api/menu` — Menu items management
- `CRUD /api/menu/categories` — Category management
- `CRUD /api/orders` — Order management
- `CRUD /api/tables` — Table management
- `CRUD /api/reservations` — Reservation management
- `CRUD /api/staff` — Staff management
- `CRUD /api/inventory` — Inventory management
- `CRUD /api/customers` — Customer management
- `CRUD /api/invoices` — Invoice management
- `GET /api/reports/*` — Reports & analytics
- `CRUD /api/organization` — Organization settings
- `POST /api/customer-auth/*` — Customer authentication
- `GET /api/shop/*` — E-commerce public APIs

## Database Models (17)

User, CustomerUser, Organization, Branch, Category, MenuItem, Order, Table, Reservation, Staff, Inventory, Customer, Invoice, Review, Coupon, DeliveryZone, Notification

## License

MIT
