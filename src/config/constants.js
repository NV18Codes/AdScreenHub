// 🚀 PRODUCTION API CONFIGURATION
// Production URL is now configured in package.json
// To change the production URL, update the "productionApiUrl" field in package.json
export const PRODUCTION_API_URL = import.meta.env.VITE_PRODUCTION_API_URL || 'https://2yuh2s8tyv.us-east-1.awsapprunner.com/api/v1';

// Use production URL for both dev and production (direct API calls without proxy)
export const API_BASE_URL = PRODUCTION_API_URL;

// 🎯 SINGLE POINT OF CONFIGURATION
// To change the production URL, update PRODUCTION_API_URL above
// This will automatically update all API calls throughout the application
