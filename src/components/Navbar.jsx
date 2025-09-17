import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserDisplayName, getUserEmail } from '../utils/userUtils';
import styles from '../styles/Navbar.module.css';

export default function Navbar() {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Debug: Log user object to see available fields
  console.log('🔍 Navbar Debug:');
  console.log('📋 User object:', user);
  console.log('📋 User available fields:', user ? Object.keys(user) : 'No user data');
  console.log('📋 Is authenticated:', isAuthenticated());
  
  // Get display name using utility function
  const displayName = getUserDisplayName(user);
  const userEmail = getUserEmail(user);
  
  console.log('📋 Display name:', displayName);
  console.log('📋 User email:', userEmail);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Close menu when location changes
  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  const scrollToSection = (sectionId) => {
    closeMenu();
    
    // If we're not on the home page, navigate to home first
    if (location.pathname !== '/') {
      window.location.href = `/#${sectionId}`;
      return;
    }
    
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo} onClick={closeMenu}>
          <img src="/logo-2.png" alt="AdScreenHub Logo" className={styles.logoImage} />
        </Link>

        {/* Desktop Navigation */}
        <div className={`${styles.navLinks} ${isMenuOpen ? styles.active : ''}`}>
          {isAuthenticated() ? (
            <>
              {/* Authenticated Navigation */}
              <Link to="/dashboard" className={styles.navLink} onClick={closeMenu}>Dashboard</Link>
              <Link to="/my-orders" className={styles.navLink} onClick={closeMenu}>My Orders</Link>
              <Link to="/profile" className={styles.navLink} onClick={closeMenu}>Profile</Link>
              
              <div className={styles.authSection}>
                <span className={styles.userName}>Welcome, {displayName}</span>
                <button 
                  onClick={() => {
                    logout();
                    closeMenu();
                    window.location.href = '/';
                  }} 
                  className={`${styles.btn} ${styles.btnPrimary}`}
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Public Navigation */}
              <button onClick={() => scrollToSection('how-it-works')} className={styles.navLink}>How It Works?</button>
              <button onClick={() => scrollToSection('about')} className={styles.navLink}>About Us</button>
              <button onClick={() => scrollToSection('pricing')} className={styles.navLink}>Pricing</button>
              <button onClick={() => scrollToSection('blogs')} className={styles.navLink}>Blogs</button>
              <Link to="/contact" className={styles.navLink} onClick={closeMenu}>Contact</Link>
              
              <div className={styles.authSection}>
                <Link to="/login" className={`${styles.btn} ${styles.btnSecondary}`} onClick={closeMenu}>
                  Sign In
                </Link>
                <Link to="/signup" className={`${styles.btn} ${styles.btnPrimary}`} onClick={closeMenu}>
                  Sign Up
                </Link>
              </div>
            </>
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