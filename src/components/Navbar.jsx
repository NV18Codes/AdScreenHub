import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/Navbar.module.css';

export default function Navbar() {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          
          <div className={styles.authSection}>
            {isAuthenticated() ? (
              <>
                <span className={styles.userName}>Welcome, {user?.name || 'User'}</span>
                <Link to="/dashboard" className={`${styles.btn} ${styles.btnSecondary}`} onClick={closeMenu}>
                  Dashboard
                </Link>
                <button 
                  onClick={() => {
                    logout();
                    closeMenu();
                  }} 
                  className={`${styles.btn} ${styles.btnPrimary}`}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={`${styles.btn} ${styles.btnSecondary}`} onClick={closeMenu}>
                  Sign In
                </Link>
                <Link to="/signup" className={`${styles.btn} ${styles.btnPrimary}`} onClick={closeMenu}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button className={styles.mobileMenuBtn} onClick={toggleMenu}>
          <span className={`${styles.hamburger} ${isMenuOpen ? styles.active : ''}`}></span>
        </button>
      </div>
    </nav>
  );
}