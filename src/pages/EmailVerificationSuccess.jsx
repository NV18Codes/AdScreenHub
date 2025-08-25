import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from '../styles/EmailVerificationSuccess.module.css';

export default function EmailVerificationSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get email from URL params if available
  const email = searchParams.get('email') || 'your email';

  const handleProceed = () => {
    // Navigate to signup with verified email
    navigate('/signup?verified=true');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleResendVerification = () => {
    // Navigate back to signup to resend verification
    navigate('/signup');
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.iconContainer}>
          <div className={styles.successIcon}>✓</div>
        </div>
        
        <h1 className={styles.title}>Email Verified Successfully!</h1>
        
        <p className={styles.message}>
          Great! Your email <strong>{email}</strong> has been verified. You can now proceed to create your account and start advertising on AdScreenHub.
        </p>
        
        <div className={styles.buttonContainer}>
          <button onClick={handleProceed} className={styles.primaryButton}>
            Continue to Sign Up
          </button>
          
          <button onClick={handleGoHome} className={styles.secondaryButton}>
            Back to Home
          </button>
        </div>
        
        <div className={styles.infoBox}>
          <p className={styles.infoText}>
            <strong>Next Steps:</strong> Complete your profile with your full name, phone number, and address to finish setting up your account.
          </p>
        </div>
        
        <div className={styles.helpSection}>
          <p className={styles.helpText}>
            <strong>Need Help?</strong> If you didn't receive a verification email or need assistance, you can:
          </p>
          <button onClick={handleResendVerification} className={styles.helpButton}>
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
