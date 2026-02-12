# TrackIT++ API Documentation

Base URL: `/api`

All protected endpoints require a `Bearer` token in the `Authorization` header.
Organization-scoped endpoints require an `x-organization-id` header.

---

## Error Response Format

All errors follow a consistent structure:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Human-readable error description",
  "details": {}
}
```

Common error codes:

| Status | Description               |
| ------ | ------------------------- |
| 400    | Validation / bad request  |
| 401    | Unauthorized (no token)   |
| 403    | Forbidden (insufficient role) |
| 404    | Resource not found        |
| 429    | Rate limit exceeded       |
| 500    | Internal server error     |

---

## Health

### `GET /api/health`

Returns server status. No authentication required.

**Response** `200`

```json
{
  "status": "ok",
  "uptime": 12345.67,
  "timestamp": "2026-02-12T00:00:00.000Z"
}
```

---

## Authentication

### `POST /api/users/register`

Register a new user account.

| Field      | Type   | Required | Notes                                         |
| ---------- | ------ | -------- | --------------------------------------------- |
| `name`     | string | Yes      |                                               |
| `email`    | string | Yes      | Must be unique                                |
| `password` | string | Yes      | Min 6 characters                              |
| `role`     | string | No       | `ENGINEER` (default), `MANAGER`, `ADMIN`, `AUDITOR` |

**Request**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securePassword123",
  "role": "ENGINEER"
}
```

**Response** `201`

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "64f...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "ENGINEER"
  }
}
```

---

### `POST /api/users/login`

Authenticate and receive a JWT token.

| Field      | Type   | Required |
| ---------- | ------ | -------- |
| `email`    | string | Yes      |
| `password` | string | Yes      |

**Request**

```json
{
  "email": "jane@example.com",
  "password": "securePassword123"
}
```

**Response** `200`

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "64f...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "ENGINEER"
    }
  }
}
```

---

### `GET /api/users`

List all users. **Auth required.**

**Response** `200`

```json
{
  "success": true,
  "data": [
    { "name": "Jane Doe", "email": "jane@example.com", "role": "ENGINEER" }
  ]
}
```

---

### `GET /api/users/me/organizations`

List organizations the authenticated user belongs to. **Auth required.**

**Response** `200`

```json
{
  "success": true,
  "data": [
    { "id": "64f...", "name": "Acme Corp", "visibility": "PUBLIC" }
  ]
}
```

---

## Organizations

### `POST /api/organizations`

Create a new organization. **Auth required.**

| Field        | Type   | Required | Notes                          |
| ------------ | ------ | -------- | ------------------------------ |
| `name`       | string | Yes      |                                |
| `visibility` | string | No       | `PUBLIC` (default) or `PRIVATE` |

**Request**

```json
{
  "name": "Acme Corp",
  "visibility": "PUBLIC"
}
```

**Response** `201`

```json
{
  "success": true,
  "data": {
    "id": "64f...",
    "name": "Acme Corp",
    "visibility": "PUBLIC"
  }
}
```

---

### `POST /api/organizations/:orgId/invite`

Invite a member by email. **Auth required.** Creator becomes Owner.

| Field   | Type   | Required | Notes                    |
| ------- | ------ | -------- | ------------------------ |
| `email` | string | Yes      | Target user's email      |
| `role`  | string | No       | Role to assign in the org |

**Request**

```json
{
  "email": "bob@example.com",
  "role": "ENGINEER"
}
```

**Response** `201`

```json
{
  "message": "Member invited successfully",
  "member": { ... }
}
```

---

### `POST /api/organizations/:orgId/invite-code`

Generate a reusable invite code. **Auth required.** Owner/Admin only.

**Response** `200`

```json
{
  "success": true,
  "data": {
    "inviteCode": "abc123xyz"
  }
}
```

---

### `POST /api/organizations/join`

Join an organization using an invite code. **Auth required.**
Rate limited to 5 requests per 15 minutes.

| Field  | Type   | Required |
| ------ | ------ | -------- |
| `code` | string | Yes      |

**Request**

```json
{
  "code": "abc123xyz"
}
```

**Response** `200`

```json
{
  "success": true,
  "data": {
    "organization": { "id": "64f...", "name": "Acme Corp" }
  }
}
```

---

### `GET /api/organizations/:orgId/members`

List members of an organization. **Auth required.**
Supports `?page=1&limit=10` query parameters.

**Response** `200`

```json
{
  "members": [
    { "userId": "64f...", "name": "Jane Doe", "role": "OWNER" }
  ],
  "page": 1,
  "totalPages": 1,
  "total": 1
}
```

---

## Issues

All issue endpoints require `x-organization-id` header.

### `POST /api/issues`

Create a new issue. **Auth required.** Roles: `ENGINEER`, `MANAGER`.

| Field         | Type   | Required | Notes                               |
| ------------- | ------ | -------- | ----------------------------------- |
| `title`       | string | Yes      |                                     |
| `description` | string | No       |                                     |
| `priority`    | string | No       | `LOW`, `MEDIUM` (default), `HIGH`, `CRITICAL` |
| `assignedTo`  | string | No       | User ID to assign                   |

**Request**

```json
{
  "title": "Fix login timeout",
  "description": "Users report session expiring too quickly",
  "priority": "HIGH"
}
```

**Response** `201`

```json
{
  "success": true,
  "message": "Issue created successfully",
  "data": {
    "_id": "64f...",
    "title": "Fix login timeout",
    "status": "OPEN",
    "priority": "HIGH",
    "createdBy": "64f...",
    "organization": "64f..."
  }
}
```

---

### `GET /api/issues`

List issues with pagination. **Auth required.** Roles: `ENGINEER`, `MANAGER`, `AUDITOR`, `ADMIN`.
Supports `?page=1&limit=10` query parameters.

**Response** `200`

```json
{
  "issues": [ ... ],
  "page": 1,
  "totalPages": 5,
  "total": 47
}
```

---

### `PATCH /api/issues/:id/status`

Update issue status. **Auth required.** Roles: `ENGINEER`, `MANAGER`, `ADMIN`.

| Field    | Type   | Required | Notes                                    |
| -------- | ------ | -------- | ---------------------------------------- |
| `status` | string | Yes      | `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED` |

**Request**

```json
{
  "status": "IN_PROGRESS"
}
```

**Response** `200`

```json
{
  "success": true,
  "message": "Issue status updated successfully",
  "data": { ... }
}
```

---

### `PATCH /api/issues/:id/assign`

Assign an issue to a user. **Auth required.** Roles: `MANAGER`, `ADMIN`.

| Field        | Type   | Required |
| ------------ | ------ | -------- |
| `assigneeId` | string | Yes      |

**Request**

```json
{
  "assigneeId": "64f..."
}
```

**Response** `200`

```json
{
  "success": true,
  "message": "Issue assigned successfully",
  "data": { ... }
}
```

---

### `POST /api/issues/:id/request-assignment`

Request self-assignment to an issue. **Auth required.** Roles: `ENGINEER`.

No request body required.

**Response** `200`

```json
{
  "success": true,
  "message": "Assignment requested successfully"
}
```

---

### `DELETE /api/issues/:id`

Soft-delete an issue. **Auth required.** Roles: `MANAGER`, `ADMIN`.

**Response** `200`

```json
{
  "success": true,
  "message": "Issue deleted successfully"
}
```

---

## Contributions & Proofs

### `POST /api/issues/:issueId/contribute`

Request a contribution for an issue. **Auth required.**

**Response** `201`

```json
{
  "success": true,
  "message": "Contribution requested",
  "data": { ... }
}
```

---

### `POST /api/issues/:issueId/proofs`

Submit proof of work for an issue. **Auth required.**

**Response** `201`

```json
{
  "success": true,
  "data": { ... }
}
```

---

### `GET /api/contributions/stats/me`

Get contribution statistics for the authenticated user. **Auth required.**

**Response** `200`

```json
{
  "success": true,
  "data": {
    "total": 12,
    "accepted": 8,
    "pending": 3,
    "rejected": 1
  }
}
```

---

### `PATCH /api/proofs/:proofId/review`

Review a submitted proof. **Auth required.** Roles: `ADMIN`, `MANAGER`.

**Response** `200`

```json
{
  "success": true,
  "data": { ... }
}
```

---

## Audit Logs

### `GET /api/audit-logs`

Retrieve audit log entries. **Auth required.** Roles: `ADMIN`, `AUDITOR`.
Supports `?page=1&limit=10` query parameters.

**Response** `200`

```json
{
  "success": true,
  "data": [
    {
      "action": "ISSUE_CREATED",
      "performedBy": "64f...",
      "targetId": "64f...",
      "organization": "64f...",
      "timestamp": "2026-02-12T00:00:00.000Z"
    }
  ]
}
```

Possible `action` values:
`ISSUE_CREATED`, `ISSUE_STATUS_UPDATED`, `ISSUE_ASSIGNED`, `ISSUE_ASSIGNMENT_REQUESTED`, `ORGANIZATION_CREATED`, `ORG_MEMBER_INVITED`, `ORGANIZATION_INVITE_CODE_GENERATED`, `ORGANIZATION_JOINED_VIA_CODE`
