
# TeamNexus: Multi-Tenant SaaS Platform

A production-ready team productivity platform built with high scalability, multi-tenancy isolation, and secure access controls.

## 🚀 Architecture Overview

- **Multi-Tenancy**: Data isolation at the DB level using `tenantId` columns on all entities. Prisma middleware enforces tenant filtering on all queries to prevent cross-tenant leaks.
- **Authentication**: JWT-based stateless authentication with secure HTTP-only cookies (simulated in demo).
- **Role-Based Access (RBAC)**: Fine-grained permissions for `ADMIN`, `MANAGER`, and `MEMBER` roles.
- **Audit Logging**: Automated tracking of all mutations (create/update/delete) for security and accountability.
- **State Management**: Optimized UI updates with optimistic UI patterns and React Query (simulated with standard React hooks).

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Recharts.
- **Backend (Proposed)**: Node.js, Express, PostgreSQL, Prisma, Redis.
- **Infrastructure**: Dockerized services, JWT for Auth, JSON-based logging.

## 🔑 Key Features

1. **Dashboard**: Real-time KPI tracking and visual analytics.
2. **Task Board**: Kanban-style management with priority and status controls.
3. **Team Insights**: Organization-wide view of members and functional units.
4. **Security**: Multi-tenant enforcement middleware, password hashing, and role protection.

## 💻 Environment Variables

```bash
# Server
PORT=4000
DATABASE_URL=postgresql://user:pass@localhost:5432/nexus
JWT_SECRET=super_secret_key
REDIS_URL=redis://localhost:6379

# Client
VITE_API_URL=http://localhost:4000
```

## 🏃 Setup

1. **Prerequisites**: Node.js 18+, PostgreSQL.
2. **Install**: `npm install`
3. **DB Setup**: `npx prisma migrate dev`
4. **Start**: `npm run dev`

---
*Developed for excellence by a Staff Software Engineer.*
