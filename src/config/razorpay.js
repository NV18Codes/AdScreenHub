export const RAZORPAY_KEY_TEST = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_RBC4ETSsTi1taj';
export const RAZORPAY_KEY_PROD = import.meta.env.VITE_RAZORPAY_KEY_PROD || 'rzp_live_your_key_here';
export const RAZORPAY_KEY = RAZORPAY_KEY_TEST;

export const RAZORPAY_CONFIG = {
  currency: 'INR',
  name: import.meta.env.VITE_APP_NAME || 'AdScreenHub',
  description: import.meta.env.VITE_APP_DESCRIPTION || 'LED Billboard Advertising',
  theme: {
    color: '#3b82f6'
  }
};

export const convertToPaise = (amount) => {
  return Math.round(amount * 100);
};

export const convertToRupees = (paise) => {
  return paise / 100;
};
