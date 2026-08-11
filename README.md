# Mini ERP + CRM Operations Portal

## 1. Project Overview

Nexus Ops is a Mini ERP + CRM portal for a wholesale/distribution company. Internal teams (Admin, Sales, Warehouse, Accounts) manage customers, products, stock movements, and sales challans with JWT role-based access and transactional stock rules.

## 2. Features

- JWT authentication and role-based authorization
- Customer CRM (CRUD, search, filters, follow-up notes)
- Products (CRUD, search, low-stock detection)
- Inventory stock IN + stock movement history
- Sales challans (multi-product, draft/confirm/cancel, product snapshots)
- Dashboard summary API
- Validation (Zod), pagination, centralized error handling

## 3. Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React, TypeScript, Vite, React Router, Axios |
| Backend | Node.js, Express, TypeScript, Zod, JWT, Helmet |
| ORM | Prisma |
| Database | PostgreSQL |

## 4. Architecture

```
React (Axios)
   ↓ REST
Express routes
   ↓ auth + role + Zod
Controllers (thin)
   ↓
Services (business logic)
   ↓
Repositories / Prisma
   ↓
PostgreSQL
```

## 5. Database Design

Main tables: `User`, `Customer`, `FollowUpNote`, `Product`, `StockMovement`, `Challan`, `ChallanItem`.

Relationships:
- User → stock movements, challans, follow-ups
- Customer → challans, follow-ups
- Product → stock movements, challan items
- Challan → challan items (with product name/SKU/price snapshots)

## 6. Project Structure

```
backend/src/
  config/ controllers/ services/ repositories/
  routes/ middleware/ validators/ utils/
  app.ts server.ts
backend/prisma/
frontend/src/
  components/ contexts/ hooks/ layouts/
  pages/ routes/ services/ types/ utils/
```

## 7. Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default `5000`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `8h`) |
| `NODE_ENV` | `development` / `production` |
| `CORS_ORIGIN` | Allowed frontend origins (comma-separated) |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | API base URL (`/api` with Vite proxy locally, or full backend URL in production) |

See `backend/.env.example` and `frontend/.env.example`.

## 8. Local Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (local service or Neon/Supabase)

### Database

Create DB/user (example already used locally):

```
DATABASE_URL=postgresql://nexus:nexus@localhost:5432/nexus_ops?schema=public
```

Optional Docker Postgres:

```bash
docker compose up -d
```

### Backend

```bash
cd backend
npm install
cp .env.example .env   # then edit DATABASE_URL / JWT_SECRET
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev
```

API: `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

App: `http://localhost:5173` (Vite proxies `/api` → `:5000`)

## 9. API Documentation

Import [`postman/NexusOps.postman_collection.json`](postman/NexusOps.postman_collection.json).

Key endpoints:

| Method | Path |
|--------|------|
| POST | `/api/auth/login` |
| GET | `/api/auth/me` |
| GET/POST | `/api/customers` |
| GET/PUT | `/api/customers/:id` |
| POST | `/api/customers/:id/follow-ups` |
| GET/POST | `/api/products` |
| GET/PUT | `/api/products/:id` |
| POST | `/api/products/:id/stock-in` |
| GET | `/api/products/:id/stock-movements` |
| GET/POST | `/api/challans` |
| POST | `/api/challans/:id/confirm` |
| POST | `/api/challans/:id/cancel` |
| GET | `/api/dashboard/summary` |

## 10. Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@test.com` | `Admin@123` |
| Sales | `sales@test.com` | `Sales@123` |
| Warehouse | `warehouse@test.com` | `Warehouse@123` |
| Accounts | `accounts@test.com` | `Accounts@123` |

## 11. Business Logic

- **DRAFT challan** does not reduce stock
- **CONFIRMED challan** reduces stock inside a Prisma transaction and creates OUT movements
- Stock can never go negative; insufficient stock returns `400` with available/requested quantities
- Multi-product confirmation is all-or-nothing (full rollback)
- Challan items store product **snapshots** (name, SKU, unit price)
- Valid transitions: `DRAFT → CONFIRMED`, `DRAFT → CANCELLED` only
- Confirmed challans cannot be cancelled (known limitation; no reversal flow)

## 12. Deployment

| Part | Suggested free host |
|------|---------------------|
| Frontend | Vercel / Netlify |
| Backend | Render / Railway / Fly.io |
| Database | Neon / Supabase / Render Postgres |

1. Provision Postgres and set `DATABASE_URL`
2. Set backend env vars (`JWT_SECRET`, `CORS_ORIGIN` = live frontend URL)
3. Run `npx prisma migrate deploy` + seed (or seed once manually)
4. Build backend: `npm run build` → `npm start`
5. Build frontend with `VITE_API_URL=https://YOUR-API/api`

Do not hardcode localhost in production.

## 13. Assumptions

- Internal employee tool (not public self-registration)
- Opening stock on product create creates an IN movement
- Accounts role is primarily read-only for customers/products/challans
- Invoice PDF / purchase orders are out of core scope

## 14. Known Limitations

- Invoice PDF export not implemented (bonus)
- Product image / S3 upload not implemented (bonus)
- GitHub Actions / AWS not prioritized
- Confirmed challan cancellation/reversal not supported by design
