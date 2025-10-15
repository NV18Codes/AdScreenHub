// Mock Users Data
export const mockUsers = [
  {
    id: 1,
    fullName: "Test User",
    email: "test@example.com",
    mobile: "+91 9876543210",
    password: "Test@123",
    rememberMe: false
  },
  {
    id: 2,
    fullName: "Demo User",
    email: "demo@example.com",
    mobile: "+91 9876543211",
    password: "Demo@123",
    rememberMe: false
  }
];

// Mock LED Screens Data
export const mockScreens = [
  {
    id: 1,
    name: "MG Road LED Screen",
    image: "/Banner.png",
    size: "20ft x 10ft",
    pixels: "1920px x 1080px",
    orientation: "Landscape",
    location: "MG Road, Bangalore",
    price: 4999,
    description: "High-traffic location in the heart of Bangalore",
    totalInventory: 3, // Total available slots per day
    inventoryPerDate: {} // Will track inventory per specific date
  },
  {
    id: 2,
    name: "Koramangala Digital Billboard",
    image: "/Banner.png",
    size: "15ft x 8ft",
    pixels: "1440px x 720px",
    orientation: "Landscape",
    location: "Koramangala, Bangalore",
    price: 3999,
    description: "Popular commercial area with high visibility",
    totalInventory: 2, // Total available slots per day
    inventoryPerDate: {}
  },
  {
    id: 3,
    name: "Indiranagar LED Display",
    image: "/Banner.png",
    size: "25ft x 12ft",
    pixels: "2560px x 1280px",
    orientation: "Landscape",
    location: "Indiranagar, Bangalore",
    price: 5999,
    description: "Premium location with affluent audience",
    totalInventory: 1, // Total available slots per day
    inventoryPerDate: {}
  },
  {
    id: 4,
    name: "Whitefield Digital Screen",
    image: "/Banner.png",
    size: "18ft x 9ft",
    pixels: "1600px x 900px",
    orientation: "Landscape",
    location: "Whitefield, Bangalore",
    price: 4499,
    description: "IT corridor with tech-savvy audience",
    totalInventory: 2, // Total available slots per day
    inventoryPerDate: {}
  }
];

// Mock Plans Data
export const mockPlans = [
  {
    id: 1,
    name: "SPARK",
    price: 4999,
    duration: "1 day",
    adSlots: 700,
    features: []
  },
  {
    id: 2,
    name: "IMPACT",
    price: 13999,
    duration: "3 days",
    adSlots: 2100,
    features: []
  },
  {
    id: 3,
    name: "THRIVE",
    price: 22999,
    duration: "5 days",
    adSlots: 3500,
    features: []
  }
];

// Mock Orders Data
export const mockOrders = [
  {
    id: "ORD001",
    userId: 1,
    screenId: 1,
    planId: 1,
    orderDate: "2024-01-15",
    displayDate: "2024-01-20",
    status: "Completed Display",
    designFile: "design1.jpg",
    supportingDoc: "doc1.pdf",
    totalAmount: 4999,
    thumbnail: "/Banner.png",
    screenName: "MG Road LED Screen",
    location: "MG Road, Bangalore",
    adminProofImage: "/Banner.png" // Image of ad displayed on LED screen
  },
  {
    id: "ORD002",
    userId: 1,
    screenId: 2,
    planId: 2,
    orderDate: "2024-01-10",
    displayDate: "2024-01-25",
    status: "In Display",
    designFile: "design2.jpg",
    supportingDoc: "doc2.pdf",
    totalAmount: 13999,
    thumbnail: "/Banner.png",
    screenName: "Koramangala Digital Billboard",
    location: "Koramangala, Bangalore",
    adminProofImage: null // No proof yet as it's still in display
  }
];

// Order Status Options - Import from centralized constants
import { ALL_ORDER_STATUSES } from '../config/orderStatuses';

export const orderStatuses = ALL_ORDER_STATUSES;

// File Upload Restrictions
export const uploadRestrictions = {
  design: {
    allowedTypes: ["image/png", "image/jpeg", "image/jpg", "video/mp4"],
    maxSize: 15 * 1024 * 1024, // 15MB
    maxSizeText: "15MB"
  },
  document: {
    allowedTypes: ["image/png", "image/jpeg", "image/jpg", "video/mp4", "application/pdf"],
    maxSize: 10 * 1024 * 1024, // 10MB
    maxSizeText: "10MB"
  }
};

// Warning Messages (English + Kannada)
export const warningMessages = {
  english: "Please ensure your content complies with our advertising guidelines. Inappropriate content will be rejected.",
  kannada: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ವಿಷಯವು ನಮ್ಮ ಜಾಹೀರಾತು ಮಾರ್ಗದರ್ಶನಗಳಿಗೆ ಅನುಗುಣವಾಗಿದೆ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ. ಅನುಚಿತ ವಿಷಯವನ್ನು ತಿರಸ್ಕರಿಸಲಾಗುತ್ತದೆ."
};
