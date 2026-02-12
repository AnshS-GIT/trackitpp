# TrackIT++

Secure multi-tenant issue tracking and collaboration platform with organization-scoped RBAC, audit logging, and invite-based onboarding.

---

## Problem Statement

Most issue trackers treat access control as an afterthought and lack organization isolation. Teams sharing a platform risk data leaks across tenants, have no granular permission enforcement beyond basic roles, and lack audit trails for compliance. There is no structured workflow for engineers to claim work or submit proof of contribution.

## Solution Overview

TrackIT++ is a full-stack issue and governance platform where every operation is scoped to an organization, every action is permission-checked at the service layer, and every mutation is recorded in an immutable audit log. It supports invite-based onboarding, structured contribution workflows, and soft-delete data safety -- all deployed as a production-ready system.

---

## Architecture Overview

```
Client (React + Tailwind)
    |
    v
Express API (Node.js)
    |
    +--> Controllers   (request validation, response shaping)
    +--> Services      (business logic, RBAC enforcement)
    +--> Models        (Mongoose schemas, data validation)
    +--> Middleware     (auth, RBAC, rate limiting, error handling)
```

**Key architectural decisions:**

- **Modular monolith** -- single deployable unit with clear separation of concerns across controllers, services, and models.
- **Organization-scoped data** -- all queries are filtered by `orgId` to enforce tenant isolation at the data layer.
- **Service-layer RBAC** -- permissions are enforced in business logic, not just at the route level.
- **Invite code onboarding** -- organizations generate reusable codes; joins are rate-limited to prevent abuse.
- **Soft delete** -- issues are marked as deleted rather than permanently removed, preserving audit trail integrity.
- **Immutable audit logging** -- every significant action (creation, assignment, status change, membership event) is logged with actor, target, and timestamp.

---

## Tech Stack

| Layer      | Technology                    |
| ---------- | ----------------------------- |
| Backend    | Node.js, Express, Mongoose    |
| Database   | MongoDB Atlas                 |
| Frontend   | React, Tailwind CSS v4, Vite  |
| Auth       | JWT (jsonwebtoken, bcrypt)    |
| Security   | Helmet, CORS, express-rate-limit, express-mongo-sanitize |
| Deployment | Render (API), Vercel (Client) |

---

## Features

- [x] Multi-tenant organizations with full data isolation
- [x] Role-based access control (Owner, Admin, Manager, Engineer, Auditor)
- [x] JWT authentication with protected routes
- [x] Invite code generation and rate-limited join flow
- [x] Issue lifecycle management (Open, In Progress, Resolved, Closed)
- [x] Issue assignment and self-assignment request workflow
- [x] Contribution and proof-of-work submission with review
- [x] Immutable audit logging for all critical actions
- [x] Soft delete with data integrity preservation
- [x] Server-side pagination across issues, members, and audit logs
- [x] Structured error handling with consistent error codes
- [x] Dark mode with persistent theme preference
- [x] Public landing page with auth-aware routing

---

## Security Model

| Layer             | Mechanism                                                |
| ----------------- | -------------------------------------------------------- |
| Authentication    | JWT tokens issued on login, verified on every request    |
| Authorization     | Role-based middleware + service-layer permission checks   |
| Tenant Isolation  | All queries scoped by `x-organization-id` header         |
| Input Validation  | Request body validation + MongoDB query sanitization     |
| Rate Limiting     | Express rate limiter on sensitive endpoints (join, auth)  |
| Security Headers  | Helmet middleware for HTTP security headers               |
| Data Safety       | Soft delete prevents accidental permanent data loss       |
| Audit Trail       | Immutable log entries for every significant mutation      |

---

## API Documentation

Full endpoint documentation with request/response examples is available at [`docs/API.md`](docs/API.md).

---

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB Atlas cluster (or local MongoDB instance)
- npm

### Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
npm start
```

**Environment variables** (see `backend/.env.example`):

```
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/trackitpp
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
NODE_ENV=development
CLIENT_URL=https://trackitpp.vercel.app
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the API at the URL configured in `frontend/.env`:

```
VITE_API_URL=http://localhost:3000/api
```

---

## Deployment

### Backend (Render)

1. Create a new Web Service on Render.
2. Set root directory to `backend`.
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add environment variables from `.env.example`.

### Frontend (Vercel)

1. Import the repository on Vercel.
2. Set root directory to `frontend`.
3. Framework preset: Vite.
4. Add `VITE_API_URL` environment variable pointing to your Render backend URL.

---

## Project Structure

```
trackitpp/
  backend/
    config/          # Database connection
    controllers/     # Request handling (thin layer)
    services/        # Business logic and RBAC enforcement
    models/          # Mongoose schemas
    middleware/      # Auth, RBAC, rate limiting, error handling
    routes/          # Express route definitions
    errors/          # Custom error classes
    utils/           # JWT, helpers
    app.js           # Express app configuration
    server.js        # Entry point
  frontend/
    src/
      api/           # Axios instance and API call functions
      components/    # Reusable UI components (Modal, Toast)
      context/       # React context (Theme, Organization)
      layouts/       # AdminLayout (sidebar, org switcher)
      pages/         # All page components
      routes/        # AppRoutes with protected/public routing
      utils/         # Auth helpers
  docs/
    API.md           # Endpoint documentation
```

---

## Roadmap

- [ ] Email-based invite delivery
- [ ] Organization settings and member role management UI
- [ ] Issue comments and activity timeline
- [ ] Dashboard analytics and charts
- [ ] File attachments on issues and proofs
- [ ] Webhook integrations for external notifications
- [ ] Export audit logs as CSV/PDF

---

## License

MIT