const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://adscreenapi-production.up.railway.app/api/v1';

// Centralized API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    START_EMAIL_VERIFICATION: '/auth/start-email-verification',
    VERIFY_EMAIL: '/auth/verify-email',
    START_PHONE_VERIFICATION: '/auth/start-phone-verification',
    VERIFY_PHONE: '/auth/verify-phone',
    COMPLETE_REGISTRATION: '/auth/complete-registration',
    LOGIN: '/auth/login'
  }
};

// Optimized API request function
const makeRequest = async (endpoint, body = null, method = 'POST', customHeaders = {}) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...customHeaders
      },
      body: method !== 'GET' ? JSON.stringify(body) : undefined,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    let data;
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (response.ok) {
      return { success: true, data };
    } else {
      return {
        success: false,
        error:
          data.message ||
          data.error ||
          response.statusText ||
          `Request failed with status ${response.status}`
      };
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      return { success: false, error: 'Request timeout. Please try again.' };
    }
    return { success: false, error: error.message || 'Network error' };
  }
};

// Authentication API
export const authAPI = {
  startEmailVerification: (email, redirectUrl) => 
    makeRequest('/auth/start-email-verification', { email, redirectUrl }),
  
  verifyEmail: (selector, validator) => 
    makeRequest('/auth/verify-email', { selector, validator }),
  
  startPhoneVerification: (phoneNumber) => 
    makeRequest('/auth/start-phone-verification', { phoneNumber }),
  
  verifyPhone: (phoneNumber, otp) => 
    makeRequest('/auth/verify-phone', { phoneNumber, otp }),
  
  register: (email, phoneNumber, name, password) => 
    makeRequest('/auth/complete-registration', { email, phoneNumber, name, password }),
  
  login: (email, password) => 
    makeRequest('/auth/login', { email, password })
};

// Demo APIs
export const ordersAPI = {
  createOrder: () => ({ success: true, data: { id: Date.now() } }),
  getOrders: () => ({ success: true, data: [] }),
  getOrderById: () => ({ success: true, data: null }),
  updateOrder: (id, data) => ({ success: true, data: { id, ...data } }),
  cancelOrder: (id) => ({ success: true, data: { id, status: 'cancelled' } })
};

export const couponsAPI = {
  validateCoupon: (code) => {
    const validCoupons = ['WELCOME10', 'SAVE20', 'FIRST50'];
    const normalized = code.toUpperCase();
    const isValid = validCoupons.includes(normalized);

    const discount =
      normalized === 'FIRST50' ? 50 : normalized === 'SAVE20' ? 20 : 10;

    return isValid
      ? {
        success: true,
        data: { valid: true, discount, message: `${discount}% discount applied!` }
      }
      : { success: false, error: 'Invalid coupon code' };
  }
};
