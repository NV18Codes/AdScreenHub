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
    
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        
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
        console.error('❌ Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  };

  const logout = async () => {
    try {
      // Call signout API
      await authAPI.signout();
    } catch (error) {
      console.error('❌ Signout API error:', error);
      // Continue with logout even if API fails
    }
    
    // Clear local state and storage
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('emailToken');
    localStorage.removeItem('phoneToken');
    localStorage.removeItem('authToken');
    localStorage.removeItem('pendingEmail');
    
    console.log('🚪 User logged out successfully');
  };

  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      return false;
    }
    
    try {
      // Check if token is expired (basic check)
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (tokenData.exp && tokenData.exp < currentTime) {
        // Token expired, clear auth data
        logout();
        return false;
      }
      
      return !!user;
    } catch (error) {
      console.error('Token validation error:', error);
      logout();
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
