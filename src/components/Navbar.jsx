import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserDisplayName, getUserEmail } from '../utils/userUtils';
import styles from '../styles/Navbar.module.css';

export default function Navbar() {
  const location = useLocation();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  
  // Debug: Log user object to see available fields
  
  // Get display name using utility function
  const displayName = getUserDisplayName(user);
  const userEmail = getUserEmail(user);
  

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

  // Detect active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (location.pathname !== '/') return;
      
      const sections = ['how-it-works', 'about', 'pricing'];
      let currentSection = '';
      
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            currentSection = sectionId;
            break;
          }
        }
      }
      
      setActiveSection(currentSection);
    };

    if (location.pathname === '/') {
      window.addEventListener('scroll', handleScroll);
      handleScroll(); // Check initial position
    } else {
      setActiveSection('');
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
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
              {isAdmin() ? (
                <>
                  {/* Admin Navigation */}
                  <Link to="/admin/orders" className={`${styles.navLink} ${location.pathname === '/admin/orders' ? styles.active : ''}`} onClick={closeMenu}>Orders</Link>
                  <Link to="/admin/profile" className={`${styles.navLink} ${location.pathname === '/admin/profile' ? styles.active : ''}`} onClick={closeMenu}>Profile</Link>
                </>
              ) : (
                <>
                  {/* Customer Navigation */}
                  <Link to="/dashboard" className={`${styles.navLink} ${location.pathname === '/dashboard' ? styles.active : ''}`} onClick={closeMenu}>Dashboard</Link>
                  <Link to="/my-orders" className={`${styles.navLink} ${location.pathname === '/my-orders' ? styles.active : ''}`} onClick={closeMenu}>My Orders</Link>
                  <Link to="/profile" className={`${styles.navLink} ${location.pathname === '/profile' ? styles.active : ''}`} onClick={closeMenu}>Profile</Link>
                </>
              )}
              
              <div className={styles.authSection}>
                <span className={styles.userName}>Hi, {displayName}</span>
                {!isAdmin() && (
                  <Link to="/booking" className={`${styles.btn} ${styles.btnBookNow}`} onClick={closeMenu}>
                    Book Now
                  </Link>
                )}
                <button 
                  onClick={async () => {
                    try {
                      await logout();
                      closeMenu();
                      window.location.href = '/';
                    } catch (error) {
                      // Force redirect even if logout fails
                      closeMenu();
                      window.location.href = '/';
                    }
                  }} 
                  className={`${styles.btn} ${styles.btnSecondary}`}
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Public Navigation */}
              <button onClick={() => scrollToSection('how-it-works')} className={`${styles.navLink} ${activeSection === 'how-it-works' ? styles.active : ''}`}>How It Works?</button>
              <button onClick={() => scrollToSection('about')} className={`${styles.navLink} ${activeSection === 'about' ? styles.active : ''}`}>About Us</button>
              <button onClick={() => scrollToSection('pricing')} className={`${styles.navLink} ${activeSection === 'pricing' ? styles.active : ''}`}>Pricing</button>
              <Link to="/faq" className={`${styles.navLink} ${location.pathname === '/faq' ? styles.active : ''}`} onClick={closeMenu}>FAQs</Link>
              <Link to="/contact" className={`${styles.navLink} ${location.pathname === '/contact' ? styles.active : ''}`} onClick={closeMenu}>Contact</Link>
              
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