import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from '../styles/CompleteProfile.module.css';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { completeRegistration } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
      
      if (!phoneToken || !emailToken) {
        setErrors({ 
          general: 'Verification tokens not found. Please complete email and phone verification first.' 
        });
        setLoading(false);
        return;
      }
      
      const result = await completeRegistration(
        formData.fullName,
        formData.password,
        phoneToken,
        emailToken
      );
      
      if (result.success) {
        // Clean up verification tokens
        localStorage.removeItem('email_verification_token');
        localStorage.removeItem('phone_verification_token');
        localStorage.removeItem('verified_email');
        localStorage.removeItem('verified_phone');
        localStorage.removeItem('email_verified');
        
        alert('Registration completed successfully! Welcome to AdScreen Hub!');
        navigate('/dashboard');
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleStartOver = () => {
    localStorage.clear();
    navigate('/signup');
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Complete Your Registration</h2>
        
        {errors.general && (
          <div className={styles.errorMessage}>{errors.general}</div>
        )}

        <form onSubmit={handleSubmit}>
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
        
        <button 
          type="button" 
          onClick={handleStartOver}
          className={styles.startOverButton}
        >
          Start Over
        </button>
      </div>
    </div>
  );
};

export default CompleteProfile;