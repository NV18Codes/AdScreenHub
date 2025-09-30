import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styles from '../styles/BookingFailed.module.css';

const BookingFailed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const message = searchParams.get('message') || 'Payment verification failed. Please try again.';

  return (
    <div className={styles.container}>
      <div className={styles.errorCard}>
        <div className={styles.errorIcon}>
          <div className={styles.errorSymbol}>
            <div className={styles.errorCircle}>
              <div className={styles.errorLine1}></div>
              <div className={styles.errorLine2}></div>
            </div>
          </div>
        </div>
        
        <h1>Payment Failed</h1>
        <p className={styles.errorMessage}>
          {message}
        </p>

        <div className={styles.actions}>
          <button 
            onClick={() => navigate('/booking')} 
            className={styles.primaryButton}
          >
            Try Again
          </button>
          <button 
            onClick={() => navigate('/contact')} 
            className={styles.secondaryButton}
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingFailed;
