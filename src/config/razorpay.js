// Razorpay Configuration
// For production, use environment variables
// 
// How to get your Razorpay keys:
// 1. Go to https://dashboard.razorpay.com/
// 2. Sign in or create an account
// 3. Go to Settings > API Keys
// 4. Generate Test/Live keys
// 5. Replace the keys below

// Test mode key (replace with your actual test key from Razorpay dashboard)
export const RAZORPAY_KEY_TEST = 'rzp_test_RBC4ETSsTi1taj';

// Production key (replace with your actual production key from Razorpay dashboard)
export const RAZORPAY_KEY_PROD = 'rzp_live_your_key_here';

// Automatically select the correct key based on environment
export const RAZORPAY_KEY = import.meta.env.DEV ? RAZORPAY_KEY_TEST : RAZORPAY_KEY_PROD;

// Razorpay configuration options
export const RAZORPAY_CONFIG = {
  currency: 'INR',
  name: 'AdScreenHub',
  description: 'LED Billboard Advertising',
  theme: {
    color: '#3b82f6' // Blue color matching your theme
  }
};

// Helper function to convert amount to paise (Razorpay requires amount in paise)
export const convertToPaise = (amount) => {
  return Math.round(amount * 100);
};

// Helper function to convert paise to rupees
export const convertToRupees = (paise) => {
  return paise / 100;
};
