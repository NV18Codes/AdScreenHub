import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const { verifyEmail } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState('verifying');

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    
    if (token) {
      const [selector, validator] = token.split('|');
      verifyEmailToken(selector, validator, email);
    }
  }, [searchParams]);

  const verifyEmailToken = async (selector, validator, email) => {
    try {
      const result = await verifyEmail(selector, validator);
      
      if (result.success) {
        setVerificationStatus('success');
        if (email) {
          localStorage.setItem('verified_email', email);
        }
        setTimeout(() => {
          window.location.href = `${window.location.origin}/signup?email=${encodeURIComponent(email || '')}&verified=true`;
        }, 2000);
      } else {
        setVerificationStatus('error');
      }
    } catch (error) {
      setVerificationStatus('error');
    }
  };

  const handleProceedToSignup = () => {
    const email = searchParams.get('email');
    window.location.href = `${window.location.origin}/signup?email=${encodeURIComponent(email || '')}&verified=true`;
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        {verificationStatus === 'verifying' && (
          <div>
            <h2>Verifying Email...</h2>
            <p>Please wait while we verify your email address.</p>
          </div>
        )}
        
        {verificationStatus === 'success' && (
          <div>
            <h2 style={{ color: '#4CAF50' }}>✅ Email Verified!</h2>
            <p>Your email has been successfully verified. Redirecting to signup...</p>
            <button 
              onClick={handleProceedToSignup}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                marginTop: '20px'
              }}
            >
              Continue to Signup
            </button>
          </div>
        )}
        
        {verificationStatus === 'error' && (
          <div>
            <h2 style={{ color: '#f44336' }}>❌ Verification Failed</h2>
            <p>The verification link is invalid or has expired.</p>
            <button 
              onClick={handleProceedToSignup}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                marginTop: '20px'
              }}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;