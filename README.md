# ADSCREENHUB - LED Billboard Advertising Platform

A complete frontend React application for ADSCREENHUB's demo platform, featuring authentication, dashboard, order management, and booking functionality.

## 🎯 Features

### 🔐 Authentication System
- **Sign Up**: Full name, email, mobile (India format), password validation
- **OTP Verification**: Mock OTP system (use "1234" for demo)
- **Login**: Email/password with privacy policy checkbox
- **Remember Me**: localStorage persistence
- **Password Reset**: Mock email reset functionality

### 📅 Dashboard & Booking
- **Calendar-based Booking**: Date selection (minimum 2 days advance)
- **LED Screen Selection**: Grid of available screens with details
- **Plan Selection**: Spark, Impact, Thrive plans with features
- **Interactive Modals**: Screen details and plan selection
- **Booking Summary**: Complete order overview

### 📦 Order Management
- **My Orders Page**: Complete order history with status tracking
- **Order Statuses**: Pending Approval, In Display, Completed, Cancelled, Revision
- **Order Actions**: Cancel, revise design, view thumbnails
- **Image Modal**: Full-size ad preview with download simulation

### 🎨 UI/UX Features
- **Responsive Design**: Mobile-first approach
- **CSS Modules**: Component-scoped styling
- **Primary Color**: Dark Blue (#1319B3)
- **Modern Animations**: Hover effects and transitions
- **Loading States**: User feedback during operations

### 📱 Navigation & Layout
- **React Router**: Client-side routing
- **Protected Routes**: Authentication-based access control
- **Navbar**: Dynamic navigation with user menu
- **Footer**: Social links and legal pages

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd adscreenhub-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3001` (or the port shown in terminal)

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx      # Navigation with authentication
│   ├── Footer.jsx      # Footer with social links
│   ├── Hero.jsx        # Landing page hero section
│   ├── Steps.jsx       # How it works section
│   ├── About.jsx       # About us section
│   ├── Plans.jsx       # Pricing plans
│   ├── Showcase.jsx    # Content showcase
│   └── Contact.jsx     # Contact section
├── pages/              # Page components
│   ├── Home.jsx        # Landing page
│   ├── Login.jsx       # Login page
│   ├── Signup.jsx      # Signup page
│   ├── Dashboard.jsx   # Booking dashboard
│   ├── MyOrders.jsx    # Order management
│   ├── Checkout.jsx    # Checkout page
│   └── Profile.jsx     # User profile
├── hooks/              # Custom React hooks
│   ├── useAuth.js      # Authentication state management
│   └── useOrders.js    # Orders state management
├── data/               # Mock data
│   └── mockData.js     # Users, screens, plans, orders
├── utils/              # Utility functions
│   └── validation.js   # Form validation helpers
├── styles/             # CSS modules
│   ├── global.module.css
│   ├── Auth.module.css
│   ├── Dashboard.module.css
│   ├── MyOrders.module.css
│   ├── Navbar.module.css
│   └── Footer.module.css
└── App.jsx             # Main app with routing
```

## 🧪 Demo Credentials

### Test User
- **Email**: john@example.com
- **Password**: Test@123

### OTP for Signup
- **Use**: 1234 (for any email during signup)

## 🎨 Design System

### Colors
- **Primary**: #1319B3 (Dark Blue)
- **Secondary**: #f8f9fa (Light Gray)
- **Success**: #28a745 (Green)
- **Warning**: #ffc107 (Yellow)
- **Danger**: #dc3545 (Red)

### Typography
- **Font Family**: Inter, system fonts
- **Responsive**: Mobile-first design
- **Accessibility**: Proper contrast ratios

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔒 Authentication Flow

1. **Sign Up**: Form validation → OTP verification → Auto-login
2. **Login**: Email/password → Privacy policy → Dashboard
3. **Remember Me**: localStorage persistence
4. **Protected Routes**: Automatic redirect to login

## 📊 Mock Data

The application uses mock data for:
- **Users**: Test accounts with authentication
- **LED Screens**: 4 different screen locations
- **Plans**: 3 pricing tiers (Spark, Impact, Thrive)
- **Orders**: Sample order history with various statuses

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel/Netlify
1. Connect your repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for demonstration purposes.

## 🆘 Support

For support or questions:
- Check the FAQ section
- Review the documentation
- Contact the development team

---

**Made with ❤️ for ADSCREENHUB**
