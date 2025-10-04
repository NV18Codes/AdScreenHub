import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { API_BASE_URL, authAPI } from "../config/api";
import LoadingSpinner from "./LoadingSpinner";

const API_BASE = `${API_BASE_URL}/auth`;

export default function AuthFlow() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  
  const [step, setStep] = useState(searchParams.get('step') || "email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  
  // Store verification tokens
  const [emailToken, setEmailToken] = useState("");
  const [phoneToken, setPhoneToken] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // 🚀 NEW: Resend functionality states
  const [resendEmailTimer, setResendEmailTimer] = useState(0);
  const [resendOTPTimer, setResendOTPTimer] = useState(0);
  const [resendEmailLoading, setResendEmailLoading] = useState(false);
  const [resendOTPLoading, setResendOTPLoading] = useState(false);
  
  // 🚀 NEW: Forgot/Reset password states
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [resetOTP, setResetOTP] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [agreeToPrivacy, setAgreeToPrivacy] = useState(false);

  // Load tokens from localStorage on component mount
  useEffect(() => {
    const storedEmailToken = localStorage.getItem('emailToken');
    const storedPhoneToken = localStorage.getItem('phoneToken');
    
    console.log('Loading tokens from localStorage:', { storedEmailToken, storedPhoneToken });
    
    if (storedEmailToken) {
      setEmailToken(storedEmailToken);
    }
    if (storedPhoneToken) {
      setPhoneToken(storedPhoneToken);
    }
  }, []);

  // Check for email verification parameters on component mount
  useEffect(() => {
    const selector = searchParams.get('selector');
    const validator = searchParams.get('validator');
    
    if (selector && validator) {
      verifyEmail(selector, validator);
    }
  }, [searchParams]);

  // Handle step parameter from URL
  useEffect(() => {
    const stepParam = searchParams.get('step');
    if (stepParam && ['phone', 'otp', 'register', 'login'].includes(stepParam)) {
      setStep(stepParam);
      if (stepParam === 'phone') {
        setSuccess('Email verified! Now verify your mobile number.');
      }
    }
  }, [searchParams]);

  // Validate tokens when reaching registration step
  useEffect(() => {
    if (step === 'register') {
      const emailTokenCheck = emailToken || localStorage.getItem('emailToken');
      const phoneTokenCheck = phoneToken || localStorage.getItem('phoneToken');
      
      console.log('Registration step token validation:', {
        emailToken: emailTokenCheck ? 'present' : 'missing',
        phoneToken: phoneTokenCheck ? 'present' : 'missing'
      });
      
      if (!emailTokenCheck) {
        setError("Email verification required. Please complete email verification first.");
        setStep("email");
      } else if (!phoneTokenCheck) {
        setError("Phone verification required. Please complete phone verification first.");
        setStep("phone");
      }
    }
  }, [step, emailToken, phoneToken]);

  // 🚀 NEW: Timer effects for resend functionality
  useEffect(() => {
    let emailInterval;
    if (resendEmailTimer > 0) {
      emailInterval = setInterval(() => {
        setResendEmailTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(emailInterval);
  }, [resendEmailTimer]);

  useEffect(() => {
    let otpInterval;
    if (resendOTPTimer > 0) {
      otpInterval = setInterval(() => {
        setResendOTPTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(otpInterval);
  }, [resendOTPTimer]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Clear errors when user starts typing
    if (error) setError("");
    
    // Sanitize input based on field type
    let sanitizedValue = value;
    if (name === 'phone') {
      // Only allow digits for phone
      sanitizedValue = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'otp') {
      // Only allow digits for OTP
      sanitizedValue = value.replace(/\D/g, '').slice(0, 6);
    } else if (name === 'email') {
      // Basic email sanitization
      sanitizedValue = value.toLowerCase().trim();
    }
    
    // Update state based on field name
    switch (name) {
      case 'email':
        setEmail(sanitizedValue);
        break;
      case 'phone':
        setPhone(sanitizedValue);
        // Clear OTP when phone number changes
        setOtp('');
        break;
      case 'otp':
        setOtp(sanitizedValue);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
      case 'name':
        setName(value);
        break;
      default:
        break;
    }
  };

  // Check if email already exists (disabled - endpoint not available)
  const checkEmailExists = async (emailToCheck) => {
    try {
      // Endpoint not available yet, skip check for now
      console.log('📧 Email existence check skipped - endpoint not available');
      return false;
    } catch (err) {
      console.error('Error checking email existence:', err);
      return false;
    }
  };

  // Start email verification
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Email is required");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      // First check if email already exists
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        setError("An account with this email already exists. Please use the login form instead.");
        setLoading(false);
        return;
      }

      // Store email in localStorage for verification process
      localStorage.setItem('pendingEmail', email);
      
      const response = await axios.post(`${API_BASE}/start-email-verification`, { 
        email,
        redirectUrl: `https://ad-screenhub.netlify.app/verify-email.html`
      });
      setSuccess("Verification email sent! Please check your inbox and click the link to continue with phone verification.");
      setStep("waitForEmailVerify");
    } catch (err) {
      setError(err.response?.data?.message || "Error sending email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Verify email (after redirect with selector + validator)
  const verifyEmail = async (selector, validator) => {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await axios.post(`${API_BASE}/verify-email`, { selector, validator });
      // Store the email verification token
      if (response.data.token) {
        setEmailToken(response.data.token);
        localStorage.setItem('emailToken', response.data.token);
      }
      setSuccess("Email verified successfully!");
      setStep("phone");
    } catch (err) {
      setError("Invalid or expired verification link. Please try again.");
      setStep("email");
    } finally {
      setLoading(false);
    }
  };

  // Check if phone already exists (disabled - endpoint not available)
  const checkPhoneExists = async (phoneToCheck) => {
    try {
      // Endpoint not available yet, skip check for now
      console.log('📞 Phone existence check skipped - endpoint not available');
      return false;
    } catch (err) {
      console.error('Error checking phone existence:', err);
      return false;
    }
  };

  // Start phone verification
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (!phone || phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      // First check if phone already exists
      const phoneExists = await checkPhoneExists(phone);
      if (phoneExists) {
        setError("An account with this phone number already exists. Please use the login form instead.");
        setLoading(false);
        return;
      }

      console.log("📞 Sending OTP to phone:", phone);
      const response = await axios.post(`${API_BASE}/start-phone-verification`, { phoneNumber: phone });
      console.log("📱 Phone verification response:", response.data);
      
      // Store phone token if provided
      if (response.data.data?.phoneToken) {
        const token = response.data.data.phoneToken;
        setPhoneToken(token);
        localStorage.setItem('phoneToken', token);
        console.log("📱 Phone token stored:", token);
      }
      
      setSuccess("OTP sent to your phone!");
      setStep("otp");
    } catch (err) {
      console.error("📱 Phone verification error:", err);
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await axios.post(`${API_BASE}/verify-phone`, { phoneNumber: phone, otp });
      // Store the phone verification token
      console.log('Phone verification response:', response.data);
      if (response.data.data.phoneToken) {
        setPhoneToken(response.data.data.phoneToken);
        localStorage.setItem('phoneToken', response.data.data.phoneToken);
      }
      setSuccess("Phone verified successfully!");
      setStep("register");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Complete registration
  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    
    if (!password) {
      setError("Password is required");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (!agreeToPrivacy) {
      setError("Please agree to the Privacy Policy to continue");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      // Get tokens from localStorage if not in state
      const emailTokenToUse = emailToken || localStorage.getItem('emailToken');
      const phoneTokenToUse = phoneToken || localStorage.getItem('phoneToken');
      
      console.log('Registration tokens check:', { 
        emailToken: emailTokenToUse ? 'present' : 'missing',
        phoneToken: phoneTokenToUse ? 'present' : 'missing',
        emailTokenValue: emailTokenToUse,
        phoneTokenValue: phoneTokenToUse
      });
      
      if (!emailTokenToUse) {
        setError("Email verification token missing. Please complete email verification first.");
        setStep("email");
        return;
      }
      
      if (!phoneTokenToUse) {
        setError("Phone verification token missing. Please complete phone verification first.");
        setStep("phone");
        return;
      }
      console.log('Registration tokens check:', {
        emailToken: emailTokenToUse,
        phoneToken: phoneTokenToUse,
        name,
        password
      });
      const registrationResponse = await axios.post(`${API_BASE}/complete-registration`, {
        fullName:name,
        password,
        emailToken: emailTokenToUse,
        phoneToken: phoneTokenToUse,
      });
      
      // Registration successful - create authenticated session directly
      console.log('🔄 Registration successful, creating authenticated session...');
      
      const userEmail = localStorage.getItem('pendingEmail');
      
      // Create user object from registration data
      const newUserData = {
        email: userEmail,
        fullName: name,
        name: name,
        id: Date.now(), // Temporary ID until we get real one from API
        verified: true
      };
      
      // Create a session token
      const sessionToken = `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store user data and token
      localStorage.setItem('user', JSON.stringify(newUserData));
      localStorage.setItem('authToken', sessionToken);
      localStorage.setItem('token', sessionToken);
      
      // Clear verification tokens
      localStorage.removeItem('emailToken');
      localStorage.removeItem('phoneToken');
      localStorage.removeItem('pendingEmail');
      
      // Use the login function from AuthContext
      const loginSuccess = login(newUserData, sessionToken);
      if (!loginSuccess) {
        setError("Invalid email or password.");
        return;
      }
      
      // Debug: Check authentication status
      console.log('🔍 After login call:', {
        token: sessionToken,
        userData: newUserData,
        localStorageToken: localStorage.getItem('token'),
        localStorageUser: localStorage.getItem('user')
      });
      
      // Redirect to dashboard immediately
      setSuccess("Registration successful! Welcome to AdScreenHub!");
      
      // Force immediate redirect to avoid React state timing issues
      setTimeout(() => {
        console.log('🔍 Before redirect - checking auth status');
        navigate('/dashboard', { replace: true });
      }, 100);
      
      // Clear password fields for security
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error('Registration error:', err);
      
      if (err.response?.status === 401) {
        setError("Verification tokens have expired. Please restart the verification process.");
        // Clear expired tokens
        localStorage.removeItem('emailToken');
        localStorage.removeItem('phoneToken');
        setEmailToken("");
        setPhoneToken("");
        setStep("email");
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || "Invalid registration data. Please check your information and try again.");
      } else if (err.response?.status === 409) {
        setError("An account with this email already exists. Please try logging in instead.");
        setStep("login");
      } else if (err.code === 'NETWORK_ERROR' || !err.response) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(err.response?.data?.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      // Convert email to lowercase for case insensitive login
      const normalizedEmail = email.toLowerCase().trim();
      const res = await axios.post(`${API_BASE}/login`, { email: normalizedEmail, password });
      
      console.log('Login response:', res.data);
        if (res.data.data.user && res.data.data.session.access_token) {
        const loginSuccess = login(res.data.data.user, res.data.data.session.access_token);
        if (loginSuccess) {
          setSuccess("Logged in successfully! Redirecting...");
          localStorage.setItem("authToken", res.data.data.session.access_token);
          localStorage.setItem("user", JSON.stringify(res.data.data.user));
        } else {
          setError("Invalid email or password.");
          return;
        }
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        setError("Login successful but missing user data. Please try again.");
      }
      
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // 🚀 NEW: Resend Email Verification
  const handleResendEmail = async () => {
    if (resendEmailTimer > 0 || !email) return;
    
    setResendEmailLoading(true);
    setError("");
    
    try {
      const response = await authAPI.resendEmailVerification(email);
      
      if (response.success) {
        setSuccess("Verification email resent! Please check your inbox.");
        setResendEmailTimer(600); // 10 minutes
      } else {
        setError(response.error || "Failed to resend email. Please try again.");
      }
    } catch (err) {
      console.error('Email resend error:', err);
      setError("Failed to resend email. Please try again.");
    } finally {
      setResendEmailLoading(false);
    }
  };

  // 🚀 NEW: Resend OTP
  const handleResendOTP = async () => {
    if (resendOTPTimer > 0 || !phone) return;
    
    setResendOTPLoading(true);
    setError("");
    
    try {
      const response = await authAPI.resendOTP(phone);
      
      if (response.success) {
        setSuccess("OTP resent! Please check your phone.");
        setResendOTPTimer(300); // 5 minutes
      } else {
        setError(response.error || "Failed to resend OTP. Please try again.");
      }
    } catch (err) {
      console.error('OTP resend error:', err);
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setResendOTPLoading(false);
    }
  };

  // Initialize OTP timer when step changes to OTP
  useEffect(() => {
    if (step === "otp") {
      // Set to 5 minutes when entering OTP step
      setResendOTPTimer(300); // 5 minutes = 300 seconds
    }
  }, [step]);

  // Initialize Email timer when email is sent
  useEffect(() => {
    if (step === "waitForEmailVerify") {
      // Set to 10 minutes when entering email verification step
      setResendEmailTimer(600); // 10 minutes = 600 seconds
    }
  }, [step]);

  // 🚀 NEW: Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    console.log('🔐 Forgot Password submitted!', { forgotPasswordEmail });
    
    if (!forgotPasswordEmail) {
      setError("Email is required");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await authAPI.forgotPassword(forgotPasswordEmail);
      
      if (response.success) {
        setSuccess("Password reset OTP sent! Please check your email.");
        setStep("reset-password");
        setEmail(forgotPasswordEmail); // Store email for reset
      } else {
        setError(response.error || "Failed to send reset email. Please try again.");
      }
    } catch (err) {
      console.error('💥 Forgot password error:', err);
      setError("Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🚀 NEW: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!email || !resetOTP || !newPassword || !confirmNewPassword) {
      setError("All fields are required");
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await authAPI.resetPassword(email, resetOTP, newPassword);
      
      if (response.success) {
        setSuccess("Password reset successful! Please login with your new password.");
        // Clear reset form
        setResetOTP("");
        setNewPassword("");
        setConfirmNewPassword("");
        setForgotPasswordEmail("");
        setTimeout(() => {
          setStep("login");
        }, 2000);
      } else {
        setError(response.error || "Failed to reset password. Please try again.");
      }
    } catch (err) {
      setError("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === "otp") {
      setStep("phone");
    } else if (step === "register") {
      setStep("otp");
    } else if (step === "login") {
      setStep("register");
    } else if (step === "reset-password") {
      setStep("forgot-password");
    } else if (step === "forgot-password") {
      setStep("login");
    }
    setError("");
    setSuccess("");
  };

  const renderStep = () => {
    switch (step) {
      case "email":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">Create Your Account</h2>
              <p className="mt-2 text-gray-600">Enter your email to get started</p>
            </div>
            
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="small" text="" className="inlineSpinner" />
                    Sending...
                  </>
                ) : (
                  "Send Verification Email"
                )}
              </button>
            </form>
            
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Already have an account? <button 
                  type="button" 
                  onClick={() => setStep("login")}
                  className="text-blue-600 hover:text-blue-700 font-medium underline"
                >
                  Login
                </button>
              </p>
            </div>
          </div>
        );

      case "waitForEmailVerify":
        return (
          <div className="space-y-6 text-center">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">Check Your Email</h2>
              <p className="mt-2 text-gray-600">
                We've sent a verification link to <strong>{email}</strong>
              </p>
              <p className="mt-4 text-sm text-gray-500">
                Please click the link in your email to verify your account.
              </p>
            </div>
            
            <div className="space-y-3">
              {/* 🚀 NEW: Resend Email Button */}
              <button
                onClick={handleResendEmail}
                disabled={resendEmailTimer > 0 || resendEmailLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
{resendEmailLoading ? "Sending..." : 
                 resendEmailTimer > 0 ? `Resend Email in ${Math.floor(resendEmailTimer / 60)}:${(resendEmailTimer % 60).toString().padStart(2, '0')}` : 
                 "Resend Verification Email"}
              </button>
              
              <button
                onClick={() => setStep("email")}
                className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 font-medium"
              >
                Change Email
              </button>
            </div>
          </div>
        );

      case "phone":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">Verify Your Phone</h2>
              <p className="mt-2 text-gray-600">
                Email verified! Now let's verify your phone number.
              </p>
            </div>
            
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm min-w-[50px]">
                    +91
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    value={phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                      if (value.length <= 10) {
                        setPhone(value);
                      }
                    }}
                    placeholder="Enter 10-digit phone number"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-0"
                    maxLength="10"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="small" text="" className="inlineSpinner" />
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </button>
            </form>
          </div>
        );

      case "otp":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">Enter OTP</h2>
              <p className="mt-2 text-gray-600">
                We sent a 6-digit code to <strong>{phone}</strong>
              </p>
            </div>
            
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OTP Code
                </label>
                <input
                  type="text"
                  name="otp"
                  value={otp}
                  onChange={handleInputChange}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                  maxLength="6"
                  required
                />
              </div>
              
              <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="small" text="" className="inlineSpinner" />
                        Verifying...
                      </>
                    ) : (
                      "Verify OTP"
                    )}
                  </button>
                
                {/* 🚀 NEW: Resend OTP Button */}
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendOTPTimer > 0 || resendOTPLoading}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {resendOTPLoading ? "Sending..." : 
                   resendOTPTimer > 0 ? `Resend OTP in ${Math.floor(resendOTPTimer / 60)}:${(resendOTPTimer % 60).toString().padStart(2, '0')}` : 
                   "Resend OTP"}
                </button>
                
                <button
                  type="button"
                  onClick={goBack}
                  className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Change Phone Number
                </button>
              </div>
            </form>
          </div>
        );

      case "register":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">Complete Registration</h2>
              <p className="mt-2 text-gray-600">
                Almost done! Just a few more details to complete your account.
              </p>
              
              {/* Verification Status Indicators */}
              <div className="mt-4 flex justify-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600 font-medium">Email Verified</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600 font-medium">Phone Verified</span>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={handleInputChange}
                    placeholder="Create a password (min 6 characters)"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  id="privacy-policy"
                  name="privacy-policy"
                  type="checkbox"
                  checked={agreeToPrivacy}
                  onChange={(e) => setAgreeToPrivacy(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="privacy-policy" className="ml-2 block text-sm text-gray-700">
                  I agree to the <a href="/privacy" target="_blank" className="text-blue-600 hover:text-blue-700 underline">Privacy Policy</a>
                </label>
              </div>
              
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={goBack}
                  className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Back to OTP
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="small" text="" className="inlineSpinner" />
                      Creating Account...
                    </>
                  ) : (
                    "Complete Registration"
                  )}
                </button>
              </div>
            </form>
          </div>
        );

      case "login":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">Welcome Back!</h2>
              <p className="mt-2 text-gray-600">Sign in to your account</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.toLowerCase())}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showLoginPassword ? (
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me-auth"
                    name="remember-me-auth"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me-auth" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                
                <button
                  type="button"
                  onClick={() => setStep("forgot-password")}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot password?
                </button>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="small" text="" className="inlineSpinner" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
              
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  New here? <button 
                    type="button" 
                    onClick={() => setStep("email")}
                    className="text-blue-600 hover:text-blue-700 font-medium underline"
                  >
                    Create an account
                  </button>
                </p>
              </div>
            </form>
          </div>
        );

      // 🚀 NEW: Forgot Password Step
      case "forgot-password":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">Forgot Password?</h2>
              <p className="mt-2 text-gray-600">Enter your email to receive a reset OTP</p>
            </div>
            
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value.toLowerCase())}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="small" text="" className="inlineSpinner" />
                    Sending...
                  </>
                ) : (
                  "Send Reset OTP"
                )}
              </button>
            </form>
            
            <div className="text-center mt-4">
              <button 
                type="button" 
                onClick={() => setStep("login")}
                className="text-blue-600 hover:text-blue-700 font-medium underline"
              >
                Back to Login
              </button>
            </div>
          </div>
        );

      // 🚀 NEW: Reset Password Step
      case "reset-password":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
              <p className="mt-2 text-gray-600">
                Enter the OTP sent to <strong>{email}</strong> and your new password
              </p>
            </div>
            
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OTP Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={resetOTP}
                  onChange={(e) => setResetOTP(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                  maxLength="6"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showNewPassword ? (
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmNewPassword ? "text" : "password"}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmNewPassword ? (
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="small" text="" className="inlineSpinner" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
            
            <div className="text-center mt-4">
              <button 
                type="button" 
                onClick={() => setStep("forgot-password")}
                className="text-blue-600 hover:text-blue-700 font-medium underline"
              >
                Back to Email Entry
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4" style={{ paddingTop: '6rem' }}>
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-200">
        {renderStep()}
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg animate-fadeIn">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 text-red-500">⚠️</div>
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg animate-fadeIn">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 text-green-500">✅</div>
              <p className="text-green-600 text-sm font-medium">{success}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
