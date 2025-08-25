import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from '../styles/Auth.module.css';

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signup, startEmailVerification, sendPhoneOtp, verifyPhoneOtp } = useAuth();
  
  // Check if coming from email verification
  const isFromEmailVerification = searchParams.get('verified') === 'true';
  
  // Step management
  const [currentStep, setCurrentStep] = useState(isFromEmailVerification ? 2 : 1);
  
  // Form data
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    address: '',
    termsAccepted: false
  });
  
  // Verification state
  const [verificationState, setVerificationState] = useState({
    emailVerified: isFromEmailVerification,
    phoneVerified: false,
    emailToken: null,
    phoneOtp: null
  });
  
  // UI state
  const [showPhoneOtp, setShowPhoneOtp] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [messages, setMessages] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check if can proceed to next step
  const canProceedToStep2 = verificationState.emailVerified && verificationState.phoneVerified;

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle phone number input
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);
    
    setFormData(prev => ({
      ...prev,
      phoneNumber: value
    }));
  };

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...phoneOtp];
    newOtp[index] = value;
    setPhoneOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.querySelector(`input[data-otp-index="${index + 1}"]`);
      if (nextInput) nextInput.focus();
    }
    
    // Check if OTP is complete
    if (newOtp.every(digit => digit !== '')) {
      verifyPhoneOtpWithAPI(newOtp.join(''));
    }
  };

  // Send email verification
  const sendEmailVerification = async () => {
    if (!formData.email) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
      return;
    }
    
    setLoading(true);
    try {
      const result = await startEmailVerification(formData.email);
      
      if (result.success) {
        setMessages(prev => ({
          ...prev,
          email: 'Verification email sent successfully! Check your inbox and click the verification link to verify your email.'
        }));
        
        // Clear any previous errors
        setErrors(prev => ({ ...prev, email: '' }));
        
      } else {
        setErrors(prev => ({ ...prev, email: result.error }));
        setMessages(prev => ({ ...prev, email: '' }));
      }
      
    } catch (error) {
      setErrors(prev => ({ ...prev, email: 'Failed to send verification email. Please try again.' }));
      setMessages(prev => ({ ...prev, email: '' }));
    } finally {
      setLoading(false);
    }
  };

  // Send phone OTP using real API
  const sendPhoneOtpWithAPI = async () => {
    if (!formData.phoneNumber || formData.phoneNumber.length !== 10) {
      setErrors(prev => ({ ...prev, phoneNumber: 'Please enter a valid 10-digit phone number' }));
      return;
    }
    
    setLoading(true);
    try {
      const result = await sendPhoneOtp(formData.phoneNumber);
      
      if (result.success) {
        setShowPhoneOtp(true);
        setMessages(prev => ({
          ...prev,
          phone: result.message || 'OTP sent to your phone number. Please check your SMS.'
        }));
        
        // Clear any previous errors
        setErrors(prev => ({ ...prev, phoneNumber: '' }));
        
      } else {
        setErrors(prev => ({ ...prev, phoneNumber: result.error }));
        setMessages(prev => ({ ...prev, phone: '' }));
      }
      
    } catch (error) {
      setErrors(prev => ({ ...prev, phoneNumber: 'Failed to send OTP. Please try again.' }));
      setMessages(prev => ({ ...prev, phone: '' }));
    } finally {
      setLoading(false);
    }
  };

  // Verify phone OTP using real API
  const verifyPhoneOtpWithAPI = async (otp) => {
    if (!otp || otp.length !== 6) return;
    
    setLoading(true);
    try {
      const result = await verifyPhoneOtp(formData.phoneNumber, otp);
      
      if (result.success) {
        setVerificationState(prev => ({
          ...prev,
          phoneVerified: true
        }));
        
        setMessages(prev => ({
          ...prev,
          phone: result.message || 'Phone number verified successfully! ✓'
        }));
        
        // Clear OTP input
        setPhoneOtp(['', '', '', '', '', '']);
        setShowPhoneOtp(false);
        
        // Clear any previous errors
        setErrors(prev => ({ ...prev, phoneNumber: '' }));
        
      } else {
        setErrors(prev => ({ ...prev, phoneNumber: result.error }));
        setMessages(prev => ({ ...prev, phone: '' }));
      }
      
    } catch (error) {
      setErrors(prev => ({ ...prev, phoneNumber: 'Failed to verify OTP. Please try again.' }));
      setMessages(prev => ({ ...prev, phone: '' }));
    } finally {
      setLoading(false);
    }
  };

  // Proceed to step 2
  const proceedToStep2 = () => {
    if (canProceedToStep2) {
      setCurrentStep(2);
    }
  };

  // Handle final signup
  const handleSignup = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms and conditions';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    try {
      // Create user account using real API
      const result = await signup({
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        fullName: formData.fullName,
        password: formData.password,
        address: formData.address
      });
      
      if (result.success) {
        // Clear form data
        setFormData({
          email: '',
          phoneNumber: '',
          fullName: '',
          password: '',
          confirmPassword: '',
          address: '',
          termsAccepted: false
        });
        
        // Clear verification state
        setVerificationState({
          emailVerified: false,
          phoneVerified: false,
          emailToken: null,
          phoneOtp: null
        });
        
        // Clear messages and errors
        setMessages({});
        setErrors({});
        
        // Redirect to dashboard after successful signup
        navigate('/dashboard');
      } else {
        setErrors(prev => ({ ...prev, general: result.error }));
      }
      
    } catch (error) {
      setErrors(prev => ({ ...prev, general: error.message || 'Signup failed. Please try again.' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.logoSection}>
          <img src="/logo-2.png" alt="AdScreenHub" className={styles.logo} />
          <h1>Create Account</h1>
        </div>

        {/* Step 1: Verification */}
        {currentStep === 1 && (
          <div className={styles.stepContainer}>
            <div className={styles.stepIndicator}>
              <span className={styles.stepNumber}>1</span>
              <span className={styles.stepText}>Verify Email & Phone</span>
            </div>
            
            <div className={styles.infoBox}>
              Step 1: Verify your email & mobile number to proceed
            </div>

            {/* Email Verification */}
            <div className={styles.formGroup}>
              <label htmlFor="email">
                Verify Email 
                {verificationState.emailVerified && (
                  <span className={styles.verifiedCheck}>✓ Verified</span>
                )}
              </label>
              <div className={styles.inputWithButton}>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  disabled={verificationState.emailVerified}
                  className={errors.email ? styles.errorInput : ''}
                />
                <button
                  type="button"
                  onClick={sendEmailVerification}
                  disabled={loading || verificationState.emailVerified}
                  className={styles.verifyButton}
                >
                  {loading ? 'Sending...' : 'Send Link'}
                </button>
              </div>
              {errors.email && <span className={styles.errorText}>{errors.email}</span>}
              {messages.email && (
                <div className={styles.successMessage}>
                  {messages.email}
                </div>
              )}
            </div>

            {/* Phone Verification */}
            <div className={styles.formGroup}>
              <label htmlFor="phoneNumber">
                Verify Mobile Number 
                {verificationState.phoneVerified && (
                  <span className={styles.verifiedCheck}>✓ Verified</span>
                )}
              </label>
              <div className={styles.inputWithButton}>
                <input
                  type="text"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="Enter 10-digit number"
                  disabled={verificationState.phoneVerified}
                  className={errors.phoneNumber ? styles.errorInput : ''}
                />
                <button
                  type="button"
                  onClick={sendPhoneOtpWithAPI}
                  disabled={loading || verificationState.phoneVerified}
                  className={styles.verifyButton}
                >
                  {loading ? 'Sending...' : 'Get OTP'}
                </button>
              </div>
              {errors.phoneNumber && <span className={styles.errorText}>{errors.phoneNumber}</span>}
              {messages.phone && (
                <div className={styles.successMessage}>
                  {messages.phone}
                </div>
              )}
            </div>

            {/* Phone OTP Input */}
            {showPhoneOtp && !verificationState.phoneVerified && (
              <div className={styles.formGroup}>
                <label>Enter Phone OTP</label>
                <div className={styles.otpContainer}>
                  {phoneOtp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      data-otp-index={index}
                      className={styles.otpInput}
                    />
                  ))}
                </div>
                <div className={styles.otpNote}>
                  Enter the 6-digit OTP sent to your phone
                </div>
              </div>
            )}

            {/* Next Button */}
            <button
              type="button"
              onClick={proceedToStep2}
              disabled={!canProceedToStep2}
              className={styles.primaryButton}
            >
              Next
            </button>
          </div>
        )}

        {/* Step 2: Enter Details */}
        {currentStep === 2 && (
          <div className={styles.stepContainer}>
            <div className={styles.stepIndicator}>
              <span className={styles.stepNumber}>2</span>
              <span className={styles.stepText}>Complete Profile</span>
            </div>
            
            <div className={styles.infoBox}>
              Step 2: Complete your profile information
            </div>

            <form onSubmit={handleSignup}>
              <div className={styles.formGroup}>
                <label htmlFor="fullName">
                  Full Name <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className={errors.fullName ? styles.errorInput : ''}
                />
                {errors.fullName && <span className={styles.errorText}>{errors.fullName}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password">
                  Create Password <span className={styles.required}>*</span>
                </label>
                <div className={styles.passwordInput}>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create a strong password"
                    className={errors.password ? styles.errorInput : ''}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
                {errors.password && <span className={styles.errorText}>{errors.password}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword">
                  Confirm Password <span className={styles.required}>*</span>
                </label>
                <div className={styles.passwordInput}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    className={errors.confirmPassword ? styles.errorInput : ''}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "🙈" : "👁"}
                  </button>
                </div>
                {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="address">
                  Address <span className={styles.required}>*</span>
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter your complete address"
                  rows="3"
                  className={errors.address ? styles.errorInput : ''}
                />
                {errors.address && <span className={styles.errorText}>{errors.address}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      termsAccepted: e.target.checked
                    }))}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxText}>
                    I accept the{' '}
                    <Link to="/terms" className={styles.link} target="_blank">
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy-policy" className={styles.link} target="_blank">
                      Privacy Policy
                    </Link>{' '}
                    <span className={styles.required}>*</span>
                  </span>
                </label>
                {errors.termsAccepted && <span className={styles.errorText}>{errors.termsAccepted}</span>}
              </div>

              {errors.general && (
                <div className={styles.errorMessage}>
                  {errors.general}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={styles.primaryButton}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          </div>
        )}

        <div className={styles.loginLink}>
          Already have an account? <Link to="/login">Log In</Link>
        </div>
      </div>
    </div>
  );
}
