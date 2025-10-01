import React, { useEffect } from 'react';
import styles from '../styles/Toast.module.css';

const Toast = ({ message, type = 'success', onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <div className={styles.toastContent}>
        <div className={styles.toastIcon}>
          {type === 'success' ? '✅' : '❌'}
        </div>
        <p className={styles.toastMessage}>{message}</p>
      </div>
      <button onClick={onClose} className={styles.toastClose}>
        ×
      </button>
    </div>
  );
};

export default Toast;

