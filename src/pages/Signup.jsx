import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from '../styles/Auth.module.css';

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { startEmailVerification, sendPhoneOtp, verifyPhoneOtp } = useAuth();
  
  // Check if coming from email verification
  const isFromEmailVerification = searchParams.get('verified') === 'true';
  const verifiedEmail = searchParams.get('email');
  const verifiedPhone = searchParams.get('phone');
  
  // Form data
  const [formData, setFormData] = useState({
    email: verifiedEmail || '',
    phoneNumber: verifiedPhone || '',
  });
  
  // Verification state
  const [verificationState, setVerificationState] = useState({
    emailVerified: isFromEmailVerification,
    phoneVerified: !!verifiedPhone, // Mark as verified if phone is provided
    emailToken: null,
    phoneOtp: null
  });
  
  // UI state
  const [showPhoneOtp, setShowPhoneOtp] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [messages, setMessages] = useState({});
  
  // OTP Timer state
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResendOtp, setCanResendOtp] = useState(false);



  // Update form data when verified email or phone changes
  useEffect(() => {
    if (verifiedEmail && verifiedEmail !== formData.email) {
      setFormData(prev => ({
        ...prev,
        email: verifiedEmail
      }));
    }
    
    if (verifiedPhone && verifiedPhone !== formData.phoneNumber) {
      setFormData(prev => ({
        ...prev,
        phoneNumber: verifiedPhone
      }));
    }
    
    // Check if email is verified from localStorage or URL params
    const verifiedEmailFromStorage = localStorage.getItem('verified_email');
    if ((verifiedEmailFromStorage && verifiedEmailFromStorage === formData.email) || isFromEmailVerification) {
      setVerificationState(prev => ({
        ...prev,
        emailVerified: true
      }));
      
      // Show success message when returning from email verification
      if (isFromEmailVerification) {
        setMessages(prev => ({
          ...prev,
          email: '✓ Email verified successfully! Now please verify your phone number.'
        }));
      }
    }
  }, [verifiedEmail, verifiedPhone, formData.email, formData.phoneNumber, isFromEmailVerification]);

  // OTP Timer effect
  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => {
          if (prev <= 1) {
            setCanResendOtp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Start OTP timer
  const startOtpTimer = () => {
    setOtpTimer(30);
    setCanResendOtp(false);
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResendOtp) return;
    
    setLoading(true);
    try {
      const result = await sendPhoneOtp(formData.phoneNumber);
      
      if (result.success) {
        startOtpTimer();
        setMessages(prev => ({
          ...prev,
          phone: 'OTP resent successfully! Please check your SMS.'
        }));
        
        // Clear any previous errors
        setErrors(prev => ({ ...prev, phoneNumber: '' }));
        
      } else {
        setErrors(prev => ({ ...prev, phoneNumber: result.error }));
        setMessages(prev => ({ ...prev, phone: '' }));
      }
      
    } catch (error) {
      setErrors(prev => ({ ...prev, phoneNumber: 'Failed to resend OTP. Please try again.' }));
      setMessages(prev => ({ ...prev, phone: '' }));
    } finally {
      setLoading(false);
    }
  };

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
        // Store email in localStorage for verification link handling
        localStorage.setItem('pending_email_verification', formData.email);
        
        setMessages(prev => ({
          ...prev,
          email: 'Verification email sent successfully! Check your inbox and click the verification link to verify your email.'
        }));
        
        // Clear any previous errors
        setErrors(prev => ({ ...prev, email: '' }));
        
        // DON'T mark email as verified yet - wait for actual verification
        // The user needs to click the link in their email
        
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
    // Check if email is verified first
    if (!verificationState.emailVerified) {
      setErrors(prev => ({ ...prev, phoneNumber: 'Please verify your email first before verifying phone number' }));
      return;
    }
    
    if (!formData.phoneNumber || formData.phoneNumber.length !== 10) {
      setErrors(prev => ({ ...prev, phoneNumber: 'Please enter a valid 10-digit phone number' }));
      return;
    }
    
    setLoading(true);
    try {
      const result = await sendPhoneOtp(formData.phoneNumber);
      
      if (result.success) {
        setShowPhoneOtp(true);
        startOtpTimer(); // Start the 30-second timer
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
        
        // Clear OTP timer and input
        setOtpTimer(0);
        setCanResendOtp(false);
        setPhoneOtp(['', '', '', '', '', '']);
        setShowPhoneOtp(false);
        
        setMessages(prev => ({
          ...prev,
          phone: 'Phone number verified successfully! ✓'
        }));
        
        // Clear any previous errors
        setErrors(prev => ({ ...prev, phoneNumber: '' }));
        
        // Call the success handler to redirect to CompleteProfile
        handlePhoneVerificationSuccess();
        
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

  // After phone verification, redirect to CompleteProfile
  const handlePhoneVerificationSuccess = () => {
    // Store verified phone number in localStorage for CompleteProfile
    localStorage.setItem('verified_phone', formData.phoneNumber);
    
    // Redirect to CompleteProfile page after successful phone verification
    setTimeout(() => {
      navigate(`/complete-profile?email=${encodeURIComponent(formData.email)}&phone=${encodeURIComponent(formData.phoneNumber)}`);
    }, 1500);
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.logoSection}>
          <img src="/logo-2.png" alt="AdScreenHub" className={styles.logo} />
          <h1>Create Account</h1>
        </div>

        {/* Verification Step */}
        <div className={styles.stepContainer}>
          <div className={styles.stepIndicator}>
            <span className={styles.stepNumber}>1</span>
            <span className={styles.stepText}>Verify Email & Phone</span>
          </div>
          
          <div className={styles.infoBox}>
            Verify your email & mobile number, then complete your profile
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
          
          {/* Local Development Helper - Only show if email verification is pending */}
          {window.location.hostname === 'localhost' && verificationState.emailVerified === false && messages.email && (
            <div style={{ 
              marginTop: '10px', 
              padding: '10px', 
              backgroundColor: '#f8fafc', 
              border: '1px solid #e2e8f0', 
              borderRadius: '6px',
              fontSize: '12px'
            }}>
              <p style={{ margin: '0 0 8px 0', color: '#64748b' }}>
                <strong>💡 Development Tip:</strong> If email link redirects to production, it will automatically redirect back to localhost.
              </p>
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
                  placeholder={verificationState.emailVerified ? "Enter 10-digit number" : "Verify email first"}
                  disabled={verificationState.phoneVerified || !verificationState.emailVerified}
                  className={errors.phoneNumber ? styles.errorInput : ''}
                />
                <button
                  type="button"
                  onClick={sendPhoneOtpWithAPI}
                  disabled={loading || verificationState.phoneVerified || !verificationState.emailVerified}
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
              {!verificationState.emailVerified && (
                <div className={styles.infoMessage}>
                  ⚠️ Please verify your email first before verifying your phone number
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
                
                {/* OTP Timer and Resend */}
                <div className={styles.otpTimerSection}>
                  {otpTimer > 0 ? (
                    <div className={styles.timer}>
                      Resend OTP in: <span className={styles.timerCount}>{otpTimer}s</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading || !canResendOtp}
                      className={styles.resendButton}
                    >
                      {loading ? 'Sending...' : 'Resend OTP'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Verify Button (instead of Next) */}
            {showPhoneOtp && !verificationState.phoneVerified && (
              <button
                type="button"
                onClick={() => {
                  const otpString = phoneOtp.join('');
                  if (otpString.length === 6) {
                    verifyPhoneOtpWithAPI(otpString);
                  } else {
                    setErrors(prev => ({ ...prev, phoneNumber: 'Please enter the complete 6-digit OTP' }));
                  }
                }}
                disabled={phoneOtp.join('').length !== 6 || loading}
                className={styles.primaryButton}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            )}

            {/* Success Message when both verifications are complete */}
            {verificationState.emailVerified && verificationState.phoneVerified && (
              <div className={styles.successMessage}>
                ✓ Both email and phone verified successfully! Redirecting to complete your profile...
              </div>
            )}
          </div>

        <div className={styles.loginLink}>
          Already have an account? <Link to="/login">Log In</Link>
        </div>
      </div>
    </div>
  );
}
