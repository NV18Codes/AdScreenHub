const API_BASE_URL = 'https://adscreenapi-production.up.railway.app/api/v1';

// Simple API request function
const makeRequest = async (endpoint, body) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.message || data.error || 'Request failed' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const authAPI = {
  // Start email verification
  startEmailVerification: async (email) => {
    return makeRequest('/auth/start-email-verification', { email });
  },

  // Verify email with selector and validator
  verifyEmail: async (selector, validator) => {
    return makeRequest('/auth/verify-email', { selector, validator });
  },

  // Start phone verification
  startPhoneVerification: async (phoneNumber) => {
    return makeRequest('/auth/start-phone-verification', { phoneNumber });
  },

  // Verify phone OTP
  verifyPhone: async (phoneNumber, otp) => {
    return makeRequest('/auth/verify-phone', { phoneNumber, otp });
  },

  // Complete registration
  completeRegistration: async (fullName, password, phoneToken, emailToken) => {
    return makeRequest('/auth/complete-registration', {
      fullName,
      password,
      phoneToken,
      emailToken
    });
  },

  // Login
  login: async (email, password) => {
    return makeRequest('/auth/login', { email, password });
  }
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
    const isValid = validCoupons.includes(code.toUpperCase());
    const discount = code === 'FIRST50' ? 50 : code === 'SAVE20' ? 20 : 10;
    
    return isValid 
      ? { success: true, data: { valid: true, discount, message: `${discount}% discount applied!` }}
      : { success: false, error: 'Invalid coupon code' };
  }
};