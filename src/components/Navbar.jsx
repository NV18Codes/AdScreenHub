import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from '../styles/Navbar.module.css';

export default function Navbar() {
  const { user, isAuthenticated, loading, logout, refreshAuthState } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Ensure authentication state is properly loaded
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Try to restore auth state from localStorage
      refreshAuthState();
    }
  }, [loading, isAuthenticated, refreshAuthState]);

  // Debug logging
  useEffect(() => {
    console.log('Navbar auth state:', { user, isAuthenticated, loading });
  }, [user, isAuthenticated, loading]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const scrollToSection = (sectionId) => {
    closeMenu();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Close menu when location changes
  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo} onClick={closeMenu}>
          <img src="/logo-2.png" alt="AdScreenHub" className={styles.logoImage} />
        </Link>

        {/* Desktop Navigation */}
        <div className={`${styles.navLinks} ${isMenuOpen ? styles.active : ''}`}>
          <button onClick={() => scrollToSection('how-it-works')} className={styles.navLink}>How It Works?</button>
          <button onClick={() => scrollToSection('about')} className={styles.navLink}>About Us</button>
          <button onClick={() => scrollToSection('pricing')} className={styles.navLink}>Pricing</button>
          <button onClick={() => scrollToSection('blogs')} className={styles.navLink}>Blogs</button>
          
          {!loading && isAuthenticated && user ? (
            <div className={styles.authSection}>
              <div className={styles.userMenu}>
                <span className={styles.userName}>Hi, {user.fullName}</span>
                <div className={styles.dropdown}>
                  <Link to="/dashboard" className={styles.dropdownItem} onClick={closeMenu}>Dashboard</Link>
                  <Link to="/my-orders" className={styles.dropdownItem} onClick={closeMenu}>My Orders</Link>
                  <Link to="/profile" className={styles.dropdownItem} onClick={closeMenu}>Profile</Link>
                  <button onClick={handleLogout} className={styles.dropdownItem}>Logout</button>
                </div>
              </div>
            </div>
          ) : !loading ? (
            <div className={styles.authSection}>
              <Link to="/login" className={`${styles.btn} ${styles.btnSecondary}`} onClick={closeMenu}>
                Log In
              </Link>
              <Link to="/signup" className={`${styles.btn} ${styles.btnPrimary}`} onClick={closeMenu}>
                Sign Up
              </Link>
            </div>
          ) : (
            <div className={styles.authSection}>
              <span className={styles.loadingText}>Loading...</span>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className={styles.mobileMenuBtn} onClick={toggleMenu}>
          <span className={`${styles.hamburger} ${isMenuOpen ? styles.active : ''}`}></span>
        </button>
      </div>
    </nav>
  );
}
