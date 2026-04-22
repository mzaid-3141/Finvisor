# Finvisor — Smart Financial Portfolio Management

Finvisor is a full-stack financial portfolio management platform. Admins define investable asset classes; customers request portfolios by providing a capital amount and a risk tolerance, and the system automatically allocates funds across assets using a proximity-weighted algorithm.

---

## Table of Contents

- [Project Scope](#project-scope)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Allocation Algorithm](#allocation-algorithm)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running Tests](#running-tests)
- [API Reference](#api-reference)
- [Tradeoffs & Design Decisions](#tradeoffs--design-decisions)

---

## Project Scope

### Roles

| Role     | Capabilities |
|----------|-------------|
| Admin    | Create, update, delete asset classes; view all users and portfolios |
| Customer | Sign up, create portfolios (capital + risk level), view allocation breakdowns |

### Key Features

- **Single-call portfolio creation** — one `POST /portfolios/` request creates the portfolio and allocates all assets automatically
- **Risk-based auto-allocation** — exponential proximity weighting: assets closest to the customer's risk level get the largest share
- **JWT authentication** — stateless, role-based access control on every protected endpoint
- **Admin seeding** — admin account and initial asset classes are bootstrapped via a seed script; the public signup endpoint is customer-only
- **Interactive dashboards** — customer dashboard with pie chart breakdowns; admin dashboard with full asset CRUD
- **Database migrations** — Alembic versioned migrations with cascade deletes

---

## Tech Stack

### Backend

| Technology | Version | Why |
|-----------|---------|-----|
| **Python** | 3.12 | Mature ecosystem, strong typing support, excellent data-science alignment |
| **FastAPI** | 0.115 | Async-ready, automatic OpenAPI docs, Pydantic integration, minimal boilerplate |
| **SQLAlchemy** | 2.0 | Battle-tested ORM with expressive query API; easy to swap databases |
| **Alembic** | 1.13 | First-class migration tooling for SQLAlchemy; supports auto-generation and rollback |
| **PostgreSQL** | 15 | ACID-compliant, robust JSON support, reliable for financial data |
| **python-jose** | 3.3 | Lightweight JWT implementation; HS256 signing for stateless auth |
| **bcrypt** | 4.x | Industry-standard password hashing with adaptive cost factor |
| **python-dotenv** | 1.1 | Clean separation of config from code; 12-factor app compliance |
| **pytest** | 8.x | Simple, powerful testing; fixtures make setup/teardown clean |

### Frontend

| Technology | Version | Why |
|-----------|---------|-----|
| **Next.js** | 16 (App Router) | File-based routing, SSR/SSG options, excellent DX, Vercel-deploy-ready |
| **TypeScript** | 5.x | Static typing catches API contract mismatches at compile time |
| **Tailwind CSS** | 3.x | Utility-first; dark theme achievable without a component library; zero runtime cost |
| **Recharts** | 2.x | React-native chart library; composable API; good accessibility defaults |
| **lucide-react** | 0.4 | Consistent, tree-shakeable icon set |
| **clsx** | 2.x | Conditional class names without string interpolation mess |

### Infrastructure

| Technology | Why |
|-----------|-----|
| **Docker Compose** | One command spins up PostgreSQL locally; no system-level install required |

---

## Architecture

```
Finvisor/
├── backend/          FastAPI application
│   ├── app/
│   │   ├── models/   SQLAlchemy ORM models (User, Asset, Portfolio, Allocation)
│   │   ├── schemas/  Pydantic request/response schemas
│   │   ├── services/ Business logic layer (allocation algorithm lives here)
│   │   ├── routes/   FastAPI routers (thin — delegate to services)
│   │   ├── auth.py   JWT creation, verification, role guards
│   │   ├── config.py Settings loaded from .env
│   │   └── database.py SQLAlchemy engine + session factory
│   ├── migrations/   Alembic versioned migrations
│   ├── tests/        pytest suite (SQLite in-memory)
│   ├── seed.py       Bootstrap admin user + default asset classes
│   └── docker-compose.yml  PostgreSQL 15 container
│
└── frontend/         Next.js 16 application
    ├── app/          App Router pages
    │   ├── auth/     Login & signup pages
    │   └── dashboard/
    │       ├── customer/   Portfolio list, create, detail (pie chart)
    │       └── admin/      Asset CRUD dashboard
    ├── components/   Shared UI (Button, Input, Card, Modal, Toast, badges)
    ├── hooks/        useAuth — React Context + localStorage token
    └── lib/          API client (typed fetch wrapper) + TypeScript types
```

The backend follows a **routes → services → models** layering:
- Routes handle HTTP concerns only (auth guards, status codes)
- Services own all business logic (allocation math, ownership checks)
- Models are pure ORM; no logic

---

## Allocation Algorithm

When a customer submits `{ capital, risk_level }`, the system scores every asset class with:

```
weight(asset) = 2 ^ (5 - |risk_level - asset.risk_score|)
```

Assets at the exact target risk level receive the maximum weight (`2^5 = 32`). Each step away from the target halves the allocation exponentially.

**Example — risk_level = 4, assets at scores 1–5:**

| Asset (risk) | Weight | Allocation |
|-------------|--------|-----------|
| 1           | 4      | 5.26 %    |
| 2           | 8      | 10.53 %   |
| 3           | 16     | 21.05 %   |
| **4**       | **32** | **42.11 %** |
| 5           | 16     | 21.05 %   |

Total weight = 76. Each percentage = `weight / 76 * 100`.

---

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Python 3.12+
- Node.js 22+ (use `nvm use` in the `frontend/` directory)

### 1. Start the database

```bash
cd backend
docker compose up -d
```

### 2. Set up the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt   # if requirements.txt exists
# or: pip install fastapi sqlalchemy alembic psycopg2-binary python-jose bcrypt python-dotenv uvicorn pytest httpx

cp .env.example .env              # edit if your DB credentials differ
```

### 3. Run migrations

```bash
alembic upgrade head
```

### 4. Seed the database

Creates the admin user and 5 default asset classes (idempotent — safe to re-run):

```bash
python seed.py
```

Default admin credentials:
- **Email:** `admin@finvisor.com`
- **Password:** `Admin@1234`

### 5. Start the backend

```bash
uvicorn app.main:app --reload --port 8001
```

API docs available at `http://localhost:8001/docs`

### 6. Set up the frontend

```bash
cd frontend
nvm use                 # switches to Node 22 via .nvmrc
cp .env.example .env.local
npm install
npm run dev
```

Frontend runs at `http://localhost:3000` (or `3001` if 3000 is occupied).

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|---------|---------|-------------|
| `DATABASE_URL` | `postgresql://admin:admin@localhost:5433/portfolio_db` | PostgreSQL connection string |
| `SECRET_KEY` | `mysecretkey` | JWT signing key — **change in production** |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | JWT lifetime |
| `SQL_ECHO` | `false` | Set `true` to log SQL queries |

### Frontend (`frontend/.env.local`)

| Variable | Default | Description |
|---------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8001` | Backend base URL |

---

## Running Tests

The test suite uses SQLite in-memory (no Postgres required):

```bash
cd backend
source venv/bin/activate
pytest tests/ -v
```

Key test — `test_request_portfolio_single_api_call`:
1. Admin creates 5 asset classes (risk scores 1–5)
2. Customer POSTs `{ capital: 10000, risk_level: 4 }`
3. Verifies 5 allocations are created, percentages sum to 100%, amounts sum to capital, and risk-4 asset receives ~42.11%

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/users/auth/signup` | — | Register a new customer |
| POST | `/users/auth/login` | — | Login, returns JWT |
| GET | `/users/auth/me` | Bearer | Get current user profile |

### Assets (Admin only for write operations)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/assets/` | — | List all asset classes |
| GET | `/assets/{id}` | — | Get single asset |
| POST | `/assets/` | Admin | Create asset class |
| PUT | `/assets/{id}` | Admin | Update asset class |
| DELETE | `/assets/{id}` | Admin | Delete asset class |

### Portfolios

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/portfolios/` | Bearer | List customer's portfolios |
| POST | `/portfolios/` | Bearer | Create portfolio + auto-allocate |
| GET | `/portfolios/{id}` | Bearer | Get portfolio with allocations |
| DELETE | `/portfolios/{id}` | Bearer | Delete portfolio |

---

## Tradeoffs & Design Decisions

### Single-call portfolio creation
The `POST /portfolios/` endpoint creates the portfolio and runs the allocation algorithm in one transaction. The tradeoff is less flexibility (you can't create a portfolio without allocating), but the gain is a dramatically simpler client and an atomic operation — you never have an unallocated portfolio sitting in the database.

### Exponential proximity weighting vs linear
Linear weighting (`5 - distance`) produces allocations that are too flat. Exponential (`2^(5-distance)`) creates a strong preference for the target risk while still diversifying across all assets. The exponent base (2) and max power (5) are tunable constants in the service layer.

### SQLite for tests, PostgreSQL for production
Tests override the database session with an SQLite in-memory engine. This avoids spinning up a real database in CI and keeps tests fast. The tradeoff is that PostgreSQL-specific behavior (enum types, JSONB) isn't tested. For this project the overlap is sufficient; a stricter setup would use a test PostgreSQL container.

### JWT over sessions
Stateless JWTs mean the backend has no session store to maintain and scales horizontally without sticky sessions. The tradeoff is that tokens cannot be revoked before expiry — acceptable for this use case given the 60-minute TTL.

### Tailwind over a component library
Using Tailwind directly (no shadcn, MUI, etc.) keeps the bundle lean and gives full control over the dark-theme design system. The tradeoff is more verbose JSX and no accessibility primitives out of the box — modal focus traps and ARIA roles were added manually.

### Admin provisioned via seed, not signup
Allowing admins to self-register via the public signup endpoint is a security anti-pattern. The seed script creates the admin account server-side; the signup route enforces `Customer` role only. The tradeoff is that adding a second admin requires direct database access or a separate admin-management endpoint.
