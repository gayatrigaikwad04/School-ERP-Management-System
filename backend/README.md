# ⚙️ SchoolERP — Backend

The **backend** of SchoolERP is a RESTful API built with **Express.js**, **MongoDB** (via Mongoose), and **JWT authentication**. It follows a layered architecture pattern for clean separation of concerns.

> **Current Status:** Scaffolded — folder structure and Express app are ready. No business logic or API endpoints have been implemented yet.

---

## 🏗️ Architecture

```
backend/
├── src/
│   ├── config/           # App & database configuration
│   │   └── database.js   # MongoDB connection setup
│   │
│   ├── controllers/      # HTTP request handlers
│   │   └── (e.g., student.controller.js)
│   │
│   ├── middleware/        # Express middleware
│   │   └── (e.g., auth.js, errorHandler.js, validate.js)
│   │
│   ├── models/            # Mongoose schemas & models
│   │   └── (e.g., Student.js, User.js)
│   │
│   ├── repositories/      # Data access layer (DB queries)
│   │   └── (e.g., student.repository.js)
│   │
│   ├── routes/            # Express route definitions
│   │   └── (e.g., student.routes.js)
│   │
│   ├── services/          # Business logic layer
│   │   └── (e.g., student.service.js)
│   │
│   ├── validators/        # Request validation schemas
│   │   └── (e.g., student.validator.js)
│   │
│   ├── utils/             # Shared utilities
│   │   └── (e.g., ApiError.js, asyncHandler.js)
│   │
│   ├── constants/         # App-wide constants & enums
│   │   └── (e.g., roles.js, statusCodes.js)
│   │
│   ├── docs/              # API documentation files
│   │   └── (e.g., swagger.yaml)
│   │
│   └── app.js             # Express application setup
│
├── server.js              # Server bootstrap & DB connection
├── package.json
├── .env.example
├── .gitignore
└── README.md              # ← You are here
```

---

## 📁 Folder Responsibilities

| Folder           | Responsibility                                                       |
| ---------------- | -------------------------------------------------------------------- |
| `config/`        | Database connection, app-level config objects, environment loading    |
| `controllers/`   | Parse HTTP requests, call services, send HTTP responses               |
| `middleware/`    | Authentication, error handling, request validation, rate limiting      |
| `models/`        | Mongoose schema definitions and model exports                         |
| `repositories/`  | Direct database operations (CRUD queries). Only layer that talks to DB |
| `routes/`        | Route definitions, middleware chaining, parameter validation          |
| `services/`      | Business logic, orchestration, data transformation                    |
| `validators/`    | Input validation rules using `express-validator`                      |
| `utils/`         | Reusable helpers: custom errors, async wrappers, formatters           |
| `constants/`     | Enums, status codes, role definitions, magic strings                  |
| `docs/`          | OpenAPI/Swagger specifications                                        |

---

## 🔄 Request Lifecycle

Every incoming HTTP request flows through the following layers:

```
Client Request
     │
     ▼
┌─────────┐
│  Route   │  ── Matches URL pattern, attaches middleware
└────┬─────┘
     │
     ▼
┌──────────┐
│ Validator │  ── Validates & sanitizes request body/params/query
└────┬──────┘
     │
     ▼
┌────────────┐
│ Middleware  │  ── Auth check (JWT), rate limiting, logging
└────┬───────┘
     │
     ▼
┌────────────┐
│ Controller │  ── Extracts data from req, calls service, sends res
└────┬───────┘
     │
     ▼
┌──────────┐
│ Service  │  ── Business rules, orchestration, data transformation
└────┬─────┘
     │
     ▼
┌──────────────┐
│ Repository   │  ── Mongoose queries (find, create, update, delete)
└────┬─────────┘
     │
     ▼
┌──────────┐
│ MongoDB  │  ── Persistent storage
└──────────┘
```

### Key Rules

- **Controllers** never access the database directly.
- **Services** never access `req` or `res` objects.
- **Repositories** are the only layer that imports Mongoose models.
- **Validators** run before controllers and short-circuit on invalid input.

---

## 🛡️ Middleware Flow

Middleware is applied in this order:

```
helmet() → cors() → morgan() → json() → urlencoded() → routes → notFound → errorHandler
```

| Middleware       | Purpose                                           |
| ---------------- | ------------------------------------------------- |
| `helmet`         | Security headers (XSS, CSP, etc.)                 |
| `cors`           | Cross-origin request handling                      |
| `morgan`         | HTTP request logging                               |
| `express.json`   | Parse JSON request bodies                          |
| `auth`           | Verify JWT token and attach user to `req.user`     |
| `validate`       | Run express-validator chains and return errors     |
| `notFound`       | 404 handler for unmatched routes                   |
| `errorHandler`   | Centralized error formatting and response          |

---

## 🔐 JWT Authentication Flow

```
┌──────────────────────────────────────────────────┐
│                  LOGIN FLOW                       │
│                                                   │
│  1. POST /api/auth/login { email, password }      │
│  2. Validate credentials against DB               │
│  3. Compare password hash (bcrypt)                │
│  4. Generate JWT with user ID & role              │
│  5. Return token + user profile                   │
│                                                   │
├──────────────────────────────────────────────────┤
│              AUTHENTICATED REQUEST                │
│                                                   │
│  1. Client sends: Authorization: Bearer <token>   │
│  2. Auth middleware extracts & verifies token      │
│  3. Attaches decoded user to req.user             │
│  4. Request proceeds to controller                │
│                                                   │
├──────────────────────────────────────────────────┤
│              TOKEN STRUCTURE                      │
│                                                   │
│  Payload: { id, email, role, iat, exp }           │
│  Expiry: Configurable via JWT_EXPIRES_IN          │
│  Algorithm: HS256                                 │
└──────────────────────────────────────────────────┘
```

### Auth Middleware (Planned)

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

module.exports = { protect };
```

---

## ❌ Error Handling Strategy

### Custom Error Class

```javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}
```

### Centralized Error Handler

All errors flow through a single middleware that formats responses consistently:

```javascript
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
```

### Error Types

| Error             | Status | When Used                          |
| ----------------- | ------ | ---------------------------------- |
| `ValidationError` | 400    | Invalid request data               |
| `UnauthorizedError` | 401  | Missing or invalid token           |
| `ForbiddenError`  | 403    | Insufficient permissions           |
| `NotFoundError`   | 404    | Resource doesn't exist             |
| `ConflictError`   | 409    | Duplicate entry (e.g., email)      |
| `ServerError`     | 500    | Unexpected internal errors         |

---

## 🔐 Environment Variables

| Variable              | Required | Description                        | Default                     |
| --------------------- | -------- | ---------------------------------- | --------------------------- |
| `PORT`                | No       | Server port                        | `5000`                      |
| `MONGODB_URI`         | Yes      | MongoDB connection string          | —                           |
| `JWT_SECRET`          | Yes      | Secret key for signing JWTs        | —                           |
| `JWT_EXPIRES_IN`      | No       | Token expiration duration          | `7d`                        |
| `CLIENT_URL`          | No       | Frontend URL (for CORS)            | `http://localhost:5173`     |
| `NODE_ENV`            | No       | Environment mode                   | `development`               |
| `BCRYPT_SALT_ROUNDS`  | No       | bcrypt hashing rounds              | `10`                        |
| `LOG_LEVEL`           | No       | Logging verbosity                  | `debug`                     |

---

## 📐 API Conventions

### URL Patterns

```
GET    /api/students          → List all students (with pagination)
GET    /api/students/:id      → Get student by ID
POST   /api/students          → Create a new student
PUT    /api/students/:id      → Full update of a student
PATCH  /api/students/:id      → Partial update of a student
DELETE /api/students/:id      → Delete a student
```

### Standard Response Format

```json
// Success (single resource)
{
  "success": true,
  "message": "Student fetched successfully",
  "data": { "id": "...", "name": "..." }
}

// Success (list with pagination)
{
  "success": true,
  "message": "Students fetched successfully",
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}

// Error
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Valid email is required" }
  ]
}
```

### Pagination Query Parameters

```
GET /api/students?page=1&limit=20&sort=-createdAt&search=john
```

| Parameter | Type   | Default      | Description                  |
| --------- | ------ | ------------ | ---------------------------- |
| `page`    | Number | `1`          | Page number                  |
| `limit`   | Number | `20`         | Items per page               |
| `sort`    | String | `-createdAt` | Sort field (prefix `-` desc) |
| `search`  | String | —            | Text search query            |

---

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Start with auto-reload (nodemon)
npm run dev

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint
```

---

## 📦 Key Dependencies

| Package              | Purpose                                |
| -------------------- | -------------------------------------- |
| `express` 4          | Web framework                          |
| `mongoose` 8         | MongoDB ODM                            |
| `jsonwebtoken`       | JWT signing and verification           |
| `bcryptjs`           | Password hashing                       |
| `cors`               | Cross-origin resource sharing          |
| `helmet`             | Security headers                       |
| `morgan`             | HTTP request logging                   |
| `express-validator`  | Request validation middleware          |
| `dotenv`             | Environment variable loading           |
| `nodemon` (dev)      | Auto-restart on file changes           |
| `jest` (dev)         | Testing framework                      |

---

*Do not implement APIs without first defining the corresponding Mongoose model and validator.*
