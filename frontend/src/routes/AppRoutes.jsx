import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Dashboard } from '../pages/Dashboard';
import { Tools } from '../pages/Tools';
import { Categories } from '../pages/Categories';
import { Customers } from '../pages/Customers';
import { Reservations } from '../pages/Reservations';
import { Transactions } from '../pages/Transactions';
import { Quotations } from '../pages/Quotations';
import { Expenses } from '../pages/Expenses';
import { Suppliers } from '../pages/Suppliers';
import { Reports } from '../pages/Reports';
import { Profile } from '../pages/Profile';
import { SupportSettings } from '../pages/SupportSettings';

// Case-Insensitive Protected Route Helper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && user && user.role) {
    const userRoleLower = user.role.toLowerCase();
    const allowedLower = allowedRoles.map(r => r.toLowerCase());
    if (!allowedLower.includes(userRoleLower)) {
      return <Navigate to="/" replace />;
    }
  }
  return children;
};

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tools"
        element={
          <ProtectedRoute>
            <Tools />
          </ProtectedRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <Categories />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute allowedRoles={['admin', 'manager', 'owner']}>
            <Customers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reservations"
        element={
          <ProtectedRoute>
            <Reservations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transactions"
        element={
          <ProtectedRoute allowedRoles={['admin', 'manager', 'owner']}>
            <Transactions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quotations"
        element={
          <ProtectedRoute>
            <Quotations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses"
        element={
          <ProtectedRoute allowedRoles={['admin', 'manager', 'owner']}>
            <Expenses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/suppliers"
        element={
          <ProtectedRoute allowedRoles={['admin', 'manager', 'owner']}>
            <Suppliers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={['admin', 'manager', 'owner']}>
            <Reports />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/support-settings"
        element={
          <ProtectedRoute allowedRoles={['admin', 'manager', 'owner']}>
            <SupportSettings />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
