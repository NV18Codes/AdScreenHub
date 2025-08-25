import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = 'http://adscreenapi-production.up.railway.app';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication state on mount and storage changes
  const checkAuthState = useCallback(() => {
    try {
      const storedUser = localStorage.getItem('adscreenhub_user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      setUser(null);
        setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, []);

  // Refresh authentication state
  const refreshAuthState = useCallback(() => {
    checkAuthState();
  }, [checkAuthState]);

  // Initialize auth state
  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  // Listen for storage changes (for multi-tab sync)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'adscreenhub_user') {
        checkAuthState();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkAuthState]);

  // Start email verification
  const startEmailVerification = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/start-email-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, message: data.message || 'Verification email sent successfully' };
      } else {
        return { success: false, error: data.message || 'Failed to send verification email' };
      }
    } catch (error) {
      console.error('Email verification error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Send phone OTP
  const sendPhoneOtp = async (phoneNumber) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/send-phone-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, message: data.message || 'OTP sent successfully' };
      } else {
        return { success: false, error: data.message || 'Failed to send OTP' };
      }
    } catch (error) {
      console.error('Phone OTP error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Verify phone OTP
  const verifyPhoneOtp = async (phoneNumber, otp) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-phone-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, otp }),
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, message: data.message || 'Phone number verified successfully' };
      } else {
        return { success: false, error: data.message || 'Invalid OTP' };
      }
    } catch (error) {
      console.error('Phone OTP verification error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Signup function with real API
  const signup = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          fullName: userData.fullName,
          phoneNumber: userData.phoneNumber,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Create user object for local storage
        const newUser = {
          id: data.user?.id || Date.now().toString(),
          email: userData.email.toLowerCase(),
          phoneNumber: userData.phoneNumber,
          fullName: userData.fullName,
          address: userData.address,
          createdAt: new Date().toISOString(),
        };
        
        // Store user data
        localStorage.setItem('adscreenhub_user', JSON.stringify(newUser));
        
        // Update state
        setUser(newUser);
        setIsAuthenticated(true);
        
        return { success: true, user: newUser, message: data.message || 'Registration successful' };
      } else {
        return { success: false, error: data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Login function with real API
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          password: password,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Create user object for local storage
        const userData = {
          id: data.user?.id || Date.now().toString(),
          email: email.toLowerCase(),
          phoneNumber: data.user?.phoneNumber || '',
          fullName: data.user?.fullName || '',
          address: data.user?.address || '',
          createdAt: new Date().toISOString(),
          token: data.token || data.accessToken,
        };
        
        // Store user data
        localStorage.setItem('adscreenhub_user', JSON.stringify(userData));
        
        // Update state
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true, user: userData, message: data.message || 'Login successful' };
      } else {
        return { success: false, error: data.message || 'Invalid email or password' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Logout function
  const logout = () => {
    try {
      localStorage.removeItem('adscreenhub_user');
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message || 'Logout failed' };
    }
  };

  // Update user profile
  const updateProfile = (updates) => {
    try {
      if (!user) {
        return { success: false, error: 'No user logged in' };
      }
      
      const updatedUser = { ...user, ...updates };
      localStorage.setItem('adscreenhub_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message || 'Profile update failed' };
    }
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    if (!user) return false;
    // Add permission logic here if needed
    return true;
  };

  // Get user's display name
  const getDisplayName = () => {
    if (!user) return '';
    return user.fullName || user.email || 'User';
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    startEmailVerification,
    sendPhoneOtp,
    verifyPhoneOtp,
    signup,
    login,
    logout,
    updateProfile,
    hasPermission,
    getDisplayName,
    refreshAuthState
  };
};
