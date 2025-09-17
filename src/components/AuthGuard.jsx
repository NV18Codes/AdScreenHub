import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Component to protect auth routes (login/signup) from authenticated users
export const AuthRouteGuard = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (isAuthenticated()) {
    console.log('🔒 AuthRouteGuard: Authenticated user trying to access auth page, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, allow access to auth pages
  return children;
};

// Component to protect dashboard routes from unauthenticated users
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // If user is not authenticated and trying to access protected pages, redirect to login
  if (!isAuthenticated()) {
    console.log('🔒 ProtectedRoute: Unauthenticated user trying to access protected page, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, allow access to protected pages
  return children;
};

export default { AuthRouteGuard, ProtectedRoute };
