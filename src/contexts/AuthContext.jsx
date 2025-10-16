import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const deletedAccount = localStorage.getItem('deletedAccount');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        
        // Check if this account was previously deleted
        if (deletedAccount) {
          const deletedData = JSON.parse(deletedAccount);
          if (deletedData.email === parsedUser.email || deletedData.id === parsedUser.id) {
            // Account was deleted, clear auth data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('emailToken');
            localStorage.removeItem('phoneToken');
            localStorage.removeItem('authToken');
            localStorage.removeItem('pendingEmail');
            setUser(null);
            setLoading(false);
            return;
          }
        }
        
        // Check for different possible name fields
        const possibleNames = [
          parsedUser.fullName,
          parsedUser.name,
          parsedUser.firstName,
          parsedUser.lastName,
          parsedUser.displayName,
          parsedUser.username,
          parsedUser.email?.split('@')[0]
        ];
        
        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
    
    // Listen for session expiry events
    const handleSessionExpired = () => {
      // Clear all auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('emailToken');
      localStorage.removeItem('phoneToken');
      localStorage.removeItem('pendingEmail');
      localStorage.removeItem('adscreenhub_orders');
      
      setUser(null);
      
      // Redirect to login page
      window.location.href = '/auth?expired=true';
    };
    
    window.addEventListener('auth:session-expired', handleSessionExpired);
    
    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, []);

  const login = (userData, token) => {
    // Check if this account was previously deleted
    const deletedAccount = localStorage.getItem('deletedAccount');
    if (deletedAccount) {
      const deletedData = JSON.parse(deletedAccount);
      // Check if the email matches a deleted account
      if (deletedData.email === userData.email || deletedData.id === userData.id) {
        return false;
      }
    }
    
    // Clear any existing orders to prevent showing other users' data
    localStorage.removeItem('adscreenhub_orders');
    
    // Ensure userData has required fields
    const validUserData = {
      ...userData,
      id: userData.id || userData.user_id || userData.sub,
      email: userData.email,
      fullName: userData.fullName || userData.full_name || userData.name || userData.email?.split('@')[0]
    };
    
    setUser(validUserData);
    localStorage.setItem('user', JSON.stringify(validUserData));
    localStorage.setItem('token', token);
    
    // Force a small delay to ensure state is updated
    setTimeout(() => {
      // Trigger a custom event to notify components that auth state has changed
      window.dispatchEvent(new CustomEvent('auth:login-success'));
    }, 100);
    
    return true;
  };

  const updateUser = (updatedUserData) => {
    const newUserData = { ...user, ...updatedUserData };
    setUser(newUserData);
    localStorage.setItem('user', JSON.stringify(newUserData));
  };

  const logout = async () => {
    try {
      // Call signout API to terminate session on server
      const signoutResponse = await authAPI.signout();
      console.log('Signout API response:', signoutResponse);
    } catch (error) {
      // Continue with logout even if API fails
      console.warn('Signout API failed, but continuing with local logout:', error);
    }
    
    // Clear local state and storage
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('emailToken');
    localStorage.removeItem('phoneToken');
    localStorage.removeItem('authToken');
    localStorage.removeItem('pendingEmail');
    localStorage.removeItem('adscreenhub_orders'); // Clear orders on logout
    
    // Dispatch logout event for other components to listen
    window.dispatchEvent(new CustomEvent('auth:logout-success'));
  };

  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      return false;
    }
    
    try {
      // Check if it's a custom session token (from registration)
      if (token.startsWith('reg_')) {
        // Custom session token - always valid until user logs out
        return true;
      }
      
      // Check if user data exists and is valid
      const parsedUser = JSON.parse(userData);
      if (parsedUser && parsedUser.id) {
        return true;
      }
      
      // Check if token is a JWT and if it's expired
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (tokenData.exp && tokenData.exp < currentTime) {
        // Token expired, clear auth data
        logout();
        return false;
      }
      
      return !!user;
    } catch (error) {
      logout();
      return false;
    }
  };

  const isAdmin = () => {
    if (!user) return false;
    // Check if user has admin role - check multiple possible field names
    return user.user_role === 'admin' || 
           user.role === 'admin' || 
           user.userType === 'admin' || 
           user.is_admin === true;
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      updateUser,
      isAuthenticated,
      isAdmin,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
