import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/StandardPageLayout.module.css';

export default function StandardPageLayout({ 
  title, 
  subtitle, 
  children, 
  showBackButton = false,
  className = '' 
}) {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.header}>
        {showBackButton && (
          <button onClick={handleGoBack} className={styles.backButton}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
        )}
        <div className={styles.titleSection}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>
      
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}
