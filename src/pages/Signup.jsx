import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from '../styles/Signup.module.css';

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { startEmailVerification, verifyEmail, startPhoneVerification, verifyPhone } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    fullName: '',
    password: '',
    confirmPassword: ''
  });

  const [verificationState, setVerificationState] = useState({
    emailVerified: false,
    phoneVerified: false,
    otpSent: false,
    otp: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const email = searchParams.get('email');
    const verified = searchParams.get('verified');
    
    if (email) setFormData(prev => ({ ...prev, email }));
    if (verified === 'true' || localStorage.getItem('verified_email')) {
      setVerificationState(prev => ({ ...prev, emailVerified: true }));
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleEmailVerification = async (e) => {
    e.preventDefault();
    if (!formData.email) return setErrors({ email: 'Email is required' });

    setLoading(true);
    const result = await startEmailVerification(formData.email);
    setLoading(false);

    if (result.success) {
      alert('Verification email sent! Check your inbox.');
    } else {
      setErrors({ email: result.error });
    }
  };

  const handlePhoneVerification = async (e) => {
    e.preventDefault();
    if (!formData.phoneNumber) return setErrors({ phoneNumber: 'Phone number is required' });

    setLoading(true);
    const result = await startPhoneVerification(formData.phoneNumber);
    setLoading(false);

    if (result.success) {
      setVerificationState(prev => ({ ...prev, otpSent: true }));
      alert('OTP sent to your phone!');
    } else {
      setErrors({ phoneNumber: result.error });
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    if (!verificationState.otp) return setErrors({ otp: 'OTP is required' });

    setLoading(true);
    const result = await verifyPhone(formData.phoneNumber, verificationState.otp);
    setLoading(false);

    if (result.success) {
      setVerificationState(prev => ({ ...prev, phoneVerified: true }));
      alert('Phone verified successfully!');
      navigate('/complete-profile', { state: formData });
    } else {
      setErrors({ otp: result.error });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setErrors({ confirmPassword: 'Passwords do not match' });
    }

    setLoading(true);
    const result = await verifyPhone(formData.phoneNumber, verificationState.otp);
    setLoading(false);

    if (result.success) {
      setVerificationState(prev => ({ ...prev, phoneVerified: true }));
      navigate('/complete-profile', { state: formData });
    } else {
      setErrors({ otp: result.error });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2>Create Account</h2>
        
        {!verificationState.emailVerified ? (
          <form onSubmit={handleEmailVerification}>
            <div className={styles.inputGroup}>
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
              />
              {errors.email && <span className={styles.error}>{errors.email}</span>}
            </div>
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Sending...' : 'Send Verification Email'}
            </button>
          </form>
        ) : !verificationState.phoneVerified ? (
          <div>
            <div className={styles.successMessage}>
              ✅ Email verified successfully!
            </div>
            
            {!verificationState.otpSent ? (
              <form onSubmit={handlePhoneVerification}>
                <div className={styles.inputGroup}>
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    required
                  />
                  {errors.phoneNumber && <span className={styles.error}>{errors.phoneNumber}</span>}
                </div>
                <button type="submit" className={styles.submitButton} disabled={loading}>
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpVerification}>
                <div className={styles.inputGroup}>
                  <label>Enter OTP</label>
                  <input
                    type="text"
                    value={verificationState.otp}
                    onChange={(e) => setVerificationState(prev => ({ ...prev, otp: e.target.value }))}
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                    required
                  />
                  {errors.otp && <span className={styles.error}>{errors.otp}</span>}
                </div>
                <button type="submit" className={styles.submitButton} disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className={styles.successMessage}>
            ✅ All verifications complete! Redirecting...
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;