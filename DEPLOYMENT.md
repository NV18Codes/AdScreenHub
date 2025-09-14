# Deployment Guide

## Authentication Flow

The application now has a complete multi-step authentication system:

### Routes:
- `/` - Home page
- `/signup` - Start signup process (email step)
- `/login` - Start login process
- `/auth` - General auth page
- `/verify-email` - Email verification redirect page
- `/dashboard` - Main dashboard (after login)

### Authentication Flow:
1. User clicks "Sign Up" → goes to `/signup`
2. User enters email → receives verification email
3. User clicks email link → redirects to `/verify-email`
4. Email verified → redirects to `/auth?step=phone`
5. User enters phone → receives OTP
6. User enters OTP → goes to registration step
7. User completes registration → goes to login step
8. User logs in → redirects to `/dashboard`

### API Endpoints:
- `POST /api/v1/auth/start-email-verification`
- `POST /api/v1/auth/verify-email`
- `POST /api/v1/auth/start-phone-verification`
- `POST /api/v1/auth/verify-phone`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`

### Deployment:
1. Build: `npm run build`
2. Deploy to Vercel: `vercel --prod`
3. Or deploy to Netlify: `netlify deploy --prod`

### Environment Variables:
- `VITE_API_BASE_URL` (optional) - defaults to production API
- `VITE_APP_ENV` (optional) - set to 'production' for production builds

### Production Issues Fixed:
1. ✅ Removed hardcoded localhost redirects
2. ✅ Standardized API base URLs across components
3. ✅ Enhanced token validation with expiration checking
4. ✅ Improved error handling for registration and login
5. ✅ Fixed email verification flow for production
6. ✅ Added centralized API configuration

### Testing Checklist:
- [ ] Email verification redirects work properly
- [ ] Phone verification OTP flow works
- [ ] Registration completes successfully
- [ ] Login works with proper token validation
- [ ] Protected routes redirect unauthenticated users
- [ ] Token expiration is handled gracefully
