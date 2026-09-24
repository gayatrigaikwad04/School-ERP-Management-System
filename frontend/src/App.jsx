import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';

// Auth Pages
import { Login } from './pages/auth/Login';

// Dashboard
import { Dashboard } from './pages/dashboard/Dashboard';

// Students Module
import { Students } from './pages/students/Students';
import { AddStudent } from './pages/students/AddStudent';
import { EditStudent } from './pages/students/EditStudent';
import { StudentDetails } from './pages/students/StudentDetails';

// Parents Module
import { Parents } from './pages/parents/Parents';

// Classes Module
import { Classes } from './pages/classes/Classes';

// Attendance Module
import { Attendance } from './pages/attendance/Attendance';
import { AttendanceHistory } from './pages/attendance/AttendanceHistory';

// Fees Module
import { FeeStructure } from './pages/fees/FeeStructure';
import { FeeCollection } from './pages/fees/FeeCollection';
import { PendingFees } from './pages/fees/PendingFees';

// Payments Module
import { PaymentHistory } from './pages/payments/PaymentHistory';

// Reports Module
import { Reports } from './pages/reports/Reports';

// Settings Module
import { Settings } from './pages/settings/Settings';

export const App = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected App Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route index element={<Dashboard />} />

        {/* Students */}
        <Route path="students" element={<Students />} />
        <Route path="students/new" element={<AddStudent />} />
        <Route path="students/:id" element={<StudentDetails />} />
        <Route path="students/:id/edit" element={<EditStudent />} />

        {/* Parents */}
        <Route path="parents" element={<Parents />} />

        {/* Classes */}
        <Route path="classes" element={<Classes />} />

        {/* Attendance */}
        <Route path="attendance" element={<Attendance />} />
        <Route path="attendance/history" element={<AttendanceHistory />} />

        {/* Fees */}
        <Route path="fees" element={<FeeStructure />} />
        <Route path="fees/collect" element={<FeeCollection />} />
        <Route path="fees/pending" element={<PendingFees />} />

        {/* Payments / Receipts */}
        <Route path="payments" element={<PaymentHistory />} />

        {/* Reports */}
        <Route path="reports" element={<Reports />} />

        {/* Settings */}
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
