// Validation utilities for the application

// Date validation
export const isDateDisabled = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(date);
  return selectedDate < today;
};

// File validation
export const validateFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please upload JPG, PNG, GIF, or WebP images only.' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size too large. Please upload files smaller than 10MB.' };
  }
  
  return { valid: true };
};

// Generate order ID
export const generateOrderId = () => {
  // Generate a simple 6-digit number
  const random = Math.floor(100000 + Math.random() * 900000);
  return `${random}`;
};

// Image compression
export const compressImage = (file, maxWidth = 1920, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Storage quota management
export const manageStorageQuota = () => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    return navigator.storage.estimate().then(estimate => {
      const used = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percentage = (used / quota) * 100;
      
      return {
        used,
        quota,
        percentage,
        available: quota - used
      };
    });
  }
  
  return Promise.resolve({
    used: 0,
    quota: 0,
    percentage: 0,
    available: 0
  });
};

// Format date
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

// GST number validation with proper Indian GSTIN format
export const validateGSTNumber = (gstNumber) => {
  if (!gstNumber) {
    return { valid: false, error: 'GST number is required' };
  }
  
  // Remove any spaces or special characters and convert to uppercase
  const cleanGST = gstNumber.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  
  // Check length first
  if (cleanGST.length !== 15) {
    return { 
      valid: false, 
      error: 'GST number must be exactly 15 characters' 
    };
  }
  
  // Indian GSTIN format: 2 digits (state code) + 10 characters (PAN: 5 letters + 4 digits + 1 letter) + 1 digit (entity code) + 1 letter (default alphabet Z) + 1 digit/letter (checksum)
  // Format: XXAAAAA0000AZ5
  // Where: XX = state code (2 digits), AAAAA = first 5 letters of PAN, 0000 = 4 digits of PAN, A = last letter of PAN, Z = default alphabet, 5 = checksum
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
  
  if (!gstRegex.test(cleanGST)) {
    return { 
      valid: false, 
      error: 'Invalid GST number format. Expected format: 27ABCDE1234F1Z5 (2 digits + 5 letters + 4 digits + 1 letter + 1 digit/letter + Z + 1 digit/letter)' 
    };
  }
  
  // Additional validation: Check if state code is valid (01-37 for Indian states)
  const stateCode = parseInt(cleanGST.substring(0, 2));
  if (stateCode < 1 || stateCode > 37) {
    return { 
      valid: false, 
      error: 'Invalid state code in GST number. State code should be between 01-37' 
    };
  }
  
  // Additional validation: Check if PAN format is valid (5 letters + 4 digits + 1 letter)
  const panPart = cleanGST.substring(2, 12);
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(panPart)) {
    return { 
      valid: false, 
      error: 'Invalid PAN format in GST number. PAN should be 5 letters + 4 digits + 1 letter' 
    };
  }
  
  return { valid: true };
};

// Phone number validation for India
export const validatePhoneNumber = (phoneNumber) => {
  if (!phoneNumber) {
    return { valid: false, error: 'Phone number is required' };
  }
  
  // Remove any spaces, dashes, or special characters
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  
  // Check if it starts with 91 (India country code) or is 10 digits
  if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
    const withoutCountryCode = cleanPhone.substring(2);
    if (withoutCountryCode.length === 10 && withoutCountryCode.startsWith('6') || withoutCountryCode.startsWith('7') || withoutCountryCode.startsWith('8') || withoutCountryCode.startsWith('9')) {
      return { valid: true };
    }
  } else if (cleanPhone.length === 10 && (cleanPhone.startsWith('6') || cleanPhone.startsWith('7') || cleanPhone.startsWith('8') || cleanPhone.startsWith('9'))) {
    return { valid: true };
  }
  
  return { 
    valid: false, 
    error: 'Invalid phone number. Please enter a valid 10-digit Indian mobile number or include country code 91' 
  };
};