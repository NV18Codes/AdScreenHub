import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { API_BASE_URL} from "../config/api";

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
      // Store email in localStorage for verification process
      localStorage.setItem('pendingEmail', email);
      
      const response = await axios.post(`${API_BASE}/start-email-verification`, { 
        email,
        redirectUrl: `https://ad-screenhub.netlify.app/verify-email.html`
      });
      setSuccess("Verification email sent! Please check your inbox and click the link.");
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
      await axios.post(`${API_BASE}/start-phone-verification`, { phoneNumber: phone });
      setSuccess("OTP sent to your phone!");
      setStep("otp");
    } catch (err) {
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
      await axios.post(`${API_BASE}/complete-registration`, {
        fullName:name,
        password,
        emailToken: emailTokenToUse,
        phoneToken: phoneTokenToUse,
      });
      setSuccess("Registration successful! Please log in.");
      setStep("login");
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
        login(res.data.data.user, res.data.data.session.access_token);
        setSuccess("Logged in successfully! Redirecting...");
        localStorage.setItem("authToken", res.data.data.session.access_token);
        localStorage.setItem("user", JSON.stringify(res.data.data.user));
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

  const goBack = () => {
    if (step === "otp") {
      setStep("phone");
    } else if (step === "register") {
      setStep("otp");
    } else if (step === "login") {
      setStep("register");
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
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? "Sending..." : "Send Verification Email"}
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
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> After clicking the email link, you'll be redirected to our production site. Once you see "Email verified successfully!", come back to this tab and click "I've Verified My Email" below.
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
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
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
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
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength="10"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
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
                  type="button"
                  onClick={goBack}
                  className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Change Phone Number
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
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
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Account...</span>
                    </div>
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
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? "Signing In..." : "Sign In"}
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

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
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
