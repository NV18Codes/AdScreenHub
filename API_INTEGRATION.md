# API Integration Documentation

## Overview
This project has been integrated with the AdScreenHub API hosted at `https://adscreenapi-production.up.railway.app/api/v1`.

## Environment Configuration

### Environment Variables
Create a `.env.local` file in the root directory with the following variables:

```env
# API Configuration
VITE_API_BASE_URL=https://adscreenapi-production.up.railway.app/api/v1

# Environment
VITE_NODE_ENV=production
```

## API Configuration

### API Base URL
The API base URL is configured in `src/config/api.js` and can be overridden using the `VITE_API_BASE_URL` environment variable.

### Available Endpoints

#### Authentication Endpoints
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `POST /auth/verify-email` - Email verification
- `POST /auth/start-email-verification` - Start email verification process
- `POST /auth/start-phone-verification` - Start phone verification process
- `POST /auth/verify-phone` - Phone number verification with OTP
- `POST /auth/refresh-token` - Refresh authentication token
- `POST /auth/logout` - User logout

#### User Management Endpoints
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update user profile
- `DELETE /user/account` - Delete user account

#### Orders Endpoints
- `POST /orders` - Create new order
- `GET /orders` - Get user orders
- `GET /orders/:id` - Get order by ID
- `PUT /orders/:id` - Update order
- `DELETE /orders/:id` - Cancel order

#### Screens Endpoints
- `GET /screens` - Get available screens
- `GET /screens/:id` - Get screen by ID

#### Plans Endpoints
- `GET /plans` - Get available plans
- `GET /plans/:id` - Get plan by ID

#### Coupons Endpoints
- `GET /coupons/validate` - Validate coupon code

#### File Upload Endpoints
- `POST /upload` - Upload files

## Usage

### Authentication Hook
The `useAuth` hook provides authentication functionality:

```javascript
import { useAuth } from '../hooks/useAuth';

const { login, signup, logout, user, isAuthenticated } = useAuth();

// Login
const result = await login(email, password);

// Signup
const result = await signup({
  email: 'user@example.com',
  phoneNumber: '1234567890',
  fullName: 'John Doe',
  password: 'password123'
});

// Logout
logout();
```

### Orders Hook
The `useOrders` hook provides order management functionality:

```javascript
import { useOrders } from '../hooks/useOrders';

const { createOrder, orders, loading } = useOrders(userId);

// Create order
const result = await createOrder({
  screenId: 'screen123',
  planId: 'plan456',
  displayDate: '2024-01-15',
  // ... other order data
});
```

### Direct API Calls
You can also make direct API calls using the configured API functions:

```javascript
import { authAPI, ordersAPI, userAPI } from '../config/api';

// Login
const result = await authAPI.login(email, password);

// Create order
const result = await ordersAPI.createOrder(orderData);

// Get user profile
const result = await userAPI.getProfile();
```

## Error Handling

All API calls return a standardized response format:

```javascript
{
  success: boolean,
  data: any,           // Response data (if success is true)
  error: string,       // Error message (if success is false)
  status: number       // HTTP status code
}
```

## Authentication

The API uses Bearer token authentication. Tokens are automatically included in requests when available in localStorage under the key `adscreenhub_user`.

## File Upload

File uploads are handled through the `uploadAPI`:

```javascript
import { uploadAPI } from '../config/api';

const result = await uploadAPI.uploadFile(file, orderId);
```

## Development

### Testing API Integration
1. Ensure the `.env.local` file is created with the correct API URL
2. Start the development server: `npm run dev`
3. Test the authentication flow:
   - Sign up with email and phone verification
   - Complete profile setup
   - Login with credentials
   - Create orders

### Debugging
- Check browser console for API response logs
- Verify network requests in browser DevTools
- Ensure CORS is properly configured on the API server

## Production Deployment

1. Set the `VITE_API_BASE_URL` environment variable in your deployment platform
2. Ensure the API server is accessible from your frontend domain
3. Verify CORS configuration allows your frontend domain

## Notes

- All API calls include proper error handling and user feedback
- Local storage is used as a fallback for offline functionality
- The application gracefully handles network errors
- Authentication state is synchronized across browser tabs
