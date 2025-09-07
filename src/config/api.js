const API_BASE_URL = 'https://adscreenapi-production.up.railway.app/api/v1';

const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const authAPI = {
  login: async (email, password) => {
    return apiRequest('/auth/login', {
      body: JSON.stringify({ email, password })
    });
  },

  startEmailVerification: async (email) => {
    return apiRequest('/auth/start-email-verification', {
      body: JSON.stringify({ email })
    });
  },

  verifyEmail: async (selector, validator) => {
    return apiRequest('/auth/verify-email', {
      body: JSON.stringify({ selector, validator })
    });
  },

  startPhoneVerification: async (phoneNumber) => {
    return apiRequest('/auth/start-phone-verification', {
      body: JSON.stringify({ phoneNumber })
    });
  },

  verifyPhone: async (phoneNumber, otp) => {
    return apiRequest('/auth/verify-phone', {
      body: JSON.stringify({ phoneNumber, otp })
    });
  },

  completeRegistration: async (fullName, password, phoneToken, emailToken) => {
    const requestBody = { fullName, password, phoneToken, emailToken };
    
    console.log('🔐 Complete Registration Request:', {
      url: `${API_BASE_URL}/auth/complete-registration`,
      body: requestBody,
      phoneTokenLength: phoneToken?.length || 0,
      emailTokenLength: emailToken?.length || 0
    });
    
    const response = await fetch(`${API_BASE_URL}/auth/complete-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    console.log('📥 Complete Registration Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    const data = await response.json();
    console.log('📥 Complete Registration Response Data:', data);
    
    if (!response.ok) {
      return { success: false, error: data.message || `API Error: ${response.status} - ${data.message || response.statusText}` };
    }
    
    return { success: true, data };
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