# 📝 Architecture Decision Records — SchoolERP

This document records significant architectural and technical decisions made during the development of SchoolERP.

---

## ADR-001: Monorepo with Separate Sub-Projects

**Date:** September 24, 2026  
**Status:** Accepted  
**Deciders:** Project Lead

### Context

The project began as a single React frontend. As we plan to add a backend, we need to decide on the project structure.

### Options Considered

1. **Monorepo with shared root** — `frontend/` and `backend/` inside one repository.
2. **Separate repositories** — Independent repos for frontend and backend.
3. **Single project with server-side rendering** — Next.js or similar.

### Decision

**Option 1: Monorepo with separate sub-projects.**

### Rationale

- Simpler version control and code reviews.
- Shared documentation and development scripts.
- Each sub-project has its own `package.json` — no dependency conflicts.
- Easy to set up Docker Compose for local development.
- Still allows independent deployment if needed.

---

## ADR-002: React Context for State Management

**Date:** September 24, 2026  
**Status:** Accepted  
**Deciders:** Project Lead

### Context

We need a state management solution for the frontend.

### Options Considered

1. **React Context API** — Built-in, no additional dependencies.
2. **Redux Toolkit** — Industry standard, powerful middleware.
3. **Zustand** — Lightweight, minimal boilerplate.

### Decision

**React Context API** for global state (Auth, Toast/Notifications).

### Rationale

- The application has moderate global state needs (auth token, user info, toast messages).
- Context API avoids additional dependencies and complexity.
- If state management needs grow significantly, we can migrate to Zustand with minimal refactoring.

---

## ADR-003: Layered Backend Architecture

**Date:** September 24, 2026  
**Status:** Accepted  
**Deciders:** Project Lead

### Context

We need to define the backend code organization pattern.

### Options Considered

1. **Flat structure** — Controllers directly accessing the database.
2. **Layered architecture** — Route → Controller → Service → Repository → Model.
3. **Hexagonal architecture** — Ports and adapters pattern.

### Decision

**Layered architecture** with Controller → Service → Repository separation.

### Rationale

- Clear separation of HTTP handling, business logic, and data access.
- Services are testable without HTTP concerns.
- Repositories can be swapped (e.g., from MongoDB to PostgreSQL) without touching services.
- Not over-engineered for the project's current scale.

---

## ADR-004: JWT for Authentication

**Date:** September 24, 2026  
**Status:** Accepted  
**Deciders:** Project Lead

### Context

We need an authentication strategy for the API.

### Options Considered

1. **Session-based auth** — Server-side sessions with cookies.
2. **JWT (JSON Web Tokens)** — Stateless token-based auth.
3. **OAuth 2.0 / Third-party** — Google, Microsoft SSO.

### Decision

**JWT authentication** with access tokens and optional refresh tokens.

### Rationale

- Stateless — scales horizontally without shared session storage.
- Works well with SPA frontends (React).
- Easy to implement with `jsonwebtoken` and `bcryptjs`.
- OAuth can be added later as an enhancement, not a replacement.

---

## ADR-005: Mock Services for Frontend Development

**Date:** September 24, 2026  
**Status:** Accepted  
**Deciders:** Project Lead

### Context

The frontend was built before the backend. We need a way to develop and demonstrate the UI without a live API.

### Decision

Frontend services use **mock data with simulated delays** stored in `localStorage`.

### Rationale

- The frontend can be developed and demonstrated independently.
- Mock services mirror the eventual API interface, making the swap seamless.
- `localStorage` persistence means data survives page refreshes during development.
- When the backend is ready, only the service layer files need updating.

---

## Template for New Decisions

```markdown
## ADR-XXX: Title

**Date:** YYYY-MM-DD  
**Status:** Proposed | Accepted | Deprecated | Superseded  
**Deciders:** Name(s)

### Context
What is the issue or question?

### Options Considered
1. Option A
2. Option B
3. Option C

### Decision
What was decided.

### Rationale
Why this option was chosen.

### Consequences
What trade-offs or follow-up actions does this create?
```

---

*Add new ADRs sequentially. Never delete old ones — mark them as Deprecated or Superseded instead.*
