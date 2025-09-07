import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from '../styles/CompleteProfile.module.css';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { completeRegistration } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state) {
      setFormData(prev => ({
        ...prev,
        fullName: location.state.fullName || ''
      }));
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (loading) return;
    
    // Validation
    if (!formData.fullName.trim()) {
      return setErrors({ fullName: 'Full name is required' });
    }
    if (!formData.password) {
      return setErrors({ password: 'Password is required' });
    }
    if (formData.password.length < 6) {
      return setErrors({ password: 'Password must be at least 6 characters' });
    }
    if (formData.password !== formData.confirmPassword) {
      return setErrors({ confirmPassword: 'Passwords do not match' });
    }

    setErrors({});
    setLoading(true);

    try {
      const phoneToken = localStorage.getItem('phone_verification_token');
      const emailToken = localStorage.getItem('email_verification_token');
      
      console.log('🔐 Checking tokens:', {
        phoneToken: phoneToken ? `${phoneToken.substring(0, 20)}...` : 'MISSING',
        emailToken: emailToken ? `${emailToken.substring(0, 20)}...` : 'MISSING'
      });
      
      // Check if we have valid tokens
      if (!phoneToken || !emailToken) {
        setErrors({ 
          general: 'Verification tokens not found. Please complete email and phone verification first by clicking "Start Over".' 
        });
        return;
      }
      
      const result = await completeRegistration(
        formData.fullName,
        formData.password,
        phoneToken,
        emailToken
      );
      
      console.log('📥 Complete registration result:', result);
      console.log('📥 Complete registration error details:', result.error);
      
      if (result.success) {
        localStorage.removeItem('email_verification_token');
        localStorage.removeItem('phone_verification_token');
        localStorage.removeItem('verified_email');
        localStorage.removeItem('verified_phone');
        alert('Registration completed successfully!');
        navigate('/dashboard');
      } else {
        console.error('❌ Registration failed:', result);
        if (result.error && result.error.includes('Invalid or expired')) {
          setErrors({ 
            general: 'Verification tokens are invalid or expired. Please click "Start Over" to verify your email and phone again.' 
          });
        } else {
          setErrors({ general: result.error || 'Registration failed. Please try again.' });
        }
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      setErrors({ general: 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2>Complete Your Profile</h2>
        
        {/* Debug info */}
        <div style={{ 
          background: '#e3f2fd', 
          border: '1px solid #2196f3', 
          borderRadius: '8px', 
          padding: '15px', 
          margin: '20px 0', 
          fontSize: '12px', 
          color: '#1976d2' 
        }}>
          <strong>Debug Info:</strong><br/>
          Email Token: {localStorage.getItem('email_verification_token') ? '✅ Present' : '❌ Missing'}<br/>
          Phone Token: {localStorage.getItem('phone_verification_token') ? '✅ Present' : '❌ Missing'}<br/>
          Email Token Length: {localStorage.getItem('email_verification_token')?.length || 0}<br/>
          Phone Token Length: {localStorage.getItem('phone_verification_token')?.length || 0}
        </div>
        
        {errors.general && (
          <div className={styles.errorMessage}>{errors.general}</div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
            />
            {errors.fullName && <span className={styles.error}>{errors.fullName}</span>}
          </div>

          <div className={styles.inputGroup}>
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Create a password (min 6 characters)"
              required
            />
            {errors.password && <span className={styles.error}>{errors.password}</span>}
          </div>

          <div className={styles.inputGroup}>
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your password"
              required
            />
            {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>
        
        <div className={styles.startOver}>
          <button 
            type="button" 
            onClick={() => {
              localStorage.clear();
              navigate('/signup');
            }}
            className={styles.startOverButton}
          >
            Start Over
          </button>
          
          <button 
            type="button" 
            onClick={async () => {
              console.log('🧪 Testing with fresh phone token from API response...');
              // Use the fresh token from the API response you just got
              const freshPhoneToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZU51bWJlciI6IjgyOTY2MjA3NjUiLCJ2ZXJpZmllZCI6dHJ1ZSwidHlwZSI6InBob25lIiwiaWF0IjoxNzU3MjYyMzI5LCJleHAiOjE3NTcyNjMyMjl9.yVPFLblhbwcYYTZJoPtdPxW1HEl6soVv72hRL1gftx4";
              const testEmailToken = "591a047631c191067218d236dce205dd3557c63c044b2214b6b7c2511a89a22a";
              
              localStorage.setItem('phone_verification_token', freshPhoneToken);
              localStorage.setItem('email_verification_token', testEmailToken);
              
              alert('Fresh phone token set! Now try submitting the form.');
            }}
            style={{
              background: '#ff9800',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              marginLeft: '10px'
            }}
          >
            Test with Fresh Phone Token
          </button>
          
          <button 
            type="button" 
            onClick={async () => {
              console.log('🧪 Testing with ONLY phone token (no email token)...');
              const freshPhoneToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZU51bWJlciI6IjgyOTY2MjA3NjUiLCJ2ZXJpZmllZCI6dHJ1ZSwidHlwZSI6InBob25lIiwiaWF0IjoxNzU3MjYyMzI5LCJleHAiOjE3NTcyNjMyMjl9.yVPFLblhbwcYYTZJoPtdPxW1HEl6soVv72hRL1gftx4";
              
              localStorage.setItem('phone_verification_token', freshPhoneToken);
              localStorage.removeItem('email_verification_token'); // Remove email token
              
              alert('Only phone token set! This will test if email token is the issue.');
            }}
            style={{
              background: '#f44336',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              marginLeft: '10px'
            }}
          >
            Test Phone Token Only
          </button>
          
          <button 
            type="button" 
            onClick={() => {
              navigate('/signup');
            }}
            style={{
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              marginLeft: '10px'
            }}
          >
            Get Real Email Token
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;