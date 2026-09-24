# 🧠 Memory — SchoolERP

This file serves as persistent context for AI-assisted development sessions. It captures key decisions, the current state of the project, and important details that should be recalled across sessions.

---

## Project Identity

| Key              | Value                                            |
| ---------------- | ------------------------------------------------ |
| **Project Name** | SchoolERP — Admin Management Portal              |
| **Stack**        | MERN (MongoDB, Express, React, Node.js)          |
| **Frontend**     | React 19 + Vite 8 + Tailwind CSS 4 + TypeScript  |
| **Backend**      | Express 4 + Mongoose + JWT                       |
| **Architecture** | Monorepo with independent frontend/backend       |

---

## Current State

### Frontend — ✅ Complete

The frontend is fully built and functional with the following modules:

- **Authentication** — Login page with protected routes
- **Dashboard** — Admin overview with key metrics
- **Students** — Full CRUD (list, add, edit, details)
- **Parents** — Parent management
- **Classes** — Class/section management
- **Attendance** — Attendance marking and history
- **Fees** — Fee structure, collection, and pending fees
- **Payments** — Payment history and receipts
- **Reports** — Analytics and data exports
- **Settings** — School configuration

**State Management:** React Context API (AuthContext, ToastContext)  
**Routing:** React Router DOM v7 with protected routes  
**Data Layer:** Mock services using localStorage (ready to swap for API calls)

### Backend — 🔲 Scaffolded (No APIs Yet)

- Express app configured with CORS, Helmet, Morgan
- Health check endpoint at `/api/health`
- Folder structure ready for development
- No database connection or business logic implemented

---

## Key Files to Remember

| File                          | Purpose                               |
| ----------------------------- | ------------------------------------- |
| `frontend/src/App.jsx`        | All route definitions                 |
| `frontend/src/main.tsx`       | App entry point with providers        |
| `frontend/src/context/`       | AuthContext, ToastContext              |
| `frontend/src/services/`      | API service layer (currently mock)    |
| `frontend/src/services/api.js`| Axios instance (base URL config)      |
| `backend/src/app.js`          | Express app configuration             |
| `backend/server.js`           | Server bootstrap                      |

---

## Important Patterns

1. **All frontend imports are relative** — no `@/` alias used in source files.
2. **The `@` path alias** in `vite.config.ts` and `tsconfig.json` resolves to the frontend root (`.`), but source code uses `./` relative imports.
3. **Mock services** simulate API delays and use `localStorage` for persistence — designed to be drop-in replaced with Axios calls.
4. **ProtectedRoute** component checks `AuthContext` and redirects unauthenticated users to `/login`.

---

## Constraints

- Do **not** modify frontend UI, components, or routing.
- Backend must be **fully independent** from the frontend.
- Frontend and backend have **separate** `package.json` files.
- API responses must be designed to match the data shapes already used in the frontend mock services.

---

## Next Actions

1. Set up MongoDB connection in `backend/src/config/database.js`.
2. Create Mongoose models matching the frontend's data shapes.
3. Implement JWT authentication endpoints.
4. Build CRUD APIs for each module.
5. Replace frontend mock services with real API calls.

---

*Last updated: September 24, 2026*
