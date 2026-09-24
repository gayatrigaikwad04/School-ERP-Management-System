<p align="center">
  <h1 align="center">🎓 SchoolERP — Admin Management Portal</h1>
  <p align="center">
    A comprehensive, production-ready School Enterprise Resource Planning system<br/>
    built with the <strong>MERN stack</strong> (MongoDB · Express · React · Node.js).
  </p>
</p>

---

## 📋 Overview

**SchoolERP** is a full-featured admin portal designed for school administrators to efficiently manage the daily operations of an educational institution. The system covers student management, class organization, attendance tracking, fee structures, payment processing, report generation, and more.

The project follows a **monorepo architecture** with cleanly separated frontend and backend sub-projects, each with their own dependency trees and development workflows.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      SchoolERP (Root)                       │
├─────────────────────────┬───────────────────────────────────┤
│       Frontend          │           Backend                 │
│   React + Vite + TS     │     Express + MongoDB             │
│   Port: 5173            │     Port: 5000                    │
│                         │                                   │
│  ┌───────────────┐      │     ┌───────────────┐             │
│  │   Components  │      │     │  Controllers  │             │
│  │   Pages       │◄─────┼────►│  Services     │             │
│  │   Services    │ API  │     │  Models       │             │
│  │   Context     │      │     │  Middleware    │             │
│  └───────────────┘      │     └───────┬───────┘             │
│                         │             │                     │
│                         │     ┌───────▼───────┐             │
│                         │     │   MongoDB     │             │
│                         │     └───────────────┘             │
├─────────────────────────┴───────────────────────────────────┤
│                        docs/                                │
│         API specs · Architecture · Database · Deployment    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Folder Structure

```text
SchoolERP/
│
├── frontend/                 # React + Vite frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page-level route components
│   │   ├── context/          # React Context providers (Auth, Toast)
│   │   ├── services/         # API service layer & mock data services
│   │   ├── routes/           # Route guards & route configuration
│   │   ├── mock/             # Mock data for development
│   │   ├── App.jsx           # Root application component
│   │   ├── main.tsx          # Application entry point
│   │   └── index.css         # Global styles (Tailwind)
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── README.md
│
├── backend/                  # Express.js REST API backend
│   ├── src/
│   │   ├── config/           # Database & app configuration
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/        # Auth, error handling, validation
│   │   ├── models/           # Mongoose schemas & models
│   │   ├── repositories/     # Data access layer
│   │   ├── routes/           # Express route definitions
│   │   ├── services/         # Business logic layer
│   │   ├── validators/       # Request validation schemas
│   │   ├── utils/            # Shared utilities
│   │   ├── constants/        # App-wide constants & enums
│   │   ├── docs/             # API documentation (Swagger/OpenAPI)
│   │   └── app.js            # Express app setup
│   ├── server.js             # Server bootstrap
│   ├── package.json
│   └── README.md
│
├── docs/                     # Project-wide documentation
│   ├── api/                  # API reference docs
│   ├── architecture/         # System design docs
│   ├── database/             # Schema & ERD docs
│   └── deployment/           # Deployment guides
│
├── phases.md                 # Development phases & milestones
├── memory.md                 # AI-assisted development context
├── rules.md                  # Project conventions & coding standards
├── decision.md               # Architecture decision records
├── log.md                    # Development changelog
├── README.md                 # ← You are here
└── .gitignore
```

---

## 🛠️ Tech Stack

| Layer        | Technology                                              |
| ------------ | ------------------------------------------------------- |
| **Frontend** | React 19, Vite 8, TypeScript, Tailwind CSS 4            |
| **UI/UX**    | Lucide Icons, Motion (Framer Motion), Google Fonts      |
| **Routing**  | React Router DOM v7                                     |
| **Backend**  | Node.js, Express 4                                      |
| **Database** | MongoDB with Mongoose ODM                               |
| **Auth**     | JWT (JSON Web Tokens), bcrypt                           |
| **Tooling**  | ESLint, Nodemon, Jest                                   |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x (or **bun** / **yarn**)
- **MongoDB** ≥ 6.x (local or Atlas)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/schoolerp.git
cd schoolerp
```

### 2. Setup Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The frontend will be available at **http://localhost:3000**.

### 3. Setup Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
npm run dev
```

The backend API will be available at **http://localhost:5000**.

---

## 📦 Available Scripts

### Frontend (`/frontend`)

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start Vite dev server (port 3000)    |
| `npm run build`   | Build production bundle              |
| `npm run preview` | Preview production build             |
| `npm run lint`    | Run TypeScript type-checking         |

### Backend (`/backend`)

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start with Nodemon (auto-reload)     |
| `npm start`       | Start production server              |
| `npm test`        | Run test suite with Jest             |
| `npm run lint`    | Lint source code with ESLint         |

---

## 🔐 Environment Variables

See the `.env.example` files in each sub-project for required variables:

- [`frontend/.env.example`](frontend/.env.example)
- [`backend/.env.example`](backend/.env.example)

---

## 🧩 Modules

| Module         | Description                                      |
| -------------- | ------------------------------------------------ |
| **Dashboard**  | Overview metrics, charts, and quick actions       |
| **Students**   | CRUD operations, profiles, enrollment             |
| **Parents**    | Parent/guardian management linked to students     |
| **Classes**    | Class/section creation and student assignments    |
| **Attendance** | Daily attendance marking and history tracking     |
| **Fees**       | Fee structure definition and collection           |
| **Payments**   | Payment processing and receipt generation         |
| **Reports**    | Analytics, exports, and data visualization        |
| **Settings**   | School configuration and admin preferences        |

---

## 🚢 Deployment

Refer to [`docs/deployment/`](docs/deployment/) for detailed deployment guides covering:

- Docker & Docker Compose setup
- CI/CD pipeline configuration
- Environment management
- MongoDB Atlas setup
- Production best practices

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **ISC License**.

---

<p align="center">
  Built with ❤️ for better school management
</p>
"# School-ERP-Management-System" 
