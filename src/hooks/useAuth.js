import { useState, useEffect } from 'react';
import { authAPI } from '../config/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData && userData !== 'undefined' && userData !== 'null') {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    const result = await authAPI.login(email, password);
    if (result.success && result.data && result.data.user) {
      setUser(result.data.user);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(result.data.user));
      if (result.data.token) {
        localStorage.setItem('token', result.data.token);
      }
    }
    return result;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.clear();
  };

  const startEmailVerification = async (email) => {
    return await authAPI.startEmailVerification(email);
  };

  const verifyEmail = async (selector, validator) => {
    const result = await authAPI.verifyEmail(selector, validator);
    if (result.success) {
      // Store email token for later use
      const emailToken = result.data?.data?.emailToken || result.data?.emailToken || result.data?.token || result.token;
      if (emailToken) {
        localStorage.setItem('email_verification_token', emailToken);
      }
    }
    return result;
  };

  const startPhoneVerification = async (phoneNumber) => {
    return await authAPI.startPhoneVerification(phoneNumber);
  };

  const verifyPhone = async (phoneNumber, otp) => {
    const result = await authAPI.verifyPhone(phoneNumber, otp);
    if (result.success) {
      // Store phone token for later use
      const phoneToken = result.data?.data?.phoneToken || result.data?.phoneToken || result.data?.token || result.token;
      if (phoneToken) {
        localStorage.setItem('phone_verification_token', phoneToken);
      }
    }
    return result;
  };

  const completeRegistration = async (fullName, password, phoneToken, emailToken) => {
    const result = await authAPI.completeRegistration(fullName, password, phoneToken, emailToken);
    if (result.success && result.data && result.data.user) {
      setUser(result.data.user);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(result.data.user));
      if (result.data.token) {
        localStorage.setItem('token', result.data.token);
      }
    }
    return result;
  };

  const refreshAuthState = checkAuthStatus;

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