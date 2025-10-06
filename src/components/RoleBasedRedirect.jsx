import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Component to redirect admins from dashboard to admin/orders
export const DashboardRedirect = ({ children }) => {
  const { isAdmin } = useAuth();

  // If user is admin trying to access /dashboard, redirect to /admin/orders
  if (isAdmin()) {
    return <Navigate to="/admin/orders" replace />;
  }

  // If regular user, allow access to dashboard
  return children;
};

export default DashboardRedirect;

