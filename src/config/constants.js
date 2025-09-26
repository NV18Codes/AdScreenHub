// 🚀 PRODUCTION API CONFIGURATION
// Update this URL to change the production API endpoint
export const PRODUCTION_API_URL = 'https://2yuh2s8tyv.us-east-1.awsapprunner.com/api/v1';

// Development API URL (uses Vite proxy)
// The proxy rewrites /api to /api/v1 automatically
export const DEVELOPMENT_API_URL = '/api';

// Auto-detect environment and use appropriate URL
export const API_BASE_URL = import.meta.env.DEV ? DEVELOPMENT_API_URL : PRODUCTION_API_URL;

// 🎯 SINGLE POINT OF CONFIGURATION
// To change the production URL, update PRODUCTION_API_URL above
// This will automatically update all API calls throughout the application
