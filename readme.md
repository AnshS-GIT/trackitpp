# TrackIT++ — Multi-Tenant Enterprise Issue & Collaboration Platform

> **A scalable, secure, and compliance-ready issue tracking system designed for enterprise governance, multi-tenancy, and auditable collaboration.**

---

## 2. Problem Statement
Modern enterprises require more than just simple bug tracking. They need a system that ensures **data isolation** across different organizations, enforces **strict role-based access control (RBAC)**, and provides **immutable audit trails** for compliance. Existing solutions often lack the flexibility to handle complex hierarchies or fail to provide transparent "proof of work" mechanisms for external contributors.

## 3. Solution Overview
**TrackIT++** is a re-architected, enterprise-grade platform that bridges the gap between issue tracking and governance. It introduces a **multi-tenant architecture** where organizations are strictly isolated, ensures every action is **logged for auditing**, and implements a unique **Contribution & Proof** workflow that allows engineers to submit work for manager review before closure.

## 4. Architecture Overview

### Core Patterns
The backend follows a strict **Controller-Service-Repository** pattern to ensure separation of concerns and maintainability:
- **Routes**: Define endpoints and apply middleware (Auth, RBAC).
- **Controllers**: Handle HTTP requests, validation, and response formatting.
- **Services**: Contain business logic, complex operations, and transaction management.
- **Models**: Define data schemas and interaction with the database.

### Key Architectural Pillars
- **Multi-Tenant Isolation**: Data access is scoped strictly to the user's active organization context.
- **RBAC Enforcement**: Middleware ensures users can only perform actions permitted by their role (Admin, Manager, Engineer, Auditor, Member).
- **Stateless Authentication**: distinct JWTs for secure, scalable session management.

## 5. Architecture Overview

TrackIT++ follows a modular monolith architecture:

- Frontend (React + Vite) deployed on Vercel
- Backend API (Node.js + Express) deployed on Render
- MongoDB Atlas as the primary datastore
- JWT-based authentication
- Organization-scoped RBAC enforcement at service layer
- Centralized audit logging system

All issue and membership queries are strictly scoped by `orgId` to enforce multi-tenant isolation.


---

## 6. Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: TailwindCSS 4
- **State/Routing**: React Router DOM 7
- **HTTP Client**: Axios (with interceptors)
- **Utils**: jwt-decode

### Backend
- **Runtime**: Node.js & Express
- **Database**: MongoDB (Mongoose 9)
- **Security**: Helmet, CORS, Express Rate Limit, BCrypt, JWT
- **Logging**: Morgan

### Deployment
- **Frontend**: Vercel (Static/SPA hosting)
- **Backend**: Render (Node.js Web Service)

---

## 7. Features

- [x] **Multi-Tenancy**: Create and manage multiple organizations with strict data isolation.
- [x] **Secure Authentication**: JWT-based login/register with password hashing.
- [x] **Role-Based Access Control**: Granular permissions for Admins, Managers, Engineers, and Auditors.
- [x] **Issue Lifecycle Management**: comprehensive workflow (Open -> In Progress -> Resolved -> Closed).
- [x] **Proof of Work System**: Engineers must submit "proofs" (links/files) for contributions.
- [x] **Manager Reviews**: Contribution requests require manager approval to merge/close.
- [x] **Audit Logging**: Immutable logs for critical actions (login, issue updates, assignments).
- [x] **Dashboard Analytics**: High-level view of issue stats and user performance.
- [x] **Responsive UI**: Modern, clean interface built for productivity.

---

## 8. Security & RBAC Model

We enforce a **Zero Trust** approach where every request is authenticated and authorized.

| Role | Permissions |
| :--- | :--- |
| **Admin** | Full control over organization, users, and audit logs. |
| **Manager** | Can assign issues, review proofs, and secure issue closure. |
| **Engineer** | Can view assigned issues, work on them, and submit proofs. |
| **Auditor** | Read-only access to all data and system audit logs for compliance. |
| **Member** | Basic read-only access to public organizational data. |

**Security Measures:**
- **Helmet** for HTTP header security.
- **Rate Limiting** to prevent brute-force attacks.
- **Mongo Sanitize** to prevent injection attacks.
- **CORS** configuration for trusted domains only.

---

## 9. Contribution & Proof Workflow

1.  **Assignment**: Manager assigns an issue to an Engineer.
2.  **Work**: Engineer marks issue as *In Progress*.
3.  **Submission**: Engineer submits a **Contribution Request** with a **Proof** (e.g., PR link, screenshot).
4.  **Review**: Manager reviews the proof.
    *   *Approve*: Contribution is verified, issue can be resolved.
    *   *Reject*: Feedback is provided, issue remains open.
5.  **Audit**: The entire workflow is logged in the `AuditLog` collection.

---

## 10. Audit Logging System

Compliance is a first-class citizen. The `AuditLog` service automatically records:
- **Who** performed the action (User ID, Role).
- **What** happened (Action Type: `LOGIN`, `ISSUE_UPDATE`, `ORG_CREATE`, etc.).
- **Where** it happened (Resource ID, IP Address).
- **When** it happened (Timestamp).

This data is accessible only to **Admins** and **Auditors** via the `/audit-logs` endpoint.

---

## 11. Non-Functional Requirements

- **Security**: All passwords hashed with bcrypt. JWTs expire effectively. API endpoints protected by dual middleware (Auth + Role).
- **Scalability**: Stateless architecture allows horizontal scaling of backend instances.
- **Maintainability**: Strict linting (ESLint) and modular directory structure.
- **Observability**: Centralized error handling and request logging via Morgan.

---

## 12. Getting Started

### Prerequisites
- Node.js v16+
- MongoDB (Local or Atlas)
- npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-org/trackitpp.git
    cd trackitpp
    ```

2.  **Install Backend Dependencies**
    ```bash
    cd backend
    npm install
    ```

3.  **Install Frontend Dependencies**
    ```bash
    cd ../frontend
    npm install
    ```

### Environment Variables
Create a `.env` file in the `backend` directory based on `.env.example`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/trackitpp
JWT_SECRET=your_super_secret_key
NODE_ENV=development
```

### Run Scripts

**Backend:**
```bash
cd backend
npm start        # Production
npm run dev      # Development (Nodemon)
```

**Frontend:**
```bash
cd frontend
npm run dev      # Vite Dev Server
npm run build    # Production Build
```

---

## 13. Deployment

### Frontend (Vercel)
1.  Connect GitHub repo to Vercel.
2.  Set Root Directory to `frontend`.
3.  Set Build Command: `npm run build`.
4.  Set Output Directory: `dist`.
5.  Add environment variables (e.g., `VITE_API_BASE_URL`).

### Backend (Render)
1.  Create a Web Service on Render.
2.  Connect GitHub repo.
3.  Set Root Directory to `backend`.
4.  Set Build Command: `npm install`.
5.  Set Start Command: `node index.js`.
6.  Add Environment Variables from your `.env` file.

---

## 14. Project Structure

```
trackitpp/
├── backend/
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Auth, RBAC, Error handling
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API definitions
│   ├── services/         # Business logic
│   └── index.js          # Entry point
│
└── frontend/
    ├── src/
    │   ├── api/          # Axios setup & endpoints
    │   ├── components/   # Reusable UI components
    │   ├── context/      # React Context (Auth, Toast)
    │   ├── layouts/      # Dashboard/Admin layouts
    │   ├── pages/        # Route components
    │   └── utils/        # Helpers (Auth, formatting)
    └── vite.config.js    # Vite configuration
```

---

## 15. API Overview

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user | Public |
| `POST` | `/api/auth/register` | Register new account | Public |
| `GET` | `/api/issues` | Fetch all issues | Auth |
| `POST` | `/api/issues` | Create a new issue | Auth |
| `PATCH` | `/api/issues/:id` | Update status/assign | Manager/Admin |
| `POST` | `/api/proofs` | Submit work proof | Engineer |
| `GET` | `/api/files/audit-logs`| View system logs | Admin/Auditor |

> *Full API documentation available in the Postman Collection.*

---

## 16. Screenshots

![Dashboard](https://via.placeholder.com/800x400?text=Dashboard+UI)
![Issue Board](https://via.placeholder.com/800x400?text=Issue+Tracking+Board)

---

## 17. Roadmap

- [ ] Email Notifications for assignment/updates.
- [ ] Slack/Teams Integration webhooks.
- [ ] Advanced Reporting & CSV Export.
- [ ] Dark Mode (Native Support).

---

## 18. Contribution Guide

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch.
5.  Open a Pull Request.

---

## 19. License

Distributed under the MIT License. See `LICENSE` for more information.