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
        
        <h1>❌ Booking Failed</h1>
        <p className={styles.errorMessage}>
          {message}
        </p>

        <div className={styles.reasons}>
          <h3>Possible Reasons:</h3>
          <ul>
            <li>💳 Payment was declined by your bank</li>
            <li>⏰ The selected slot is no longer available</li>
            <li>🔒 Payment verification failed</li>
            <li>🌐 Network connectivity issues</li>
            <li>💰 Insufficient funds in your account</li>
          </ul>
        </div>

        <div className={styles.actions}>
          <button 
            onClick={() => navigate('/dashboard')} 
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

        <div className={styles.help}>
          <h3>Need Help?</h3>
          <p>
            If you continue to experience issues, please contact our support team. 
            We're here to help you complete your booking successfully.
          </p>
          <div className={styles.contactInfo}>
            <p>📧 Email: support@adscreenhub.com</p>
            <p>📞 Phone: +91 9876543210</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingFailed;
