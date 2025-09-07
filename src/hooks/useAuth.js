import { useState, useEffect } from 'react';
import { authAPI } from '../config/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    refreshAuthState();
  }, []);

  const refreshAuthState = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  };

  const login = async (email, password) => {
    const result = await authAPI.login(email, password);
    if (result.success) {
      setUser(result.data.user);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(result.data.user));
      localStorage.setItem('token', result.data.token);
    }
    return result;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('email_verification_token');
    localStorage.removeItem('phone_verification_token');
    localStorage.removeItem('verified_email');
    localStorage.removeItem('verified_phone');
  };

  const startEmailVerification = async (email) => {
    return await authAPI.startEmailVerification(email);
  };

  const verifyEmail = async (selector, validator) => {
    const result = await authAPI.verifyEmail(selector, validator);
    console.log('📧 Full email verification response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      // Try multiple possible token locations - check for nested data structure
      const emailToken = result.data?.data?.emailToken || result.data?.emailToken || result.data?.token || result.token;
      console.log('📧 Email token found:', emailToken);
      
      if (emailToken) {
        localStorage.setItem('email_verification_token', emailToken);
        console.log('✅ Email token stored successfully');
      } else {
        console.log('❌ No email token found in API response');
        // Don't store any token if API doesn't provide one
      }
    }
    return result;
  };

  const startPhoneVerification = async (phoneNumber) => {
    return await authAPI.startPhoneVerification(phoneNumber);
  };

  const verifyPhone = async (phoneNumber, otp) => {
    const result = await authAPI.verifyPhone(phoneNumber, otp);
    console.log('📱 Full phone verification response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      // Try multiple possible token locations - the API response shows it's at result.data.data.phoneToken
      const phoneToken = result.data?.data?.phoneToken || result.data?.phoneToken || result.data?.token || result.token;
      console.log('📱 Phone token found:', phoneToken);
      
      if (phoneToken) {
        localStorage.setItem('phone_verification_token', phoneToken);
        console.log('✅ Phone token stored successfully');
      } else {
        console.log('❌ No phone token found in API response');
        // Don't store any token if API doesn't provide one
      }
    }
    return result;
  };

  const completeRegistration = async (fullName, password, phoneToken, emailToken) => {
    const result = await authAPI.completeRegistration(fullName, password, phoneToken, emailToken);
    if (result.success) {
      setUser(result.data.user);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(result.data.user));
      localStorage.setItem('token', result.data.token);
    }
    return result;
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    refreshAuthState,
    login,
    logout,
    startEmailVerification,
    verifyEmail,
    startPhoneVerification,
    verifyPhone,
    completeRegistration
  };
};