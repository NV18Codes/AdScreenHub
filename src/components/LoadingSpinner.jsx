import React from 'react';
import styles from '../styles/LoadingSpinner.module.css';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...', className = '' }) => {
  return (
    <div className={`${styles.spinnerContainer} ${className}`}>
      <div className={`${styles.spinner} ${styles[size]}`}>
        <div className={styles.spinnerRing}></div>
        <div className={styles.spinnerRing}></div>
        <div className={styles.spinnerRing}></div>
      </div>
      {text && <span className={styles.spinnerText}>{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
