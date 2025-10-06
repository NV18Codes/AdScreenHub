import { API_BASE_URL } from './constants.js';

// Re-export API_BASE_URL for backward compatibility
export { API_BASE_URL };

// Centralized API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    START_EMAIL_VERIFICATION: '/auth/start-email-verification',
    VERIFY_EMAIL: '/auth/verify-email',
    START_PHONE_VERIFICATION: '/auth/start-phone-verification',
    VERIFY_PHONE: '/auth/verify-phone',
    COMPLETE_REGISTRATION: '/auth/complete-registration',
    LOGIN: '/auth/login',
    RESEND_OTP: '/auth/resend-otp',
    RESEND_EMAIL: '/auth/resend-email-verification',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    DELETE_ACCOUNT: '/auth/delete-account',
    SIGNOUT: '/auth/signout'
  },
  DATA: {
    GET_LOCATIONS_BY_DATE: '/data/locations/availability',
    GET_PLANS: '/data/plans',
    GET_PLANS_BY_LOCATION: '/data/plans/location',
    CHECK_AVAILABILITY: '/data/availability',
    PRECHECK_PLAN_AVAILABILITY: '/data/plans/precheck-availability'
  },
  FILES: {
    GET_SIGNED_UPLOAD_URL: '/files/signed-upload-url',
    // Alternative patterns to try
    GET_UPLOAD_URL: '/files/upload-url',
    GET_SIGNED_URL: '/files/signed-url',
    UPLOAD: '/upload'
  },
  ORDERS: {
    INITIATE: '/orders/initiate',
    VERIFY_PAYMENT: '/orders/verify-payment',
    GET_ORDERS: '/orders',
    // Alternative patterns to try
    CREATE: '/orders/create',
    BOOK: '/orders/book'
  },
  CONTACT: {
    SUBMIT: '/contact'
  }
};

// Optimized API request function
const makeRequest = async (endpoint, body = null, method = 'POST', customHeaders = {}) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const token = localStorage.getItem('token');
    

    const fullUrl = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(fullUrl, {
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
    } catch (jsonError) {
      data = {};
    }

    if (response.ok) {
      return { success: true, data };
    } else {
      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        // Optionally redirect to login or refresh token here
      }
      
      const errorMessage = data.message || data.error || response.statusText || `Request failed with status ${response.status}`;
      return {
        success: false,
        error: errorMessage,
        statusCode: response.status
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

  register: (email, fullName, phoneNumber, name, password) => 
    makeRequest('/auth/complete-registration', { email, fullName, phoneNumber, name, password }),

  login: (email, password) => 
    makeRequest('/auth/login', { email, password }),

  // 🚀 NEW API INTEGRATIONS
  resendOTP: (phoneNumber) => 
    makeRequest('/auth/resend-otp', { phoneNumber }),

  resendEmailVerification: (email) => 
    makeRequest('/auth/resend-email-verification', { email }),

  forgotPassword: (email) => 
    makeRequest('/auth/forgot-password', { email }),

  resetPassword: (email, otp, password) => 
    makeRequest('/auth/reset-password', { email, otp, password }),

  deleteAccount: (password) => 
    makeRequest('/auth/delete-account', { password }),

  signout: () => 
    makeRequest('/auth/signout', {})
};

// Data APIs - REAL ENDPOINTS ONLY
export const dataAPI = {
  getPlans: () => makeRequest(API_ENDPOINTS.DATA.GET_PLANS, null, 'GET'),
  
  getLocationAvailability: (date) => 
    makeRequest(`${API_ENDPOINTS.DATA.GET_LOCATIONS_BY_DATE}/${date}`, null, 'GET'),
  
  getPlansByLocation: (locationId) => 
    makeRequest(`${API_ENDPOINTS.DATA.GET_PLANS_BY_LOCATION}/${locationId}`, null, 'GET'),
  
  checkAvailability: (locationId, planId, startDate) => 
    makeRequest(`${API_ENDPOINTS.DATA.CHECK_AVAILABILITY}/${locationId}?planId=${planId}&startDate=${startDate}`, null, 'GET'),
  
  precheckPlanAvailability: (locationId, startDate, durationDays) => 
    makeRequest(API_ENDPOINTS.DATA.PRECHECK_PLAN_AVAILABILITY, { 
      locationId, 
      startDate, 
      durationDays 
    })
};

// File Upload APIs - REAL ENDPOINTS ONLY
export const filesAPI = {
  getSignedUploadUrl: (fileName, fileType) => 
    makeRequest(API_ENDPOINTS.FILES.GET_SIGNED_UPLOAD_URL, { fileName, fileType })
};

// Order APIs - REAL ENDPOINTS ONLY
export const ordersAPI = {
  initiateOrder: (orderData) => 
    makeRequest(API_ENDPOINTS.ORDERS.INITIATE, orderData),
  
  verifyPayment: (verificationData) => 
    makeRequest(API_ENDPOINTS.ORDERS.VERIFY_PAYMENT, verificationData),
  
  getOrders: () => 
    makeRequest(`${API_ENDPOINTS.ORDERS.GET_ORDERS}?limit=1000`, null, 'GET'),
  
  // Alternative order endpoints to try
  getAllOrders: () => 
    makeRequest('/orders/all?limit=1000', null, 'GET'),
  
  getUserOrders: () => 
    makeRequest('/orders/user?limit=1000', null, 'GET')
};

export const contactAPI = {
  submitContactForm: (formData) => 
    makeRequest(API_ENDPOINTS.CONTACT.SUBMIT, formData)
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
