# 📏 Rules — SchoolERP

This document defines the coding standards, conventions, and development rules for the SchoolERP project.

---

## General Principles

1. **Separation of Concerns** — Frontend and backend are fully independent projects. Never mix concerns.
2. **Convention Over Configuration** — Follow established patterns. Don't reinvent what's already decided.
3. **Explicit Over Implicit** — Name things clearly. Avoid abbreviations. Prefer readability over brevity.
4. **Fail Fast** — Validate inputs early. Return meaningful error messages.
5. **DRY (Don't Repeat Yourself)** — Extract shared logic into services, utilities, or middleware.

---

## Frontend Rules

### File Naming

- **Components:** PascalCase — `StudentCard.jsx`, `AppLayout.jsx`
- **Pages:** PascalCase — `Dashboard.jsx`, `AddStudent.jsx`
- **Services:** camelCase — `studentService.js`, `api.js`
- **Context:** PascalCase — `AuthContext.jsx`, `ToastContext.jsx`
- **Hooks:** camelCase with `use` prefix — `useAuth.js`, `useDebounce.js`
- **Utils:** camelCase — `formatDate.js`, `validators.js`

### Component Rules

- One component per file.
- Use named exports (not default exports) for all components.
- Keep components focused — if a component exceeds 200 lines, consider splitting.
- Colocate styles, tests, and types with their components when possible.

### State Management

- Use **React Context** for global state (auth, theme, toast).
- Use **local state** (`useState`) for component-specific state.
- Do **not** introduce Redux or Zustand unless explicitly decided (see `decision.md`).

### Routing

- All routes are defined in `App.jsx`.
- Protect authenticated routes using the `ProtectedRoute` wrapper.
- Use descriptive, RESTful URL patterns: `/students`, `/students/:id`, `/students/:id/edit`.

### API Integration

- All API calls go through service files in `src/services/`.
- Use the centralized Axios instance from `services/api.js`.
- Never call `fetch()` or `axios` directly from components.

---

## Backend Rules

### File Naming

- **Models:** PascalCase, singular — `Student.js`, `Payment.js`
- **Controllers:** camelCase with `.controller` suffix — `student.controller.js`
- **Routes:** camelCase with `.routes` suffix — `student.routes.js`
- **Services:** camelCase with `.service` suffix — `student.service.js`
- **Middleware:** camelCase — `auth.js`, `errorHandler.js`
- **Validators:** camelCase with `.validator` suffix — `student.validator.js`

### Architecture (Layered)

```
Request → Route → Validator → Controller → Service → Repository → Database
```

- **Routes:** Define endpoints and attach middleware.
- **Validators:** Validate and sanitize request data (express-validator).
- **Controllers:** Handle HTTP request/response. No business logic.
- **Services:** Business logic and orchestration.
- **Repositories:** Database queries (Mongoose operations).
- **Models:** Mongoose schema definitions.

### API Conventions

- Base path: `/api`
- Use RESTful verbs: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`
- Plural resource names: `/api/students`, `/api/classes`
- Use HTTP status codes correctly (200, 201, 400, 401, 403, 404, 500)

### Response Format

```json
// Success
{
  "success": true,
  "message": "Students fetched successfully",
  "data": { ... },
  "meta": { "page": 1, "total": 100 }
}

// Error
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Email is required" }
  ]
}
```

### Error Handling

- Use a centralized error handler middleware.
- Never expose stack traces in production.
- Create custom error classes for `AppError`, `NotFoundError`, `ValidationError`.

### Authentication

- Use JWT Bearer tokens in the `Authorization` header.
- Store tokens securely (HttpOnly cookies preferred for production).
- Implement token refresh for long-lived sessions.

---

## Git Conventions

### Branch Naming

```
feature/module-name          — New features
fix/bug-description          — Bug fixes
refactor/what-changed        — Code refactoring
docs/what-documented         — Documentation only
```

### Commit Messages

Follow **Conventional Commits**:

```
feat: add student enrollment API
fix: correct fee calculation for partial payments
docs: update API reference for attendance routes
refactor: extract common validation middleware
chore: update dependencies
```

---

## Code Quality

- No `console.log` in production code (use a proper logger).
- No `any` type in TypeScript (use specific types or `unknown`).
- No hardcoded values — use constants or environment variables.
- All environment variables must have entries in `.env.example`.

---

*These rules apply to all contributors. Update this document through the decision process (see `decision.md`).*
