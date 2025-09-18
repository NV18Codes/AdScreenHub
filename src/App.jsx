import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MyOrders from './pages/MyOrders';
import Checkout from './pages/Checkout';
import FAQ from './pages/FAQ';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Contact from './pages/Contact';
import Auth from './pages/Auth';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import EmailRedirect from './pages/EmailRedirect';
import ScrollToTop from './components/ScrollToTop';
import ScrollToTopButton from './components/ScrollToTopButton';
import { AuthRouteGuard, ProtectedRoute } from './components/AuthGuard';

// Path normalizer to fix double slashes
const PathNormalizer = () => {
  const location = useLocation();

  useEffect(() => {
    const normalized = location.pathname.replace(/\/{2,}/g, '/');
    if (normalized !== location.pathname) {
      window.history.replaceState({}, '', normalized + location.search);
    }
  }, [location]);

  return null;
};

// Protected Route removed - authentication system removed

// Layout
const Layout = ({ children, showFooter = true }) => (
  <>
    <Navbar />
    <main>{children}</main>
    {showFooter && <Footer />}
  </>
);

// App Initializer removed - authentication system removed

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <ScrollToTopButton />
        <PathNormalizer />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout><Home /></Layout>} />
                  <Route path="/faq" element={<Layout><FAQ /></Layout>} />
                  <Route path="/terms" element={<Layout><Terms /></Layout>} />
                  <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
                  <Route path="/contact" element={<Layout><Contact /></Layout>} />
          
          {/* Authentication - Protected from authenticated users */}
          <Route path="/auth" element={<AuthRouteGuard><Layout showFooter={false}><Auth /></Layout></AuthRouteGuard>} />
          <Route path="/login" element={<AuthRouteGuard><Layout showFooter={false}><Login /></Layout></AuthRouteGuard>} />
          <Route path="/signup" element={<AuthRouteGuard><Layout showFooter={false}><Auth /></Layout></AuthRouteGuard>} />
          <Route path="/forgot-password" element={<AuthRouteGuard><Layout showFooter={false}><ForgotPassword /></Layout></AuthRouteGuard>} />
          <Route path="/reset-password" element={<AuthRouteGuard><Layout showFooter={false}><ResetPassword /></Layout></AuthRouteGuard>} />
          <Route path="/verify-email" element={<EmailRedirect />} />
          
          {/* Dashboard Routes - Protected from unauthenticated users */}
          <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
          <Route path="/my-orders" element={<ProtectedRoute><Layout><MyOrders /></Layout></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Layout><Checkout /></Layout></ProtectedRoute>} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
