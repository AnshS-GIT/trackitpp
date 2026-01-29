# TrackIT++ — Enterprise Issue & Risk Management System

TrackIT++ is a **production-grade enterprise issue and risk management system** inspired by internal tooling used at large organizations.  
It supports structured issue workflows, role-based access control, audit logging, and compliance-focused visibility.

🔗 **Live Demo**
- Frontend: https://trackitpp.vercel.app/
- Backend API: https://trackitpp-backend.onrender.com/health

---

## 🧠 Why TrackIT++

Modern enterprises require:
- Clear ownership of operational issues
- Strong access controls
- Full auditability for compliance
- Clean internal dashboards for engineers and managers

TrackIT++ simulates these real-world requirements in a full-stack system.

---

## ✨ Core Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-Based Access Control (RBAC)
- Roles: ENGINEER, MANAGER, AUDITOR, ADMIN

### 🛠 Issue Management
- Create, assign, and update issues
- Priority and status tracking
- Role-aware issue visibility

### 🧾 Audit & Compliance
- Immutable audit logs for critical actions
- Tracks issue creation, assignment, and status changes
- Read-only access for auditors

### 📊 Admin Dashboard
- Enterprise-style admin UI
- Clean tables with status & priority badges
- Filterable audit logs
- Responsive, production-ready UX

---

## 🏗 Architecture Overview

trackitpp/
├── backend/
│ ├── controllers/
│ ├── services/
│ ├── models/
│ ├── middleware/
│ └── server.js
├── frontend/
│ ├── pages/
│ ├── api/
│ ├── layouts/
│ └── routes/


### Backend
- Node.js + Express
- MongoDB (Atlas)
- JWT authentication
- Centralized error handling
- Audit logging

### Frontend
- React (Vite)
- Tailwind CSS v4
- Role-protected routes
- Enterprise dashboard UI

---

## 🧪 User Roles

| Role | Capabilities |
|----|----|
| ENGINEER | Create and update assigned issues |
| MANAGER | Assign issues, manage workflows |
| AUDITOR | View audit logs (read-only) |
| ADMIN | Full system access |

---

## 🚀 Local Setup

### Backend
cd backend
npm install
npm run dev

### Frontend
cd frontend
npm install
npm run dev

### 📌 Future Enhancements
- Pagination and advanced filtering for large datasets
- SLA and escalation tracking for issue resolution
- Optimistic UI updates using a data-fetching layer (e.g., React Query)
- Soft deletes with recovery support for audit-critical data


Built as a portfolio-grade project to demonstrate enterprise backend design, security, and frontend admin tooling.