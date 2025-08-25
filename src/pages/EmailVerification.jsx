import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from '../styles/EmailVerification.module.css';

export default function EmailVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { startEmailVerification } = useAuth();
  
  const [verificationStatus, setVerificationStatus] = useState('verifying');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get email from URL params or localStorage
    const emailFromParams = searchParams.get('email');
    const emailFromStorage = localStorage.getItem('pending_email_verification');
    
    if (emailFromParams) {
      setEmail(emailFromParams);
      localStorage.setItem('pending_email_verification', emailFromParams);
    } else if (emailFromStorage) {
      setEmail(emailFromStorage);
    } else {
      setVerificationStatus('no-email');
      return;
    }

    // Simulate verification process (in real app, this would be handled by backend)
    handleVerification();
  }, [searchParams]);

  const handleVerification = async () => {
    try {
      setLoading(true);
      
      // Simulate verification delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mark email as verified
      setVerificationStatus('success');
      
      // Clear pending verification
      localStorage.removeItem('pending_email_verification');
      
    } catch (error) {
      setVerificationStatus('error');
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) return;
    
    setLoading(true);
    try {
      const result = await startEmailVerification(email);
      
      if (result.success) {
        setVerificationStatus('resent');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to resend verification email.');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToSignup = () => {
    navigate('/signup?verified=true');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (verificationStatus === 'no-email') {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.iconContainer}>
            <div className={styles.errorIcon}>⚠️</div>
          </div>
          
          <h1 className={styles.title}>Email Verification Required</h1>
          
          <p className={styles.message}>
            Please enter your email address to receive a verification link.
          </p>
          
          <div className={styles.formGroup}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.emailInput}
            />
            <button
              onClick={handleResendVerification}
              disabled={loading || !email}
              className={styles.primaryButton}
            >
              {loading ? 'Sending...' : 'Send Verification Email'}
            </button>
          </div>
          
          {error && <div className={styles.errorMessage}>{error}</div>}
          
          <button onClick={handleGoHome} className={styles.secondaryButton}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'verifying') {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.iconContainer}>
            <div className={styles.loadingIcon}>⏳</div>
          </div>
          
          <h1 className={styles.title}>Verifying Your Email</h1>
          
          <p className={styles.message}>
            Please wait while we verify your email address...
          </p>
          
          <div className={styles.loadingSpinner}></div>
          
          <p className={styles.subMessage}>
            This may take a few moments.
          </p>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'success') {
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
            <button onClick={handleProceedToSignup} className={styles.primaryButton}>
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
        </div>
      </div>
    );
  }

  if (verificationStatus === 'resent') {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.iconContainer}>
            <div className={styles.successIcon}>📧</div>
          </div>
          
          <h1 className={styles.title}>Verification Email Sent!</h1>
          
          <p className={styles.message}>
            We've sent a new verification email to <strong>{email}</strong>. Please check your inbox and click the verification link.
          </p>
          
          <div className={styles.buttonContainer}>
            <button onClick={handleGoHome} className={styles.primaryButton}>
              Back to Home
            </button>
          </div>
          
          <div className={styles.infoBox}>
            <p className={styles.infoText}>
              <strong>Note:</strong> If you don't see the email, check your spam folder or try again in a few minutes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'error') {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.iconContainer}>
            <div className={styles.errorIcon}>❌</div>
          </div>
          
          <h1 className={styles.title}>Verification Failed</h1>
          
          <p className={styles.message}>
            {error || 'Something went wrong during email verification. Please try again.'}
          </p>
          
          <div className={styles.buttonContainer}>
            <button onClick={handleResendVerification} className={styles.primaryButton}>
              Try Again
            </button>
            
            <button onClick={handleGoHome} className={styles.secondaryButton}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
