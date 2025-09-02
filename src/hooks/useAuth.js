import { useState, useEffect, useCallback } from 'react';
import { authAPI, userAPI } from '../config/api';

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
      const result = await authAPI.startEmailVerification(email);
      
      if (result.success) {
        return { success: true, message: result.data.message || 'Verification email sent successfully' };
      } else {
        return { success: false, error: result.error || 'Failed to send verification email' };
      }
    } catch (error) {
      console.error('Email verification error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Send phone OTP
  const sendPhoneOtp = async (phoneNumber) => {
    try {
      const result = await authAPI.startPhoneVerification(phoneNumber);
      
      if (result.success) {
        return { success: true, message: result.data.message || 'OTP sent successfully' };
      } else {
        return { success: false, error: result.error || 'Failed to send OTP' };
      }
    } catch (error) {
      console.error('Phone OTP error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Verify phone OTP
  const verifyPhoneOtp = async (phoneNumber, otp) => {
    try {
      const result = await authAPI.verifyPhone(phoneNumber, otp);
      
      if (result.success) {
        return { success: true, message: result.data.message || 'Phone number verified successfully' };
      } else {
        return { success: false, error: result.error || 'Invalid OTP' };
      }
    } catch (error) {
      console.error('Phone OTP verification error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Verify email with token
  const verifyEmail = async (token) => {
    try {
      const result = await authAPI.verifyEmail(token);
      
      if (result.success) {
        return { success: true, message: result.data.message || 'Email verified successfully' };
      } else {
        return { success: false, error: result.error || 'Email verification failed' };
      }
    } catch (error) {
      console.error('Email verification error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Fetch user profile from API
  const fetchUserProfile = async (token) => {
    try {
      console.log('Fetching user profile...');
      const result = await userAPI.getProfile();
      console.log('Profile API Response:', result);
      
      if (result.success) {
        console.log('Profile data received:', result.data);
        return result.data;
      } else {
        console.log('Profile fetch failed:', result.error);
        return null;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Login function with real API
  const login = async (email, password) => {
    try {
      const result = await authAPI.login(email, password);
      
      // Log the full response for debugging
      console.log('Login API Response:', result);
      
      if (result.success) {
        const data = result.data;
        console.log('Login response data:', data);
        console.log('Login response user:', data.user);
        console.log('Login response user fullName:', data.user?.fullName);
        console.log('Login response user name:', data.user?.name);
        
        // Create initial user object for local storage
        const initialUserData = {
          id: data.user?.id || Date.now().toString(),
          email: email.toLowerCase(),
          phoneNumber: data.user?.phoneNumber || '',
          fullName: data.user?.fullName || data.user?.name || email.split('@')[0] || 'User',
          address: data.user?.address || '',
          createdAt: new Date().toISOString(),
          token: data.token || data.accessToken,
        };
        
        console.log('Initial user data:', initialUserData);
        
        // Store initial user data
        localStorage.setItem('adscreenhub_user', JSON.stringify(initialUserData));
        
        // Update state with initial data
        setUser(initialUserData);
        setIsAuthenticated(true);
        
        // Fetch complete user profile from API
        try {
          const profileData = await fetchUserProfile(data.token || data.accessToken);
          if (profileData) {
            console.log('Profile data keys:', Object.keys(profileData));
            console.log('Profile fullName:', profileData.fullName);
            console.log('Profile name:', profileData.name);
            
            // Update user data with complete profile information
            const completeUserData = {
              ...initialUserData,
              fullName: profileData.fullName || profileData.name || profileData.user?.fullName || profileData.user?.name || initialUserData.fullName,
              phoneNumber: profileData.phoneNumber || profileData.user?.phoneNumber || initialUserData.phoneNumber,
              address: profileData.address || profileData.user?.address || initialUserData.address,
              // Add any other profile fields
              ...profileData
            };
            
            console.log('Final user data fullName:', completeUserData.fullName);
            
            // Update localStorage and state with complete data
            localStorage.setItem('adscreenhub_user', JSON.stringify(completeUserData));
            setUser(completeUserData);
            
            console.log('User profile fetched successfully:', completeUserData);
          } else {
            console.log('No profile data received, using initial data');
          }
        } catch (profileError) {
          console.error('Error fetching user profile after login:', profileError);
          // Continue with initial user data if profile fetch fails
        }
        
        return { success: true, user: user, message: data.message || 'Login successful' };
      } else {
        // Handle specific error statuses
        if (result.status === 401) {
          return { 
            success: false, 
            error: result.error || 'Invalid email or password. Please check your credentials.' 
          };
        } else if (result.status === 404) {
          return { 
            success: false, 
            error: result.error || 'Account not found. Please sign up first.' 
          };
        } else {
          return { 
            success: false, 
            error: result.error || `Login failed (${result.status}). Please try again.` 
          };
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please check your connection and try again.' };
    }
  };

  // Signup function
  const signup = async (userData) => {
    try {
      const result = await authAPI.signup(userData);
      
      // Log the full response for debugging
      console.log('Signup API Response:', result);
      
      if (result.success) {
        const data = result.data;
        
        // Create initial user object for local storage
        const initialUserData = {
          id: data.user?.id || Date.now().toString(),
          email: userData.email.toLowerCase(),
          phoneNumber: userData.phoneNumber || '',
          fullName: data.user?.fullName || data.user?.name || userData.fullName || userData.email.split('@')[0] || 'User',
          address: userData.address || '',
          createdAt: new Date().toISOString(),
          token: data.token || data.accessToken,
        };
        
        // Store initial user data
        localStorage.setItem('adscreenhub_user', JSON.stringify(initialUserData));
        
        // Update state with initial data
        setUser(initialUserData);
        setIsAuthenticated(true);
        
        // Fetch complete user profile from API
        try {
          const profileData = await fetchUserProfile(data.token || data.accessToken);
          if (profileData) {
            // Update user data with complete profile information
            const completeUserData = {
              ...initialUserData,
              fullName: profileData.fullName || profileData.name || initialUserData.fullName,
              phoneNumber: profileData.phoneNumber || initialUserData.phoneNumber,
              address: profileData.address || initialUserData.address,
              // Add any other profile fields
              ...profileData
            };
            
            // Update localStorage and state with complete data
            localStorage.setItem('adscreenhub_user', JSON.stringify(completeUserData));
            setUser(completeUserData);
            
            console.log('User profile fetched successfully after signup:', completeUserData);
          }
        } catch (profileError) {
          console.error('Error fetching user profile after signup:', profileError);
          // Continue with initial user data if profile fetch fails
        }
        
        return { success: true, user: user, message: data.message || 'Signup successful' };
      } else {
        // Handle specific error statuses
        if (result.status === 400) {
          return { 
            success: false, 
            error: result.error || 'Invalid data provided. Please check your information.' 
          };
        } else if (result.status === 409) {
          return { 
            success: false, 
            error: result.error || 'Account already exists with this email.' 
          };
        } else {
          return { 
            success: false, 
            error: result.error || `Signup failed (${result.status}). Please try again.` 
          };
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Network error. Please check your connection and try again.' };
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

  // Refresh user profile data
  const refreshUserProfile = async () => {
    if (!user || !user.token) return { success: false, error: 'No user logged in' };
    
    try {
      const profileData = await fetchUserProfile(user.token);
      if (profileData) {
        const updatedUserData = {
          ...user,
          fullName: profileData.fullName || profileData.name || user.fullName,
          phoneNumber: profileData.phoneNumber || user.phoneNumber,
          address: profileData.address || user.address,
          // Add any other profile fields
          ...profileData
        };
        
        localStorage.setItem('adscreenhub_user', JSON.stringify(updatedUserData));
        setUser(updatedUserData);
        
        return { success: true, user: updatedUserData };
      } else {
        return { success: false, error: 'Failed to fetch profile data' };
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      return { success: false, error: 'Network error while fetching profile' };
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    startEmailVerification,
    verifyEmail,
    sendPhoneOtp,
    verifyPhoneOtp,
    login,
    signup,
    logout,
    updateProfile,
    hasPermission,
    getDisplayName,
    refreshAuthState,
    refreshUserProfile
  };
};
