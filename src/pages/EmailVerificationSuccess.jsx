import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from '../styles/EmailVerificationSuccess.module.css';

export default function EmailVerificationSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { sendPhoneOtp, verifyPhoneOtp } = useAuth();
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState(['', '', '', '', '', '']);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [messages, setMessages] = useState({});
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    // Get email from URL params, navigation state, or localStorage
    const emailFromParams = searchParams.get('email');
    const emailFromState = location.state?.email;
    const emailFromStorage = localStorage.getItem('pending_email_verification');
    
    if (emailFromParams) {
      setEmail(emailFromParams);
      // Store email in localStorage for the signup flow
      localStorage.setItem('pending_email_verification', emailFromParams);
    } else if (emailFromState) {
      setEmail(emailFromState);
      // Store email in localStorage for the signup flow
      localStorage.setItem('pending_email_verification', emailFromState);
    } else if (emailFromStorage) {
      setEmail(emailFromStorage);
    } else {
      // If no email found, redirect to signup
      navigate('/signup');
      return;
    }
  }, [searchParams, location.state, navigate]);

  // Handle phone number input
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);
    setPhoneNumber(value);
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

  // Send phone OTP
  const sendPhoneOtpWithAPI = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      setErrors(prev => ({ ...prev, phone: 'Please enter a valid 10-digit phone number' }));
      return;
    }
    
    setLoading(true);
    try {
      const result = await sendPhoneOtp(phoneNumber);
      
      if (result.success) {
        setShowOtpInput(true);
        setMessages(prev => ({
          ...prev,
          phone: result.message || 'OTP sent to your phone number. Please check your SMS.'
        }));
        
        // Clear any previous errors
        setErrors(prev => ({ ...prev, phone: '' }));
        
      } else {
        setErrors(prev => ({ ...prev, phone: result.error }));
        setMessages(prev => ({ ...prev, phone: '' }));
      }
      
    } catch (error) {
      setErrors(prev => ({ ...prev, phone: 'Failed to send OTP. Please try again.' }));
      setMessages(prev => ({ ...prev, phone: '' }));
    } finally {
      setLoading(false);
    }
  };

  // Verify phone OTP
  const verifyPhoneOtpWithAPI = async (otp) => {
    if (!otp || otp.length !== 6) return;
    
    setLoading(true);
    try {
      const result = await verifyPhoneOtp(phoneNumber, otp);
      
      if (result.success) {
        setPhoneVerified(true);
        setMessages(prev => ({
          ...prev,
          phone: 'Phone number verified successfully! ✓'
        }));
        
        // Clear any previous errors
        setErrors(prev => ({ ...prev, phone: '' }));
        
        // Store verified phone number
        localStorage.setItem('verified_phone', phoneNumber);
        
        // Store phone verification token (simulated for now)
        // In a real implementation, this would come from the OTP verification response
        const phoneToken = `phone_verified_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('phone_verification_token', phoneToken);
        
      } else {
        setErrors(prev => ({ ...prev, phone: result.error }));
        setMessages(prev => ({ ...prev, phone: '' }));
      }
      
    } catch (error) {
      setErrors(prev => ({ ...prev, phone: 'Failed to verify OTP. Please try again.' }));
      setMessages(prev => ({ ...prev, phone: '' }));
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToDetails = () => {
    // Navigate to details collection page with verified email and phone
    navigate(`/complete-profile?email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phoneNumber)}`);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleResendVerification = () => {
    // Navigate back to signup to resend verification
    navigate('/signup');
  };

  // Show loading while determining email
  if (!email) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.iconContainer}>
          <div className={styles.successIcon}>✓</div>
        </div>
        
        <h1 className={styles.title}>Email Verified Successfully!</h1>
        
        <p className={styles.message}>
          Great! Your email <strong>{email}</strong> has been verified. Now let's verify your mobile number to complete the setup.
        </p>
        
        {/* Mobile Verification Section */}
        <div className={styles.mobileVerificationSection}>
          <h3>Verify Mobile Number</h3>
          <p className={styles.verificationNote}>
            <strong>Required:</strong> Mobile verification is mandatory to complete your account setup.
          </p>
          
          {!phoneVerified ? (
            <>
              <div className={styles.phoneInputSection}>
                <input
                  type="text"
                  placeholder="Enter 10-digit mobile number"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  className={styles.phoneInput}
                  disabled={showOtpInput}
                />
                {!showOtpInput && (
                  <button
                    onClick={sendPhoneOtpWithAPI}
                    disabled={loading || phoneNumber.length !== 10}
                    className={styles.primaryButton}
                  >
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                )}
              </div>
              
              {errors.phone && <div className={styles.errorMessage}>{errors.phone}</div>}
              {messages.phone && <div className={styles.successMessage}>{messages.phone}</div>}
              
              {/* OTP Input */}
              {showOtpInput && !phoneVerified && (
                <div className={styles.otpSection}>
                  <label>Enter 6-digit OTP</label>
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
            </>
          ) : (
            <div className={styles.verifiedMessage}>
              ✓ Mobile number verified successfully!
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className={styles.buttonContainer}>
          {phoneVerified ? (
            <button onClick={handleContinueToDetails} className={styles.primaryButton}>
              Continue to Complete Profile
            </button>
          ) : null}
          
          <button onClick={handleGoHome} className={styles.secondaryButton}>
            Back to Home
          </button>
        </div>
        
        <div className={styles.infoBox}>
          <p className={styles.infoText}>
            <strong>Next Steps:</strong> Mobile verification is required to continue. After verifying your phone number, you'll complete your profile with your full name, address, and create a password to finish setting up your account.
          </p>
        </div>
        
        <div className={styles.helpSection}>
          <p className={styles.helpText}>
            <strong>Need Help?</strong> If you didn't receive a verification email or need assistance, you can:
          </p>
          <button onClick={handleResendVerification} className={styles.helpButton}>
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
