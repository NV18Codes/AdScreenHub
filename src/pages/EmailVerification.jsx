import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from '../styles/EmailVerification.module.css';

export default function EmailVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { startEmailVerification, verifyEmail } = useAuth();
  
  const [verificationStatus, setVerificationStatus] = useState('verifying');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get email and token from URL params or localStorage
    const emailFromParams = searchParams.get('email');
    const tokenFromParams = searchParams.get('token'); // Backend verification token
    const selectorFromParams = searchParams.get('selector'); // Email verification selector
    const validatorFromParams = searchParams.get('validator'); // Email verification validator
    const emailFromStorage = localStorage.getItem('pending_email_verification');
    
    // Combine selector and validator into token format if they exist
    const finalToken = tokenFromParams || (selectorFromParams && validatorFromParams ? `${selectorFromParams}|${validatorFromParams}` : null);
    
    console.log('Email verification params:', { emailFromParams, tokenFromParams, selectorFromParams, validatorFromParams, finalToken, emailFromStorage });
    console.log('Current URL:', window.location.href);
    
    // Check if we're on production URL but need to redirect to localhost (for development)
    const isProductionUrl = window.location.hostname === 'ad-screenhub.netlify.app';
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    // Only redirect from production to localhost if we have verification parameters
    // This helps developers who are testing locally but get production email links
    if (isProductionUrl && (emailFromParams || finalToken)) {
      console.log('🔄 Production email verification detected - redirecting to localhost for development');
      const localhostUrl = `http://localhost:3002/email-verification?email=${encodeURIComponent(emailFromParams || '')}&token=${encodeURIComponent(finalToken || '')}`;
      
      // Show redirect message
      setVerificationStatus('redirecting');
      setEmail(emailFromParams || '');
      
      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = localhostUrl;
      }, 1000);
      return;
    }
    
    if (finalToken) {
      // This is a backend verification link - verify the token
      const emailToVerify = emailFromParams || emailFromStorage;
      
      if (emailToVerify) {
        setEmail(emailToVerify);
        setVerificationStatus('verifying');
        
        // Call the API to verify the email token
        const verifyToken = async () => {
          try {
            console.log('🔍 Verifying email token:', finalToken);
            console.log('📧 Email to verify:', emailToVerify);
            
            const result = await verifyEmail(finalToken);
            
            console.log('📥 Verification result:', result);
            
            if (result && result.success) {
              console.log('✅ Email verification successful');
              setVerificationStatus('success');
              // Store verified email
              localStorage.setItem('verified_email', emailToVerify);
              // Redirect back to signup page on the same domain
              setTimeout(() => {
                const currentOrigin = window.location.origin;
                const signupUrl = `${currentOrigin}/signup?email=${encodeURIComponent(emailToVerify)}&verified=true`;
                console.log('🔄 Redirecting to signup:', signupUrl);
                window.location.href = signupUrl;
              }, 2000);
            } else {
              console.log('❌ Email verification failed:', result);
              setVerificationStatus('error');
              setError(result?.error || result?.message || 'Email verification failed');
            }
          } catch (error) {
            console.error('❌ Email verification error:', error);
            setVerificationStatus('error');
            setError('Email verification failed. Please try again.');
          }
        };
        
        verifyToken();
        return;
      } else {
        // We have token but no email anywhere - this shouldn't happen
        setVerificationStatus('error');
        setError('Verification failed: No email found');
        return;
      }
    }
    
    // Handle manual email verification (no token)
    if (emailFromParams) {
      setEmail(emailFromParams);
      localStorage.setItem('pending_email_verification', emailFromParams);
    } else if (emailFromStorage) {
      setEmail(emailFromStorage);
    } else {
      setVerificationStatus('no-email');
      return;
    }

    // Only simulate verification if no token (manual testing)
    handleVerification();
  }, [searchParams, navigate]);

  const handleVerification = async () => {
    try {
      setLoading(true);
      
      // Simulate verification delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mark email as verified
      setVerificationStatus('success');
      
      // Store email verification token (simulated for now)
      // In a real implementation, this would come from the verification email
      const emailToken = `email_verified_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('email_verification_token', emailToken);
      
      // Clear pending verification
      localStorage.removeItem('pending_email_verification');
      
      // Redirect to signup page after email verification
      navigate(`/signup?email=${encodeURIComponent(email)}&verified=true`);
      
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
    const currentOrigin = window.location.origin;
    const signupUrl = `${currentOrigin}/signup?verified=true`;
    window.location.href = signupUrl;
  };

  const handleGoHome = () => {
    const currentOrigin = window.location.origin;
    window.location.href = currentOrigin;
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

  if (verificationStatus === 'redirecting') {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.iconContainer}>
            <div className={styles.loadingIcon}>🔄</div>
          </div>
          
          <h1 className={styles.title}>Redirecting to Local Development</h1>
          
          <p className={styles.message}>
            We're redirecting you to your local development environment...
          </p>
          
          <div className={styles.loadingSpinner}></div>
          
          <p className={styles.subMessage}>
            This will redirect you to localhost:3002 to complete email verification.
          </p>
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
            Great! Your email <strong>{email}</strong> has been verified. Redirecting you back to complete your registration...
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
