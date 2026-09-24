# 🎨 SchoolERP — Frontend

The **frontend** of SchoolERP is a single-page application built with **React 19**, **Vite 8**, **TypeScript**, and **Tailwind CSS 4**. It provides the complete admin interface for managing school operations.

---

## 🏗️ Architecture

```
src/
├── components/           # Reusable UI components
│   ├── common/           # Shared components (buttons, inputs, modals, tables)
│   └── layout/           # Application layout (sidebar, header, AppLayout)
│
├── pages/                # Page-level components (one folder per module)
│   ├── auth/             # Login page
│   ├── dashboard/        # Admin dashboard
│   ├── students/         # Student list, add, edit, details
│   ├── parents/          # Parent management
│   ├── classes/          # Class management
│   ├── attendance/       # Attendance marking & history
│   ├── fees/             # Fee structure, collection, pending
│   ├── payments/         # Payment history & receipts
│   ├── reports/          # Analytics & data exports
│   └── settings/         # School configuration
│
├── context/              # React Context providers
│   ├── AuthContext.jsx   # Authentication state & methods
│   └── ToastContext.jsx  # Toast notification system
│
├── services/             # API service layer
│   ├── api.js            # Centralized Axios instance
│   ├── authService.js    # Authentication API calls
│   ├── studentService.js # Student CRUD operations
│   ├── classService.js   # Class management operations
│   ├── attendanceService.js
│   ├── feeService.js
│   ├── paymentService.js
│   ├── parentService.js
│   ├── reportService.js
│   ├── settingsService.js
│   └── mockStorage.js    # localStorage-based mock persistence
│
├── routes/               # Routing utilities
│   └── ProtectedRoute.jsx # Auth guard component
│
├── mock/                 # Mock data for development
│   └── mockData.js       # Seed data for all modules
│
├── App.jsx               # Root component with route definitions
├── main.tsx              # Application entry point
└── index.css             # Global styles (Tailwind directives)
```

---

## 📁 Folder Responsibilities

| Folder         | Responsibility                                                     |
| -------------- | ------------------------------------------------------------------ |
| `components/`  | Pure, reusable UI building blocks. No business logic.              |
| `pages/`       | Route-level containers. Compose components and call services.      |
| `context/`     | Global state providers. Thin — only auth and notifications.        |
| `services/`    | Data access layer. All API calls originate here.                   |
| `routes/`      | Route guards and configuration.                                    |
| `mock/`        | Development-only seed data. Will be removed after API integration. |

---

## 🔄 State Management Strategy

### Global State (React Context)

| Context          | Purpose                             | Scope       |
| ---------------- | ----------------------------------- | ----------- |
| `AuthContext`    | User session, login/logout, token    | App-wide    |
| `ToastContext`   | Success/error notifications          | App-wide    |

### Local State

- **Component state** (`useState`) for forms, toggles, filters.
- **URL state** (React Router params/search) for pagination, tabs, selected items.

### Data Fetching

- Currently: **Mock services** with simulated latency.
- Future: **Axios** calls to the backend REST API via the service layer.

> **Key Design:** The service layer provides the same interface regardless of whether data comes from mocks or a real API. When the backend is ready, only the internal implementation of each service file changes — components remain untouched.

---

## 🔌 API Service Layer Rules

1. **All HTTP requests** must go through service files in `src/services/`.
2. **Never import Axios directly** in components or pages.
3. **Use the shared Axios instance** from `services/api.js` for consistent base URL and interceptors.
4. **Service functions** should return clean data — handle response unwrapping internally.
5. **Error handling** should be done at the service level and re-thrown as meaningful errors.

### Example Pattern

```javascript
// services/studentService.js
import api from './api';

export const getStudents = async (params) => {
  const response = await api.get('/students', { params });
  return response.data;
};

export const getStudentById = async (id) => {
  const response = await api.get(`/students/${id}`);
  return response.data;
};
```

---

## 🗺️ Route Structure

| Path                    | Component          | Auth Required |
| ----------------------- | ------------------ | ------------- |
| `/login`                | Login              | No            |
| `/`                     | Dashboard          | Yes           |
| `/students`             | Students (list)    | Yes           |
| `/students/new`         | AddStudent         | Yes           |
| `/students/:id`         | StudentDetails     | Yes           |
| `/students/:id/edit`    | EditStudent        | Yes           |
| `/parents`              | Parents            | Yes           |
| `/classes`              | Classes            | Yes           |
| `/attendance`           | Attendance         | Yes           |
| `/attendance/history`   | AttendanceHistory  | Yes           |
| `/fees`                 | FeeStructure       | Yes           |
| `/fees/collect`         | FeeCollection      | Yes           |
| `/fees/pending`         | PendingFees        | Yes           |
| `/payments`             | PaymentHistory     | Yes           |
| `/reports`              | Reports            | Yes           |
| `/settings`             | Settings           | Yes           |
| `*`                     | Redirect to `/`    | —             |

All authenticated routes are wrapped with `<ProtectedRoute>` inside `<AppLayout>`.

---

## 🔐 Environment Variables

| Variable         | Description                  | Default                        |
| ---------------- | ---------------------------- | ------------------------------ |
| `VITE_API_URL`   | Backend API base URL         | `http://localhost:5000/api`    |

> All frontend env variables **must** be prefixed with `VITE_` to be exposed to the client bundle by Vite.

---

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Start development server (port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type-check with TypeScript
npm run lint
```

---

## 📦 Key Dependencies

| Package              | Purpose                              |
| -------------------- | ------------------------------------ |
| `react` 19           | UI library                           |
| `react-router-dom` 7 | Client-side routing                  |
| `axios`              | HTTP client                          |
| `tailwindcss` 4      | Utility-first CSS framework          |
| `lucide-react`       | Icon library                         |
| `motion`             | Animation library (Framer Motion)    |
| `vite` 8             | Build tool and dev server            |

---

*Do not modify this README without updating `memory.md` accordingly.*
