import React, { createContext, useContext, useState, useEffect } from 'react';

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
    
    console.log('🔍 AuthContext Debug - Initial Load:');
    console.log('Token exists:', !!token);
    console.log('User data exists:', !!userData);
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('📋 Parsed User Object:', parsedUser);
        console.log('📋 User Object Keys:', Object.keys(parsedUser));
        console.log('📋 User Object Values:', Object.values(parsedUser));
        console.log('📋 User Object Type:', typeof parsedUser);
        
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
        console.log('📋 Possible Name Fields:', {
          fullName: parsedUser.fullName,
          name: parsedUser.name,
          firstName: parsedUser.firstName,
          lastName: parsedUser.lastName,
          displayName: parsedUser.displayName,
          username: parsedUser.username,
          email: parsedUser.email,
          emailPrefix: parsedUser.email?.split('@')[0]
        });
        
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
    console.log('🔍 AuthContext Debug - Login:');
    console.log('📋 Login User Data:', userData);
    console.log('📋 Login User Data Keys:', Object.keys(userData));
    console.log('📋 Login User Data Values:', Object.values(userData));
    console.log('📋 Login User Data Type:', typeof userData);
    
    // Check for different possible name fields
    console.log('📋 Login Name Fields:', {
      fullName: userData.fullName,
      name: userData.name,
      firstName: userData.firstName,
      lastName: userData.lastName,
      displayName: userData.displayName,
      username: userData.username,
      email: userData.email,
      emailPrefix: userData.email?.split('@')[0]
    });
    
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('emailToken');
    localStorage.removeItem('phoneToken');
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
