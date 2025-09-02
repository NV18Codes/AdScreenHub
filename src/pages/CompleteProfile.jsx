import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from '../styles/CompleteProfile.module.css';

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signup } = useAuth();
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Validation state
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Get email and phone from URL params or localStorage
    const emailFromParams = searchParams.get('email');
    const phoneFromParams = searchParams.get('phone');
    const emailFromStorage = localStorage.getItem('pending_email_verification');
    const phoneFromStorage = localStorage.getItem('verified_phone');
    
    // Debug logging
    console.log('CompleteProfile - Verification data:', {
      emailFromParams,
      phoneFromParams,
      emailFromStorage,
      phoneFromStorage,
      allLocalStorage: Object.keys(localStorage)
    });
    
    // Check if we have verified email and phone
    if (!emailFromParams && !emailFromStorage) {
      setError('Email verification required. Please complete email verification first.');
      return;
    }
    
    if (!phoneFromParams && !phoneFromStorage) {
      setError('Phone verification required. Please complete phone verification first.');
      return;
    }
    
    // Pre-fill email and phone (read-only)
    if (emailFromParams || emailFromStorage) {
      // Email will be read-only and sent via token
    }
    if (phoneFromParams || phoneFromStorage) {
      // Phone will be read-only and sent via token
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, number, and special character';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get verified email and phone from URL params or localStorage
      const emailFromParams = searchParams.get('email');
      const phoneFromParams = searchParams.get('phone');
      const emailFromStorage = localStorage.getItem('pending_email_verification');
      const phoneFromStorage = localStorage.getItem('verified_phone');
      
      const email = emailFromParams || emailFromStorage;
      const phoneNumber = phoneFromParams || phoneFromStorage;
      
      if (!email || !phoneNumber) {
        setError('Missing verification data. Please complete email and phone verification first.');
        setLoading(false);
        return;
      }

      // Prepare user data for signup
      const userData = {
        email: email.toLowerCase(),
        phoneNumber: phoneNumber,
        fullName: fullName.trim(),
        password: password,
      };

      // Call the signup function from useAuth
      const result = await signup(userData);

      if (result.success) {
        setSuccess(true);
        
        // Clear verification data from localStorage
        localStorage.removeItem('pending_email_verification');
        localStorage.removeItem('verified_phone');
        localStorage.removeItem('email_verification_token');
        localStorage.removeItem('phone_verification_token');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
        
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.successIcon}>✓</div>
          <h1 className={styles.title}>Profile Completed Successfully!</h1>
          <p className={styles.message}>
            Your account has been created successfully. Redirecting you to the dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Complete Your Profile</h1>
        <p className={styles.subtitle}>
          You're almost there! Just a few more details to complete your account setup.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Full Name */}
          <div className={styles.formGroup}>
            <label htmlFor="fullName" className={styles.label}>
              Full Name *
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`}
              placeholder="Enter your full name"
              disabled={loading}
            />
            {errors.fullName && <span className={styles.errorText}>{errors.fullName}</span>}
          </div>

          {/* Password */}
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password *
            </label>
            <div className={styles.passwordContainer}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${styles.input} ${styles.passwordInput} ${errors.password ? styles.inputError : ''}`}
                placeholder="Create a strong password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.passwordToggle}
                disabled={loading}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && <span className={styles.errorText}>{errors.password}</span>}
            <div className={styles.passwordHint}>
              Password must be at least 8 characters with uppercase, lowercase, number, and special character
            </div>
          </div>

          {/* Confirm Password */}
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirm Password *
            </label>
            <div className={styles.passwordContainer}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`${styles.input} ${styles.passwordInput} ${errors.confirmPassword ? styles.inputError : ''}`}
                placeholder="Confirm your password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={styles.passwordToggle}
                disabled={loading}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword}</span>}
          </div>

          {/* Error Message */}
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div className={styles.infoBox}>
          <p className={styles.infoText}>
            <strong>Note:</strong> Your email and phone number have already been verified and will be automatically included in your account.
          </p>
        </div>
        
        {/* Show error message if verification is incomplete */}
        {error && (
          <div className={styles.errorBox}>
            <p className={styles.errorText}>
              <strong>Verification Required:</strong> {error}
            </p>
            <div className={styles.verificationSteps}>
              <p><strong>To complete your profile, you need to:</strong></p>
              <ol>
                <li>Verify your email address first</li>
                <li>Verify your phone number with OTP</li>
                <li>Then return to this page to complete your profile</li>
              </ol>
              <button 
                onClick={() => navigate('/email-verification-success')} 
                className={styles.verificationButton}
              >
                Go to Verification
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
