# GiG Flow — Lead Management System

A full-stack lead management CRM with role-based access control, filtering, pagination, and CSV export.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, Tailwind CSS, shadcn/ui |
| Backend | Express.js, TypeScript |
| Database | MongoDB (Mongoose) |
| Auth | JWT (HTTP-only cookies) |

## Features

- **Role-based access**: `admin` can create, edit, delete leads; `sales` can only view
- **Leads table**: paginated (10/page), sortable by newest/oldest
- **Filters**: by status (`New`, `Contacted`, `Qualified`, `Lost`) and source (`Website`, `Instagram`, `Referral`)
- **Search**: debounced name/email search
- **CSV export**: admin-only, respects active filters
- **Dark mode**: system-aware toggle

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster (or local MongoDB)

### 1. Clone the repo

```bash
git clone <repo-url>
cd hire
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Fill in your MONGODB_URI and JWT_SECRET in .env
npm install
npm run dev
```

Server runs on `http://localhost:2000`

### 3. Frontend

```bash
cd frontend
cp .env.example .env
# NEXT_PUBLIC_BACKEND_URL defaults to http://localhost:2000
npm install
npm run dev
```

App runs on `http://localhost:3000`

---

## Environment Variables

### `backend/.env`

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWTs |
| `PORT` | Port for the Express server (default: 2000) |

### `frontend/.env`

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | Base URL of the backend API |

---

## API Documentation

Base URL: `http://localhost:2000`

All `/leads` routes require a valid JWT cookie (`jwt`) from login.

### Auth

#### `POST /auth/signup`
Register a new user.

**Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "admin | sales"  // optional, defaults to "admin"
}
```

**Response `201`:**
```json
{
  "token": "jwt_string",
  "user": { "id": "", "name": "", "email": "", "role": "" }
}
```

---

#### `POST /auth/login`
Login and receive a JWT via HTTP-only cookie.

**Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response `200`:**
```json
{
  "user": { "id": "", "name": "", "email": "", "role": "" }
}
```

---

### Leads

All lead routes require authentication. Write operations (`POST`, `PUT`, `DELETE`) require `admin` role.

#### `GET /leads`
Get paginated leads with optional filters.

**Query params:**

| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `sort` | `newest \| oldest` | Sort order (default: newest) |
| `status` | string | Filter by status |
| `source` | string | Filter by source |
| `search` | string | Search by name or email |

**Response `200`:**
```json
{
  "leads": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

---

#### `GET /leads/export`
Export all matching leads as JSON (admin only). Supports same filter params as `GET /leads`.

**Response `200`:**
```json
{ "leads": [...] }
```

---

#### `GET /leads/:id`
Get a single lead by ID.

---

#### `POST /leads`
Create a new lead. *(Admin only)*

**Body:**
```json
{
  "name": "string",
  "email": "string",
  "status": "New | Contacted | Qualified | Lost",
  "source": "Website | Instagram | Referral"
}
```

---

#### `PUT /leads/:id`
Update a lead. *(Admin only)*

**Body:** same fields as `POST /leads`

---

#### `DELETE /leads/:id`
Delete a lead. *(Admin only)*

**Response `200`:**
```json
{ "message": "Lead deleted" }
```

---

## Project Structure

```
hire/
├── backend/
│   ├── db/
│   │   ├── db.ts          # MongoDB connection
│   │   └── schema.ts      # User & Lead mongoose models
│   ├── lib/token.ts       # JWT helpers
│   ├── middleware/
│   │   ├── auth.ts        # JWT verification
│   │   └── requireAdmin.ts
│   ├── routes/
│   │   ├── auth.ts        # /auth endpoints
│   │   └── leads.ts       # /leads endpoints
│   └── index.ts           # Express app entry
└── frontend/
    ├── app/
    │   ├── login/         # Login page
    │   ├── register/      # Register page
    │   └── leads/         # Main leads dashboard
    ├── components/ui/     # shadcn/ui components
    ├── hooks/useDebounce.ts
    └── lib/
        ├── auth.ts        # Cookie-based auth helpers
        └── export.ts      # CSV export logic
```
