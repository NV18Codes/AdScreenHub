import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Component to protect auth routes (login/signup) from authenticated users
export const AuthRouteGuard = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  // If user is authenticated and trying to access auth pages, redirect based on role
  if (isAuthenticated()) {
    // Admin users go to admin orders, regular users go to dashboard
    return <Navigate to={isAdmin() ? "/admin/orders" : "/dashboard"} replace />;
  }

  // If not authenticated, allow access to auth pages
  return children;
};

// Component to protect dashboard routes from unauthenticated users
export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  // If user is not authenticated and trying to access protected pages, redirect to login
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If route is admin-only and user is not admin, redirect to dashboard
  if (adminOnly && !isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user is customer trying to access admin route, redirect to dashboard
  if (location.pathname.startsWith('/admin') && !isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  // If authenticated (and admin if required), allow access to protected pages
  return children;
};

export default { AuthRouteGuard, ProtectedRoute };
