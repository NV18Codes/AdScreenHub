// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://adscreenapi-production.up.railway.app/api/v1';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  VERIFY_EMAIL: '/auth/verify-email',
  START_EMAIL_VERIFICATION: '/auth/start-email-verification',
  START_PHONE_VERIFICATION: '/auth/start-phone-verification',
  VERIFY_PHONE: '/auth/verify-phone',
  REFRESH_TOKEN: '/auth/refresh-token',
  LOGOUT: '/auth/logout',
  
  // User Management
  GET_PROFILE: '/user/profile',
  UPDATE_PROFILE: '/user/profile',
  DELETE_ACCOUNT: '/user/account',
  
  // Orders
  CREATE_ORDER: '/orders',
  GET_ORDERS: '/orders',
  GET_ORDER_BY_ID: '/orders',
  UPDATE_ORDER: '/orders',
  CANCEL_ORDER: '/orders',
  
  // Screens
  GET_SCREENS: '/screens',
  GET_SCREEN_BY_ID: '/screens',
  
  // Plans
  GET_PLANS: '/plans',
  GET_PLAN_BY_ID: '/plans',
  
  // Coupons
  VALIDATE_COUPON: '/coupons/validate',
  
  // File Upload
  UPLOAD_FILE: '/upload',
};

// API Utility Functions
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Add authorization header if token exists
  const token = localStorage.getItem('adscreenhub_user');
  if (token) {
    try {
      const userData = JSON.parse(token);
      if (userData.token) {
        defaultOptions.headers.Authorization = `Bearer ${userData.token}`;
      }
    } catch (error) {
      console.error('Error parsing user token:', error);
    }
  }

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Non-JSON response received:', response.status, response.statusText);
      return {
        success: false,
        error: `Server error: ${response.status} ${response.statusText}`,
        status: response.status
      };
    }

    const data = await response.json();
    
    return {
      success: response.ok,
      data,
      error: response.ok ? null : data.message || `Request failed with status ${response.status}`,
      status: response.status
    };
  } catch (error) {
    console.error('API request error:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
      status: 0
    };
  }
};

// Specific API functions
export const authAPI = {
  login: async (email, password) => {
    return apiRequest(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({
        email: email.toLowerCase(),
        password,
      }),
    });
  },

  signup: async (userData) => {
    return apiRequest(API_ENDPOINTS.SIGNUP, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  verifyEmail: async (token) => {
    return apiRequest(API_ENDPOINTS.VERIFY_EMAIL, {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  startEmailVerification: async (email) => {
    return apiRequest(API_ENDPOINTS.START_EMAIL_VERIFICATION, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  startPhoneVerification: async (phoneNumber) => {
    return apiRequest(API_ENDPOINTS.START_PHONE_VERIFICATION, {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    });
  },

  verifyPhone: async (phoneNumber, otp) => {
    return apiRequest(API_ENDPOINTS.VERIFY_PHONE, {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, otp }),
    });
  },

  refreshToken: async () => {
    return apiRequest(API_ENDPOINTS.REFRESH_TOKEN, {
      method: 'POST',
    });
  },

  logout: async () => {
    return apiRequest(API_ENDPOINTS.LOGOUT, {
      method: 'POST',
    });
  },
};

export const userAPI = {
  getProfile: async () => {
    return apiRequest(API_ENDPOINTS.GET_PROFILE);
  },

  updateProfile: async (profileData) => {
    return apiRequest(API_ENDPOINTS.UPDATE_PROFILE, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  deleteAccount: async () => {
    return apiRequest(API_ENDPOINTS.DELETE_ACCOUNT, {
      method: 'DELETE',
    });
  },
};

export const ordersAPI = {
  createOrder: async (orderData) => {
    return apiRequest(API_ENDPOINTS.CREATE_ORDER, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  getOrders: async (userId) => {
    return apiRequest(`${API_ENDPOINTS.GET_ORDERS}?userId=${userId}`);
  },

  getOrderById: async (orderId) => {
    return apiRequest(`${API_ENDPOINTS.GET_ORDER_BY_ID}/${orderId}`);
  },

  updateOrder: async (orderId, orderData) => {
    return apiRequest(`${API_ENDPOINTS.UPDATE_ORDER}/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
  },

  cancelOrder: async (orderId) => {
    return apiRequest(`${API_ENDPOINTS.CANCEL_ORDER}/${orderId}`, {
      method: 'DELETE',
    });
  },
};

export const screensAPI = {
  getScreens: async () => {
    return apiRequest(API_ENDPOINTS.GET_SCREENS);
  },

  getScreenById: async (screenId) => {
    return apiRequest(`${API_ENDPOINTS.GET_SCREEN_BY_ID}/${screenId}`);
  },
};

export const plansAPI = {
  getPlans: async () => {
    return apiRequest(API_ENDPOINTS.GET_PLANS);
  },

  getPlanById: async (planId) => {
    return apiRequest(`${API_ENDPOINTS.GET_PLAN_BY_ID}/${planId}`);
  },
};

export const couponsAPI = {
  validateCoupon: async (couponCode) => {
    return apiRequest(`${API_ENDPOINTS.VALIDATE_COUPON}?code=${couponCode}`);
  },
};

export const uploadAPI = {
  uploadFile: async (file, orderId) => {
    const formData = new FormData();
    formData.append('file', file);
    if (orderId) {
      formData.append('orderId', orderId);
    }

    return apiRequest(API_ENDPOINTS.UPLOAD_FILE, {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData, let browser set it
      },
      body: formData,
    });
  },
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  apiRequest,
  authAPI,
  userAPI,
  ordersAPI,
  screensAPI,
  plansAPI,
  couponsAPI,
  uploadAPI,
};
