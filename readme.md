# TrackIT++ — Enterprise Issue & Risk Governance Platform

> A production-grade, multi-tenant issue and risk management system with role-based access control, contribution workflows, and comprehensive audit trails.

🔗 **Live Application**  
- Frontend: https://trackitpp.vercel.app/  
- Backend API: https://trackitpp-backend.onrender.com/api/health

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Key Features](#key-features)
- [Multi-Tenancy & RBAC](#multi-tenancy--rbac)
- [Contributor Workflow](#contributor-workflow)
- [Tech Stack](#tech-stack)
- [Deployment](#deployment)
- [Local Development](#local-development)
- [Lessons Learned](#lessons-learned)
- [Future Enhancements](#future-enhancements)

---

## Overview

TrackIT++ is an **enterprise-grade issue and risk governance platform** designed to simulate real-world internal tools used by large organizations. The system enforces structured workflows, clear ownership, role-based permissions, and full auditability for compliance requirements.

### Business Problem

Modern enterprises need:
- **Organizational isolation** - Multi-tenant architecture where data is strictly scoped to organizations
- **Controlled access** - Fine-grained RBAC to enforce who can create, assign, review, and audit issues
- **Accountability** - Immutable audit logs for all critical actions
- **Structured contribution** - Formal workflows for non-assigned users to contribute to issues
- **Compliance visibility** - Read-only access for auditors with full system transparency

### Solution

TrackIT++ implements a **modular monolith** architecture with clean separation of concerns, organization-based data isolation, and a comprehensive contribution proof system that allows users to request to work on issues, submit proof of work, and have their contributions formally reviewed.

---

## Architecture

### System Design: Modular Monolith

TrackIT++ follows a **layered monolith architecture** with strict separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌──────────────┐│
│  │  Pages  │→│ API Fns │→│ Axios    │→│ Auth Utils   ││
│  └─────────┘ └─────────┘ └──────────┘ └──────────────┘│
└─────────────────────────────────────────────────────────┘
                          ↓ HTTPS
┌─────────────────────────────────────────────────────────┐
│                Backend (Node.js/Express)                 │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Routes → Controllers → Services → Models         │ │
│  │    ↓          ↓            ↓          ↓           │ │
│  │  Auth MW   Thin Layer  Business   Mongoose        │ │
│  │  RBAC MW   Validation  Logic      Schemas         │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Database (MongoDB Atlas)                    │
│  Organizations | Users | Issues | Proofs | Audit Logs  │
└─────────────────────────────────────────────────────────┘
```

### Backend Architecture

**Controllers** (`/controllers`)
- Thin request/response handlers
- Extract parameters, headers, and organization context
- Delegate all business logic to services
- Return standardized JSON responses

**Services** (`/services`)
- Core business logic
- Data validation and authorization checks
- Audit log generation
- Transaction management

**Models** (`/models`)
- Mongoose schemas with strict validation
- Indexes for performance (unique constraints, compound indexes)
- Timestamps and base options
- Reference integrity via ObjectIds

**Middleware** (`/middleware`)
- `auth.middleware.js` - JWT verification, user attachment to req.user
- `rbac.middleware.js` - Role-based authorization
- `errorHandler.js` - Centralized error handling
- `asyncHandler.js` - Async/await error wrapper

### Frontend Architecture

**Pages** (`/pages`)
- Dashboard, Issues, Organizations, Profile, etc.
- Smart components with data fetching and state management

**API Layer** (`/api`)
- Axios instance with base URL configuration
- Automatic JWT token injection via interceptors
- Organization context via `X-Organization-Id` header

**Layouts** (`/layouts`)
- `AdminLayout` - Sidebar navigation with organization selector
- Protected route wrapper with role-based rendering

**Components** (`/components`)
- Reusable UI components (EmptyState, LoadingSpinner, ErrorMessage)
- Consistent styling and UX patterns

---

## Key Features

### 🔐 Authentication & Authorization

**JWT-Based Authentication**
- Secure token generation with bcrypt password hashing
- Token stored in localStorage with automatic inclusion in API requests
- Token expiration and refresh handling

**Role-Based Access Control (RBAC)**
| Role | Capabilities |
|------|--------------|
| **ENGINEER** | Create issues, request contributions, submit proofs |
| **MANAGER** | Assign issues, approve contribution requests, review proofs |
| **ADMIN** | Full system access, organization management, member invitations |
| **AUDITOR** | Read-only access to audit logs and system state |

### 🏢 Multi-Tenant Organization Management

**Organization Isolation**
- All data strictly scoped to organizations via `organization` field
- Users can belong to multiple organizations
- Active organization selection persists in localStorage
- Data filtering enforced at service layer

**Member Management**
- Invite users to organizations via email
- Assign roles at organization level
- View organization members with role display

### 📊 Issue Management

**Core Features**
- Create, assign, update, and resolve issues
- Priority levels: LOW, MEDIUM, HIGH
- Status lifecycle: OPEN → IN_PROGRESS → RESOLVED → CLOSED
- Role-based assignment controls (only MANAGER/ADMIN can assign)
- Organization-aware issue filtering

**Dashboard Analytics**
- Total, open, in-progress, and closed issue counts
- Role-specific views (Engineers see only their issues)
- Organization-scoped metrics

### 🤝 Contributor Workflow

A unique feature that allows structured participation on issues:

**1. Contribution Request**
```
POST /api/issues/:issueId/contribute
- Users request to work on issues they're not assigned to
- Validates user is an organization member
- Prevents requests on CLOSED/RESOLVED issues
- Creates PENDING request
```

**2. Request Approval** *(future endpoint)*
```
- MANAGER/ADMIN approves request → Status: APPROVED
- User can now submit proof of work
```

**3. Proof Submission**
```
POST /api/issues/:issueId/proofs
- Only APPROVED contributors can submit
- Include work description and links
- Multiple submissions allowed (iterative work)
- Status: SUBMITTED
```

**4. Proof Review**
```
PATCH /api/proofs/:proofId/review
- MANAGER/ADMIN reviews proof
- Decision: ACCEPTED or REJECTED
- On ACCEPT: Issue auto-resolves to RESOLVED
- Full audit trail maintained
```

### 🧾 Audit & Compliance

**Immutable Audit Logs**
- Every critical action logged:
  - Issue creation, assignment, status changes
  - Contribution requests and proof submissions
  - Proof reviews and acceptances
- Includes: action type, entity, performer, timestamps, old/new values
- Read-only access for AUDITOR role

**Audit Log Filtering**
- Filter by action type, entity type, performer
- Searchable and sortable
- Enterprise-grade compliance visibility

### 📈 Profile & Recognition

**User Contributions Display**
- Accepted contributions count
- Pending proof submissions
- Issue statistics (total, pending, closed)
- Recognition without gamification

---

## Multi-Tenancy & RBAC

### Multi-Tenancy Design

**Organization Context**
```javascript
// Frontend: Automatic header injection
const activeOrgId = localStorage.getItem("activeOrgId");
api.get("/issues", {
  headers: { "X-Organization-Id": activeOrgId }
});

// Backend: Context extraction and filtering
const organization = req.headers["x-organization-id"];
const issues = await Issue.find({ organization });
```

**Data Isolation Guarantees**
1. **Schema-level**: All domain models have required `organization` field
2. **Service-level**: All queries filtered by organization context
3. **Membership validation**: Actions verify user belongs to organization
4. **UI-level**: Organization selector in sidebar, full page reload on change

### RBAC Implementation

**Middleware-Based Authorization**
```javascript
// Protect endpoint with specific roles
router.patch(
  "/proofs/:proofId/review",
  protect,                           // JWT verification
  authorizeRoles("ADMIN", "MANAGER"), // Role check
  proofReviewController.reviewProof
);
```

**Role Hierarchy**
- `ADMIN` > `MANAGER` > `ENGINEER` > `AUDITOR`
- Permissions cascade (ADMIN can do everything MANAGER can do)
- AUDITOR is read-only across all resources

---

## Contributor Workflow

### User Journey

**Scenario**: An engineer wants to contribute to an unassigned issue

```
1. DISCOVER
   └─ Browse issues → Find interesting unassigned issue

2. REQUEST
   └─ Click "Request to Contribute"
   └─ POST /api/issues/:id/contribute
   └─ Backend validates membership & issue eligibility
   └─ ContributionRequest created (Status: PENDING)

3. APPROVAL (Manager Action)
   └─ Manager reviews request
   └─ Approves → Status: APPROVED
   └─ Audit log: CONTRIBUTION_REQUEST_APPROVED

4. WORK
   └─ Engineer works on the issue
   └─ Prepares proof (description + links)

5. SUBMIT PROOF
   └─ POST /api/issues/:id/proofs
   └─ Backend validates APPROVED request exists
   └─ ContributionProof created (Status: SUBMITTED)
   └─ Audit log: CONTRIBUTION_PROOF_SUBMITTED

6. REVIEW (Manager Action)
   └─ Manager reviews proof
   └─ PATCH /api/proofs/:id/review { decision: "ACCEPTED" }
   └─ On ACCEPT:
       - Proof status → ACCEPTED
       - Issue status → RESOLVED
       - Audit log: CONTRIBUTION_PROOF_REVIEWED

7. RECOGNITION
   └─ Accepted contribution count increments
   └─ Displayed on user profile
```

### Benefits

- **Structured participation** - Clear workflow for non-assigned contributors
- **Accountability** - All work tracked and reviewed
- **Quality control** - Manager approval gates prevent spam
- **Recognition** - Accepted contributions visible on profile
- **Audit trail** - Complete history of who did what

---

## Tech Stack

### Backend
- **Runtime**: Node.js v20+
- **Framework**: Express v5
- **Database**: MongoDB Atlas (Cloud)
- **ODM**: Mongoose v9
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **Middleware**: CORS, Morgan (logging)
- **Code Quality**: ESLint, Prettier

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite v7
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS v4
- **State**: React Hooks (useState, useEffect)
- **Code Quality**: ESLint

### Development Tools
- **Version Control**: Git + GitHub
- **Package Manager**: npm
- **Environment**: dotenv

---

## Deployment

### Production Architecture

```
┌──────────────────┐         ┌──────────────────┐
│   Vercel (SPA)   │─────────│ Render (API)     │
│   React App      │  HTTPS  │ Express Server   │
│   CDN Delivery   │◄────────│ Auto-deploy      │
└──────────────────┘         └──────────────────┘
                                      │
                                      ▼
                             ┌──────────────────┐
                             │  MongoDB Atlas   │
                             │  Cloud Database  │
                             └──────────────────┘
```

### Frontend (Vercel)

**Configuration**
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**Environment Variables**
```bash
VITE_API_BASE_URL=https://trackitpp-backend.onrender.com/api
```

**SPA Routing** (`vercel.json`)
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
*Critical for client-side routing - all routes serve index.html*

### Backend (Render)

**Configuration**
- Environment: Node
- Build Command: `npm install`
- Start Command: `node backend/server.js`
- Region: Oregon (us-west)

**Environment Variables**
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/trackitpp
JWT_SECRET=your-production-secret-key
PORT=10000
NODE_ENV=production
```

**CORS Configuration**
```javascript
const allowedOrigins = [
  "http://localhost:5173",           // Local dev
  "https://trackitpp.vercel.app"     // Production
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));
```

### Database (MongoDB Atlas)

**Cluster Configuration**
- Tier: M0 (Free tier, suitable for MVP)
- Region: AWS us-east-1
- Network Access: Allow from anywhere (0.0.0.0/0) for Render

**Collections**
- `users` - User accounts with hashed passwords
- `organizations` - Organization entities
- `organizationmembers` - User-org membership with roles
- `issues` - Issue records scoped to organizations
- `contributionrequests` - Contribution request tracking
- `contributionproofs` - Proof of work submissions
- `auditlogs` - Immutable audit trail

**Indexes**
- `users.email` - Unique, for login
- `contributionrequests: {issue, requestedBy}` - Unique, prevent duplicates
- Various compound indexes for query performance

---

## Local Development

### Prerequisites
- Node.js v20+
- MongoDB (local or Atlas)
- npm or yarn

### Setup

**1. Clone Repository**
```bash
git clone https://github.com/AnshS-GIT/trackitpp.git
cd trackitpp
```

**2. Backend Setup**
```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/trackitpp
JWT_SECRET=your-local-secret-key
PORT=5000
NODE_ENV=development
EOF

# Start server
node server.js
# Server running on http://localhost:5000
```

**3. Frontend Setup**
```bash
cd frontend
npm install

# Create .env file
cat > .env << EOF
VITE_API_BASE_URL=http://localhost:5000/api
EOF

# Start dev server
npm run dev
# App running on http://localhost:5173
```

**4. Create Test User**
```bash
# Use Register page or make direct API call
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Admin",
    "email": "admin@test.com",
    "password": "password123",
    "role": "ADMIN"
  }'
```

### Development Workflow

1. **Create organization** via Organizations page
2. **Switch to organization** using sidebar dropdown
3. **Create issues** via Create Issue page
4. **Test contribution workflow** with multiple users
5. **Review audit logs** as AUDITOR

---

## Lessons Learned

### 1. CORS Configuration in Production

**Problem**: Frontend deployed to Vercel couldn't communicate with Render backend due to CORS errors.

**Solution**: 
- Implemented origin validation function instead of wildcard
- Added production domain to allowed origins
- Enabled `credentials: true` for cookie/auth support

**Key Insight**: Never use `"*"` origin with credentials in production - browsers block it for security.

### 2. Environment Variable Management

**Problem**: `process.env.VITE_*` variables not accessible in production build.

**Solution**:
- Environment variables must be set in Vercel dashboard, not `.env` file
- Vite only exposes variables prefixed with `VITE_`
- Backend needs explicit environment variable configuration on Render

**Key Insight**: Never commit `.env` files; use platform-specific environment configuration.

### 3. SPA Routing on Static Hosts

**Problem**: Direct navigation to routes like `/issues` returned 404 on Vercel.

**Solution**:
- Added `vercel.json` with rewrite rule to serve `index.html` for all routes
- Client-side router (React Router) handles routing after page load

**Key Insight**: Static hosts need explicit configuration to support client-side routing.

### 4. MongoDB Connection String Security

**Problem**: Hardcoded connection strings led to database access issues when shared.

**Solution**:
- Use environment variables for all sensitive data
- MongoDB Atlas allows IP whitelisting; use feature appropriately
- Render provides persistent IP addresses for backend

**Key Insight**: Treat connection strings as secrets; rotate them if exposed.

### 5. JWT Token Management

**Problem**: Token expiration caused unexpected logouts without warning.

**Solution**:
- Set reasonable expiration (7 days for MVP)
- Store token in `localStorage` (acceptable for MVP; use httpOnly cookies in production)
- Redirect to login with clear message on 401

**Key Insight**: Balance security with UX - too short = annoying, too long = risky.

### 6. Organization Context Consistency

**Problem**: Organization switching worked but required manual page refresh.

**Solution**:
- Implemented `window.location.reload()` on org change (simple, effective)
- **Better approach** (future): React Context + useEffect dependencies for automatic re-fetch

**Key Insight**: Simple solutions work for MVPs; optimize when complexity is justified.

### 7. Audit Log  Design

**Problem**: Initial audit logs were verbose and hard to query.

**Solution**:
- Standardized schema with `action`, `entityType`, `entityId`, `performedBy`
- Added `oldValue` and `newValue` for state tracking
- Indexed by `performedBy` and `createdAt` for fast filtering

**Key Insight**: Audit logs are write-heavy, read-occasionally - optimize schema for queries.

### 8. Error Handling Consistency

**Problem**: Different parts of API returned errors in different formats.

**Solution**:
- Centralized error handler middleware
- Standardized error response: `{ success: false, message: string }`
- Services throw errors with `statusCode` property

**Key Insight**: Consistency in error responses makes frontend error handling trivial.

---

## Future Enhancements

### Short-Term (Production Readiness)
- [ ] **Pagination** - Implement cursor-based pagination for issues and audit logs
- [ ] **Email Notifications** - Send emails on issue assignment, proof submission
- [ ] **Contribution Request Approval Endpoint** - Add PATCH /contributions/:id/approve
- [ ] **Search & Filters** - Add full-text search across issues and filtering UI
- [ ] **File Upload** - Support proof attachments (images, documents)

### Medium-Term (Scalability)
- [ ] **Redis Caching** - Cache frequently accessed data (org members, user roles)
- [ ] **React Query** - Replace manual data fetching with optimized library
- [ ] **Optimistic Updates** - Improve UX with instant UI feedback
- [ ] **WebSockets** - Real-time updates for issue assignments and status changes
- [ ] **Soft Deletes** - Archive instead of hard-delete for audit compliance

### Long-Term (Enterprise Features)
- [ ] **SLA Tracking** - Define and monitor issue resolution SLAs
- [ ] **Escalation Rules** - Auto-escalate overdue issues
- [ ] **Analytics Dashboard** - Contribution metrics, resolution time charts
- [ ] **Bulk Operations** - Batch issue assignment and updates
- [ ] **API Rate Limiting** - Implement rate limits per user/org
- [ ] **Two-Factor Authentication** - Enhanced security for sensitive orgs

---

## Project Highlights

This project demonstrates:

✅ **Full-stack proficiency** - React frontend, Node.js backend, MongoDB database  
✅ **Enterprise architecture** - Modular design, clear separation of concerns  
✅ **Security best practices** - JWT auth, RBAC, input validation, audit logging  
✅ **Multi-tenancy** - Organization isolation, context management  
✅ **Production deployment** - Vercel + Render + MongoDB Atlas  
✅ **Clean code** - Linting, formatting, consistent patterns  
✅ **Real-world workflows** - Contribution system simulating enterprise processes  

Built as a **portfolio-grade project** to showcase skills in enterprise backend design, security, scalability, and production-ready frontend development.

---

## License

MIT License - See LICENSE file for details

---

**Author**: Ansh Sharma  
**GitHub**: [@AnshS-GIT](https://github.com/AnshS-GIT)  
**Project**: [TrackIT++](https://github.com/AnshS-GIT/trackitpp)