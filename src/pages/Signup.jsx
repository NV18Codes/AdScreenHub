import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from '../styles/Signup.module.css';

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { startEmailVerification, startPhoneVerification, verifyPhone } = useAuth();

  const [step, setStep] = useState('email');
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: ''
  });
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is coming back from email verification
    const email = searchParams.get('email');
    const verified = searchParams.get('verified');
    
    if (email) {
      setFormData(prev => ({ ...prev, email }));
    }
    
    // If verified=true in URL or email_verified in localStorage, go to phone step
    if (verified === 'true' || localStorage.getItem('email_verified') === 'true') {
      setStep('phone');
    }
  }, [searchParams]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setErrors({ email: 'Email is required' });
      return;
    }

    setLoading(true);
    setErrors({});
    
    const result = await startEmailVerification(formData.email);
    setLoading(false);

    if (result.success) {
      alert('Verification email sent! Please check your inbox and click the verification link.');
    } else {
      setErrors({ email: result.error });
    }
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (!formData.phoneNumber) {
      setErrors({ phoneNumber: 'Phone number is required' });
      return;
    }

    setLoading(true);
    setErrors({});
    
    const result = await startPhoneVerification(formData.phoneNumber);
    setLoading(false);

    if (result.success) {
      setStep('otp');
      alert('OTP sent to your phone! Please check your messages.');
    } else {
      setErrors({ phoneNumber: result.error });
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      setErrors({ otp: 'OTP is required' });
      return;
    }

    setLoading(true);
    setErrors({});
    
    const result = await verifyPhone(formData.phoneNumber, otp);
    setLoading(false);

    if (result.success) {
      alert('Phone verified successfully!');
      navigate('/complete-profile');
    } else {
      setErrors({ otp: result.error });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Create Account</h2>
        
        {step === 'email' && (
          <form onSubmit={handleEmailSubmit}>
            <div className={styles.inputGroup}>
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email"
                required
              />
              {errors.email && <span className={styles.error}>{errors.email}</span>}
            </div>
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Sending...' : 'Send Verification Email'}
            </button>
          </form>
        )}

        {step === 'phone' && (
          <div>
            <div className={styles.successMessage}>
              ✅ Email verified successfully!
            </div>
            <form onSubmit={handlePhoneSubmit}>
              <div className={styles.inputGroup}>
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="Enter your phone number"
                  required
                />
                {errors.phoneNumber && <span className={styles.error}>{errors.phoneNumber}</span>}
              </div>
              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          </div>
        )}

        {step === 'otp' && (
          <div>
            <div className={styles.successMessage}>
              ✅ Email verified successfully!
            </div>
            <form onSubmit={handleOtpSubmit}>
              <div className={styles.inputGroup}>
                <label>Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;