import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const { verifyEmail } = useAuth();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    const selector = searchParams.get('selector');
    const validator = searchParams.get('validator');
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    
    // Handle different URL formats
    let finalSelector = selector;
    let finalValidator = validator;
    
    if (token && !selector && !validator) {
      const [tokenSelector, tokenValidator] = token.split('|');
      finalSelector = tokenSelector;
      finalValidator = tokenValidator;
    }
    
    if (finalSelector && finalValidator) {
      verifyEmailToken(finalSelector, finalValidator, email);
    } else {
      setStatus('error');
    }
  }, [searchParams]);

  const verifyEmailToken = async (selector, validator, email) => {
    try {
      const result = await verifyEmail(selector, validator);
      
      if (result.success) {
        setStatus('success');
        
        // Store verification status
        localStorage.setItem('email_verified', 'true');
        if (email) {
          localStorage.setItem('verified_email', email);
        }
        
        // Redirect to signup after 2 seconds
        setTimeout(() => {
          const currentOrigin = window.location.origin;
          const redirectUrl = email 
            ? `${currentOrigin}/signup?email=${encodeURIComponent(email)}&verified=true`
            : `${currentOrigin}/signup?verified=true`;
          
          window.location.href = redirectUrl;
        }, 2000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  const handleContinue = () => {
    const email = searchParams.get('email');
    
    localStorage.setItem('email_verified', 'true');
    if (email) {
      localStorage.setItem('verified_email', email);
    }
    
    const currentOrigin = window.location.origin;
    const redirectUrl = email 
      ? `${currentOrigin}/signup?email=${encodeURIComponent(email)}&verified=true`
      : `${currentOrigin}/signup?verified=true`;
    
    window.location.href = redirectUrl;
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
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
        {status === 'verifying' && (
          <div>
            <h2>Verifying Email...</h2>
            <p>Please wait while we verify your email address.</p>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #2196F3',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '20px auto'
            }}></div>
          </div>
        )}
        
        {status === 'success' && (
          <div>
            <h2 style={{ color: '#2196F3' }}>✅ Email Verified!</h2>
            <p>Your email has been successfully verified. Redirecting to signup...</p>
            <button 
              onClick={handleContinue}
              style={{
                background: '#2196F3',
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
        
        {status === 'error' && (
          <div>
            <h2 style={{ color: '#f44336' }}>❌ Verification Failed</h2>
            <p>The verification link is invalid or has expired.</p>
            <button 
              onClick={handleContinue}
              style={{
                background: '#2196F3',
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
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default EmailVerification;