import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MyOrders from './pages/MyOrders';
import Checkout from './pages/Checkout';
import FAQ from './pages/FAQ';
import Terms from './pages/Terms';
import EmailVerification from './pages/EmailVerification';
import EmailVerificationSuccess from './pages/EmailVerificationSuccess';
import CompleteProfile from './pages/CompleteProfile';
import ScrollToTop from './components/ScrollToTop';
import { useAuth } from './hooks/useAuth';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Layout Component (conditional footer)
const Layout = ({ children, showFooter = true }) => {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      {showFooter && <Footer />}
    </>
  );
};

// App Initializer Component
const AppInitializer = () => {
  const { refreshAuthState } = useAuth();
  
  React.useEffect(() => {
    refreshAuthState();
  }, [refreshAuthState]);
  
  return null;
};

function App() {
  return (
    <Router>
      <AppInitializer />
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/faq" element={<Layout><FAQ /></Layout>} />
        <Route path="/terms" element={<Layout><Terms /></Layout>} />
        <Route path="/email-verification" element={<Layout showFooter={false}><EmailVerification /></Layout>} />
        <Route path="/email-verification-success" element={<Layout showFooter={false}><EmailVerificationSuccess /></Layout>} />
        <Route path="/complete-profile" element={<Layout showFooter={false}><CompleteProfile /></Layout>} />
        
        {/* Backend Email Verification Routes */}
        <Route path="/verify-email" element={<Layout showFooter={false}><EmailVerification /></Layout>} />
        <Route path="/email-verification" element={<Layout showFooter={false}><EmailVerification /></Layout>} />
        
        {/* Redirect handler for 3002 port issues */}
        <Route path="/redirect-3002-to-3000" element={
          <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '40px',
              borderRadius: '20px',
              backdropFilter: 'blur(10px)'
            }}>
              <h2>Redirecting to correct port...</h2>
              <p>Please wait while we redirect you to the correct address.</p>
              <p>If you're not redirected automatically, <a href="/email-verification" style={{color: 'white', textDecoration: 'underline'}}>click here</a>.</p>
            </div>
          </div>
        } />
        
        {/* Auth Routes (no footer) */}
        <Route path="/login" element={<Layout showFooter={false}><Login /></Layout>} />
        <Route path="/signup" element={<Layout showFooter={false}><Signup /></Layout>} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
        <Route path="/my-orders" element={<ProtectedRoute><Layout><MyOrders /></Layout></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Layout><Checkout /></Layout></ProtectedRoute>} />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
