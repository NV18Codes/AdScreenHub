import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const EmailVerificationRedirect = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Get URL parameters
    const selector = searchParams.get('selector');
    const validator = searchParams.get('validator');
    const email = searchParams.get('email');
    
    // Determine the target URL based on environment
    let targetUrl;
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isLocalhost) {
      // If already on localhost, stay on localhost
      targetUrl = window.location.origin + '/email-verification';
    } else {
      // If on production, redirect to localhost for development
      targetUrl = 'http://localhost:3002/email-verification';
    }
    
    // Add parameters
    const params = new URLSearchParams();
    if (email) params.append('email', email);
    if (selector && validator) {
      params.append('token', `${selector}|${validator}`);
    }
    
    if (params.toString()) {
      targetUrl += '?' + params.toString();
    }
    
    console.log('🔄 Email verification redirect to:', targetUrl);
    
    // Redirect immediately
    window.location.href = targetUrl;
  }, [searchParams]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '15px',
        backdropFilter: 'blur(10px)',
        maxWidth: '400px'
      }}>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '1rem'
        }}>
          AD SCREEN HUB
        </div>
        <div style={{
          border: '3px solid rgba(255, 255, 255, 0.3)',
          borderTop: '3px solid white',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }}></div>
        <h2>Email Verification</h2>
        <p>Redirecting you to complete your email verification...</p>
        <div style={{
          fontSize: '0.9rem',
          opacity: 0.8,
          marginTop: '1rem'
        }}>
          If you're testing locally, this will redirect to your localhost development environment.
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default EmailVerificationRedirect;
