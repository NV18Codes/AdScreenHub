import React, { useState, useEffect } from 'react';
import { useOrders } from '../hooks/useOrders';
import { useAuth } from '../contexts/AuthContext';
import { isDateDisabled, validateFile, generateOrderId, compressImage, manageStorageQuota } from '../utils/validation';
import { couponsAPI, dataAPI, filesAPI, ordersAPI } from '../config/api';
import { RAZORPAY_KEY, RAZORPAY_CONFIG, convertToPaise } from '../config/razorpay';
import LoadingSpinner from './LoadingSpinner';
import TermsContent from './TermsContent';
import styles from '../styles/BookingFlow.module.css';

export default function BookingFlow() {
  const { createOrder, hasAvailableInventory, getAvailableInventory, getBookedScreensForDate } = useOrders();
  const { isAuthenticated } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedScreen, setSelectedScreen] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showScreenModal, setShowScreenModal] = useState(false);
  const [designFile, setDesignFile] = useState(null);
  const [designPreview, setDesignPreview] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [newOrder, setNewOrder] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  
  // New form fields
  const [address, setAddress] = useState('');
  const [gstApplicable, setGstApplicable] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  
  // Dynamic data state
  const [plans, setPlans] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [availabilityData, setAvailabilityData] = useState({});
  const [slotAvailabilityStatus, setSlotAvailabilityStatus] = useState({});
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showImportantNotice, setShowImportantNotice] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Fetch plans when selectedScreen changes
  useEffect(() => {
    if (selectedScreen && selectedScreen.id) {
      fetchPlans();
    }
  }, [selectedScreen]);

  // Transform API plan data to match frontend format
  const transformPlanData = (apiPlans) => {
    if (!Array.isArray(apiPlans)) return [];
    
    return apiPlans.map(plan => ({
      id: plan.id || '',
      name: (plan.name || '').toUpperCase(),
      price: plan.price || 0,
      duration: `${plan.duration_days || 0} day${(plan.duration_days || 0) > 1 ? 's' : ''}`,
      description: plan.description || '',
      adSlots: 1, // Default to 1 slot per plan
      features: [
        `${plan.duration_days || 0} day display duration`,
        `High-quality LED display`,
        `Professional ad placement`,
        `24/7 visibility`,
        `Real-time monitoring`
      ]
    }));
  };

  // Transform location data from API
  const transformLocationData = (apiLocations) => {
    if (!Array.isArray(apiLocations)) return [];
    
    const screenDetails = {
      1: { size: "20ft x 10ft", pixels: "1920px x 1080px", location: "MG Road, Bangalore" },
      2: { size: "15ft x 8ft", pixels: "1440px x 720px", location: "Koramangala, Bangalore" },
      3: { size: "25ft x 12ft", pixels: "2560px x 1280px", location: "Indiranagar, Bangalore" }
    };
    
    return apiLocations.map(location => ({
      id: location.id || '',
      name: location.name || 'Unknown Location',
      description: location.description || '',
      location: screenDetails[location.id]?.location || location.name || 'Unknown Location',
      size: screenDetails[location.id]?.size || "1440px x 720px",
      pixels: screenDetails[location.id]?.pixels || "1440px x 720px",
      orientation: "Landscape",
      image: "/Banner.png", // Use Banner.png for all screens
      totalInventory: location.total_slots || 0,
      available_slots: location.available_slots || 0
    }));
  };

  // Fetch plans data
  const fetchPlans = async () => {
    if (!selectedScreen || !selectedScreen.id) {
      console.log('No selected screen, cannot fetch plans');
      setPlans([]);
      return;
    }

    setLoadingPlans(true);
    setError(''); // Clear previous errors
    
    try {
      // Use the location-specific plans API
      const result = await dataAPI.getPlansByLocation(selectedScreen.id);
      console.log('Plans API Response:', result); // Debug log
      
      // Handle different possible response structures
      let plansData = null;
      
      if (result.success && result.data) {
        // Check if data is directly an array
        if (Array.isArray(result.data)) {
          plansData = result.data;
        }
        // Check if data has a nested array (like data.plans or data.data)
        else if (result.data.data && Array.isArray(result.data.data)) {
          plansData = result.data.data;
        }
        // Check if data is an object with plans property
        else if (result.data.plans && Array.isArray(result.data.plans)) {
          plansData = result.data.plans;
        }
        // Check if data has an array property
        else if (Array.isArray(result.data)) {
          plansData = result.data;
        }
      }
      
      if (plansData && Array.isArray(plansData) && plansData.length > 0) {
        const transformedPlans = transformPlanData(plansData);
        console.log('Transformed Plans:', transformedPlans); // Debug log
        setPlans(transformedPlans);
        setError(''); // Clear any previous errors
      } else {
        // No plans available - show backend message
        const errorMessage = result.message || result.error || 'No plans available for this location';
        setError(errorMessage);
        setPlans([]);
        console.log('No plans available:', errorMessage);
      }
    } catch (error) {
      console.error('Plans API error:', error);
      setError('Network error. Please try again.');
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  };

  // Fetch location availability for selected date
  const fetchLocationAvailability = async (date) => {
    setLoadingAvailability(true);
    setLoadingLocations(true);
    setError(''); // Clear previous errors
    
    try {
      const result = await dataAPI.getLocationAvailability(date);
      console.log('Location Availability Response:', result); // Debug log
      
      if (result.success && result.data) {
        const locationsData = result.data.data || result.data;
        if (Array.isArray(locationsData) && locationsData.length > 0) {
          const transformedLocations = transformLocationData(locationsData);
          setLocations(transformedLocations);
          setAvailabilityData({});
          setError(''); // Clear any previous errors
      } else {
          // No locations available - show backend message
          setLocations([]);
          setAvailabilityData({});
          const errorMessage = result.message || 'No available inventory for this location and date';
          setError(errorMessage);
          console.log('No locations available:', errorMessage);
        }
      } else {
        // API returned success: false or no data
        const errorMessage = result.error || result.message || 'No available inventory for this location and date';
        setError(errorMessage);
        setLocations([]);
        setAvailabilityData({});
        console.log('Location availability failed:', errorMessage);
      }
    } catch (error) {
      console.error('Location availability API error:', error);
      setError('Network error. Please try again.');
      setLocations([]);
      setAvailabilityData({});
    } finally {
      setLoadingAvailability(false);
      setLoadingLocations(false);
    }
  };

  // Handle date selection
  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    setSelectedScreen(null);
    setSelectedPlan(null);
    
    if (!date) {
      setLocations([]);
      setAvailabilityData({});
      return;
    }
    
    if (!isAuthenticated()) {
      console.log('User not authenticated, please login to check availability');
      return;
    }
    
    await fetchLocationAvailability(date);
    
    // Auto-scroll to step 2 after date selection
    setTimeout(() => {
      const step2Element = document.querySelector('[data-step="2"]');
      if (step2Element) {
        step2Element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 500);
  };

  // Handle screen selection
  const handleScreenSelect = (screen) => {
    setSelectedScreen(screen);
    setShowScreenModal(false);
    
    // Auto-scroll to step 3 after screen selection
    setTimeout(() => {
      const step3Element = document.querySelector('[data-step="3"]');
      if (step3Element) {
        step3Element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 500);
  };

  // Handle plan selection
  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    
    // Auto-scroll to step 4 after plan selection
    setTimeout(() => {
      const step4Element = document.querySelector('[data-step="4"]');
      if (step4Element) {
        step4Element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Show Important Notice popup before allowing file selection
      setShowImportantNotice(true);
      
      // Store the file temporarily
      setDesignFile(file);
      setUploadError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setDesignPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle accepting the important notice
  const handleAcceptNotice = () => {
    setShowImportantNotice(false);
    // File is already set, user can now proceed
  };

  // Handle canceling the important notice
  const handleCancelNotice = () => {
    setShowImportantNotice(false);
    // Clear the selected file
    setDesignFile(null);
    setDesignPreview(null);
    // Reset file input
    const fileInput = document.getElementById('file-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Handle file upload
  const uploadFile = async () => {
    if (!designFile) {
      setUploadError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setUploadError('');

    try {
      console.log('Attempting to get signed upload URL for:', designFile.name, designFile.type);
      
      // Try to get signed URL from API
      const signedUrlResponse = await filesAPI.getSignedUploadUrl(
        designFile.name,
        designFile.type
      );

      console.log('Signed URL Response:', signedUrlResponse);

      if (signedUrlResponse.success) {
        const uploadData = signedUrlResponse.data.data || signedUrlResponse.data;
        console.log('Upload Data:', uploadData);
        
        if (uploadData && uploadData.signedUrl) {
        const { signedUrl, path: filePath, fileName } = uploadData;

        // Upload file to S3
          console.log('Uploading to S3:', signedUrl);
        const uploadResponse = await fetch(signedUrl, {
          method: 'PUT',
            body: designFile,
          headers: {
              'Content-Type': designFile.type,
          },
        });

          if (uploadResponse.ok) {
            console.log('File uploaded successfully');
            setFileUploaded(true); // Mark as uploaded
            setShowUploadModal(false);
            setShowConfirmation(true);
          } else {
            throw new Error(`S3 upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
          }
        } else {
          throw new Error('Invalid upload data received from API');
        }
      } else {
        throw new Error(signedUrlResponse.error || 'Failed to get upload URL');
      }
    } catch (error) {
      console.error('File Upload Error:', error);
      
      // If it's a network error or API not available, allow user to proceed
      if (error.message.includes('Network error') || error.message.includes('Failed to get upload URL')) {
        console.log('File upload API not available, proceeding without upload');
        setUploadError('File upload service temporarily unavailable. You can proceed with booking and upload the file later.');
        
        // Auto-proceed to confirmation after a delay
        setTimeout(() => {
          setShowUploadModal(false);
          setShowConfirmation(true);
        }, 2000);
      } else {
        setUploadError(`Upload failed: ${error.message}. Please try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle order confirmation
  const handleConfirmOrder = async () => {
    if (!selectedDate || !selectedScreen || !selectedPlan || !designFile) {
      alert('Please complete all steps before confirming');
      return;
    }

    try {
      console.log('🔍 Selected Plan:', selectedPlan);
      console.log('🔍 Plan Price:', selectedPlan.price);
      console.log('🔍 Discount Amount:', discountAmount);
      console.log('🔍 Final Amount:', selectedPlan.price - (discountAmount || 0));
      
      const orderData = {
        planId: selectedPlan.id,
        locationId: selectedScreen.id,
        screenId: selectedScreen.id, // Keep for backward compatibility
        startDate: selectedDate,
        displayDate: selectedDate, // Keep for backward compatibility
        creativeFilePath: designFile.name, // This should be the actual file path from upload
        creativeFileName: designFile.name,
        designFile: designFile.name, // Keep for backward compatibility
        totalAmount: selectedPlan.price - (discountAmount || 0),
        price: selectedPlan.price - (discountAmount || 0), // Keep for backward compatibility
        address: address,
        city: '', // You might want to extract from address or add a city field
        state: '', // You might want to add a state field
        zip: '', // You might want to add a zip field
        gstApplicable: gstApplicable,
        companyName: companyName,
        gstNumber: gstNumber,
        gstInfo: gstNumber, // API expects gstInfo
        termsAccepted: termsAccepted,
        couponCode: couponCode,
        discountAmount: discountAmount,
        screenName: selectedScreen.name,
        location: selectedScreen.location
      };

      console.log('🚀 Creating order with data:', orderData);
      console.log('🚀 Order data price:', orderData.price);
      console.log('🚀 Order data totalAmount:', orderData.totalAmount);
      const result = await createOrder(orderData);
      console.log('📋 Order creation result:', result);
      
      if (result.success) {
        console.log('✅ Order created successfully:', result.order);
        console.log('🔍 API Response:', result.apiResponse);
        console.log('🔍 Order object:', result.order);
        
        setNewOrder(result.order);
        
        // Check if we have razorpay_order_id from API response
        // The API returns: response.data.data.order.razorpay_order_id
        const razorpayOrderId = result.apiResponse?.data?.order?.razorpay_order_id || 
                                result.apiResponse?.data?.razorpayOrder?.id ||
                                result.apiResponse?.razorpay_order_id || 
                                result.order?.razorpay_order_id || 
                                result.order?.razorpayOrderId;
        
        console.log('🔍 Extracted Razorpay Order ID:', razorpayOrderId);
        console.log('🔍 result.apiResponse?.data?.order?.razorpay_order_id:', result.apiResponse?.data?.order?.razorpay_order_id);
        console.log('🔍 result.apiResponse?.data?.razorpayOrder?.id:', result.apiResponse?.data?.razorpayOrder?.id);
        
        if (razorpayOrderId) {
          console.log('💳 Razorpay Order ID found:', razorpayOrderId);
          console.log('💳 Opening Razorpay payment modal...');
          // Show Razorpay payment modal
          handlePayment(result.order, razorpayOrderId);
      } else {
          console.warn('⚠️ No Razorpay Order ID found');
          console.warn('⚠️ This means the API did not return razorpay_order_id');
          console.warn('⚠️ Check your backend /orders/initiate endpoint');
          alert('Payment gateway not available. Please contact support.');
        }
      } else {
        console.error('❌ Order creation failed:', result.error);
        // Show error message but don't block the user completely
        alert(result.error || 'Failed to create order. Please try again.');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      alert('Failed to create order. Please try again.');
    }
  };

  // Handle Razorpay payment
  const handlePayment = (order, razorpayOrderId) => {
    console.log('💳 Initiating Razorpay payment for order:', order);
    
    // Load Razorpay script if not already loaded
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        console.log('✅ Razorpay script loaded');
        openRazorpay(order, razorpayOrderId);
      };
      script.onerror = () => {
        console.error('❌ Failed to load Razorpay script');
        alert('Failed to load payment gateway. Please try again.');
      };
      document.body.appendChild(script);
    } else {
      openRazorpay(order, razorpayOrderId);
    }
  };

  const openRazorpay = (order, razorpayOrderId) => {
    console.log('🎯 openRazorpay called with order:', order);
    console.log('🎯 razorpayOrderId:', razorpayOrderId);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const amount = convertToPaise(order.totalAmount || order.amount || order.total_cost || 0);
    
    console.log('💰 Payment amount:', order.totalAmount || order.amount || order.total_cost, 'INR');
    console.log('💰 Payment amount in paise:', amount);
    console.log('🔑 Razorpay key:', RAZORPAY_KEY);
    
    const options = {
      key: RAZORPAY_KEY,
      amount: amount,
      currency: RAZORPAY_CONFIG.currency,
      name: RAZORPAY_CONFIG.name,
      description: `Booking for ${order.screenName || order.locationName || 'LED Screen'}`,
      order_id: razorpayOrderId,
      prefill: {
        name: user.fullName || user.name || '',
        email: user.email || '',
        contact: user.phoneNumber || user.phone || ''
      },
      theme: RAZORPAY_CONFIG.theme,
        handler: async function (response) {
        console.log('✅ Payment successful:', response);
        console.log('💳 Payment details:', {
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature
        });
        
        // Call verify payment API
        try {
          const verifyResponse = await ordersAPI.verifyPayment({
            orderId: order.id.toString(),
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });
          
          console.log('🔍 Payment verification response:', verifyResponse);
          
          if (verifyResponse.success) {
            console.log('✅ Payment verified successfully');
            // Redirect to success page
            window.location.href = `/booking-success?orderId=${order.id}&payment_id=${response.razorpay_payment_id}&verified=true`;
          } else {
            console.error('❌ Payment verification failed:', verifyResponse.error);
            alert('Payment verification failed. Please contact support.');
            window.location.href = `/booking-failed?orderId=${order.id}&reason=verification_failed`;
          }
        } catch (error) {
          console.error('❌ Payment verification error:', error);
          alert('Payment verification failed. Please contact support.');
          window.location.href = `/booking-failed?orderId=${order.id}&reason=verification_error`;
        }
      },
      modal: {
        ondismiss: function() {
          console.log('⚠️ Payment modal closed by user');
          // Redirect to failed page if user closes modal
          window.location.href = `/booking-failed?orderId=${order.id}&reason=payment_cancelled`;
        }
      }
    };

    console.log('💳 Opening Razorpay with options:', options);
    
    try {
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('❌ Error opening Razorpay:', error);
      alert('Failed to open payment gateway. Please try again.');
    }
  };

  // Validate coupon
  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setValidatingCoupon(true);
    setCouponError('');

    try {
      const result = await couponsAPI.validateCoupon(couponCode);
      
      if (result.success) {
        const discount = result.data.discount || 0;
        setDiscountAmount(discount);
        setCouponError('');
      } else {
        setCouponError(result.error || 'Invalid coupon code');
        setDiscountAmount(0);
      }
    } catch (error) {
      console.error('Coupon validation error:', error);
      setCouponError('Failed to validate coupon. Please try again.');
      setDiscountAmount(0);
    } finally {
      setValidatingCoupon(false);
    }
  };

  // Calculate total amount
  const calculateTotal = () => {
    if (!selectedPlan || !selectedPlan.price) return 0;
    const baseAmount = selectedPlan.price;
    const discount = discountAmount;
    return Math.max(0, baseAmount - discount);
  };

        return (
    <div className={styles.bookingFlow}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Book Your Ad Slot</h1>
          <p>Choose your date, location, and plan to get started</p>
        </div>


        {/* Step 1: Date Selection */}
        <div className={styles.step} data-step="1">
          <h2>Step 1: Select Date</h2>
          <div className={styles.dateSelection}>
              <input
                type="date"
                value={selectedDate}
              onChange={(e) => handleDateSelect(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={styles.dateInput}
              />
          </div>
        </div>

        {/* Step 2: Location Selection */}
        {selectedDate && (
          <div className={styles.step} data-step="2">
            <h2>Step 2: Choose Location</h2>
            {loadingAvailability || loadingLocations ? (
              <div className={styles.loadingMessage}>
                <LoadingSpinner size="medium" text="Loading screen availability..." />
              </div>
            ) : error ? (
              <div className={styles.errorMessage}>
                <div className={styles.errorIcon}>⚠️</div>
                <div className={styles.errorContent}>
                  <h3>No Available Inventory</h3>
                  <p>{error}</p>
              <button
                    onClick={() => setError('')} 
                    className={styles.retryButton}
              >
                    Try Different Date
              </button>
            </div>
          </div>
            ) : locations.length === 0 ? (
              <div className={styles.loadingMessage}>
                <p>No screens available for this date. Please try another date.</p>
              </div>
            ) : (
              <div className={styles.screensGrid}>
                {locations.map((location) => (
                  <div
                    key={location.id}
                    className={styles.screenCard}
                    onClick={() => handleScreenSelect(location)}
                  >
                    <img src={location.image} alt={location.name} className={styles.screenImage} />
                    <div className={styles.screenInfo}>
                    <h3>{location.name}</h3>
                      <p>{location.location}</p>
                      <p>{location.size}</p>
                      <p>Available: {location.available_slots} slots</p>
                  </div>
                  </div>
                ))}
                </div>
              )}
            </div>
        )}

        {/* Step 3: Plan Selection */}
        {selectedScreen && (
          <div className={styles.step} data-step="3">
            <h2>Step 3: Select Plan</h2>
            {loadingPlans ? (
              <div className={styles.loadingMessage}>
                <LoadingSpinner size="medium" text="Loading plans..." />
              </div>
            ) : error ? (
              <div className={styles.errorMessage}>
                <div className={styles.errorIcon}>⚠️</div>
                <div className={styles.errorContent}>
                  <h3>No Plans Available</h3>
                  <p>{error}</p>
                  <button 
                    onClick={() => setError('')} 
                    className={styles.retryButton}
                  >
                    Try Different Location
            </button>
          </div>
              </div>
            ) : plans.length === 0 ? (
              <div className={styles.loadingMessage}>
                <p>No plans available for the selected location.</p>
                <button onClick={() => setCurrentStep('date-selection')} className={styles.primaryButton}>
                  Book Another Slot
                </button>
              </div>
            ) : (
              <div className={styles.plansGrid}>
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`${styles.planCard} ${selectedPlan?.id === plan.id ? styles.selected : ''}`}
                    onClick={() => handlePlanSelect(plan)}
                  >
                    <div className={styles.planHeader}>
                    <h3>{plan.name}</h3>
                      <div className={styles.planPrice}>₹{(plan.price || 0).toLocaleString('en-IN')}</div>
                  </div>
                    <div className={styles.planDuration}>{plan.duration}</div>
                    {plan.description && (
                      <div className={styles.planDescription}>{plan.description}</div>
                    )}
                    <ul className={styles.planFeatures}>
                      {plan.features && Array.isArray(plan.features) && plan.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                </div>
              )}
            </div>
        )}

        {/* Important Notice Modal */}
        {showImportantNotice && (
          <div className={styles.noticeOverlay}>
            <div className={styles.noticeModal}>
              <div className={styles.noticeHeader}>
                <h2>⚠️ IMPORTANT NOTICE</h2>
                <button 
                  onClick={handleCancelNotice} 
                  className={styles.closeNoticeButton}
                >
                  ×
            </button>
          </div>
              <div className={styles.noticeContent}>
                <div className={styles.scrollableContent}>
                  <p className={styles.introText}>
                    Please ensure your advertisement creative strictly adheres to the design and content guidelines before uploading.
                  </p>
                  
                  <div className={styles.section}>
                    <h4>Content & Legal Compliance</h4>
                    <ul className={styles.circleList}>
                      <li>Your creative must comply with all applicable laws in force in India, the Advertising Standards Council of India (ASCI) Code, and local municipal (BBMP) bye-laws.</li>
                      <li>Prohibited content includes:
                        <ul className={styles.squareList}>
                          <li>False or misleading claims</li>
                          <li>Fraudulent financial schemes or get-rich-quick scams</li>
                          <li>Hate speech, defamation, or politically sensitive content</li>
                          <li>Illegal services, counterfeit products, or copyrighted material without permission</li>
                          <li>Alcohol Advertising</li>
                          <li>Tobacco & Vaping Products</li>
                          <li>Gambling, Betting & Lottery Ads</li>
                          <li>Political Ads</li>
                          <li>Adult Content</li>
                          <li>Language, Religious & Culturally Sensitive Ads</li>
                        </ul>
                      </li>
                      <li>For Bengaluru digital screens, in strict compliance with the Bruhat Bengaluru Mahanagara Palike Outdoor Signage and Public Messaging Bye-Laws, 2018, the text/logo (units) in a digital screen advertisement shall adhere to the ratio of 60:40 between the Kannada language and English language of the visible content.</li>
                    </ul>
                  </div>

                  <div className={styles.section}>
                    <h4>Technical Specifications</h4>
                    <ul className={styles.circleList}>
                      <li>Creatives must strictly match the size, dimensions, aspect ratio, and resolution required for the chosen display location.</li>
                      <li>Poor quality or non-compliant creatives will be rejected.</li>
                    </ul>
                  </div>

                  <div className={styles.section}>
                    <h4>Approval & Timelines</h4>
                    <ul className={styles.circleList}>
                      <li>All ads require AdScreenHub.com's approval before going live.</li>
                      <li>If your creative is rejected, you must alter the creative to follow guidelines and resubmit at least 12 hours prior to the scheduled display start date.</li>
                      <li>Failure to resubmit on time will result in forfeiture of the ad slot without refund, credit, or compensation.</li>
                      <li>Any creative that remains incorrect or non-compliant upon resubmission will be rejected, and AdScreenHub.com shall bear no liability or entitlement to any refund, credit, or compensation.</li>
                    </ul>
                  </div>

                  <div className={styles.section}>
                    <h4>Intellectual Property</h4>
                    <ul className={styles.circleList}>
                      <li>You must own or have legal permission to use all images, text, logos, music, and other elements in your creative.</li>
                      <li>Do not submit material that infringes trademarks, copyrights, or other intellectual property rights of any third party.</li>
                      <li>AdScreenHub.com reserves the right to remove any infringing content without notice and is not responsible for any claims arising from your infringement.</li>
                    </ul>
                  </div>

                  <div className={styles.section}>
                    <h4>Advertiser Liability</h4>
                    <ul className={styles.circleList}>
                      <li>You are solely responsible for ensuring your creative is accurate, lawful, and compliant.</li>
                      <li>Any breach of the Terms & Conditions, specifications, guidelines or laws may result in rejection, account termination, and/or legal action.</li>
                      <li>AdScreenHub.com is not liable for any losses, delays, or damages resulting from your submission of non-compliant creatives.</li>
                    </ul>
                  </div>

                  <div className={styles.agreementText}>
                    <p><strong>By proceeding with your upload, you agree to have read the detailed Terms & Conditions and confirm that your creative meets these requirements in full.</strong></p>
                  </div>
                </div>
                <div className={styles.noticeActions}>
                  <button 
                    onClick={handleCancelNotice} 
                    className={styles.cancelNoticeButton}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAcceptNotice} 
                    className={styles.understandButton}
                  >
                    I Understand & Agree
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: File Upload */}
        {selectedPlan && (
          <div className={styles.step} data-step="4">
            <h2>Step 4: Upload Design</h2>
            

            <div className={styles.uploadArea}>
              <input
                type="file"
                id="file-upload"
                onChange={handleFileSelect}
                accept="image/*,video/*"
                className={styles.fileInput}
              />
              <label htmlFor="file-upload" className={styles.uploadLabel}>
                {designFile ? designFile.name : 'Choose File'}
              </label>
              {designFile && (
                <div className={styles.filePreview}>
                  <img src={designPreview} alt="Preview" className={styles.previewImage} />
                </div>
              )}
              {designFile && (
                <button
                  onClick={uploadFile}
                  disabled={loading || fileUploaded}
                  className={`${styles.uploadButton} ${fileUploaded ? styles.uploaded : ''}`}
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="small" text="" className="inlineSpinner" />
                      Uploading...
                    </>
                  ) : fileUploaded ? (
                    '✅ Successfully Uploaded'
                  ) : (
                    'Upload File'
                  )}
                  </button>
              )}
                </div>
            {uploadError && (
              <div className={styles.errorMessage}>{uploadError}</div>
              )}
            </div>
        )}

        {/* Step 5: Order Details */}
        {designFile && (
          <div className={styles.step} data-step="5">
            <h2>Step 5: Order Details</h2>
            <div className={styles.orderForm}>
              <div className={styles.formGroup}>
                <label>Delivery Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your delivery address"
                  className={styles.textarea}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                <input
                    type="checkbox"
                    checked={gstApplicable}
                    onChange={(e) => setGstApplicable(e.target.checked)}
                  />
                  GST Applicable
                </label>
              </div>

              {gstApplicable && (
                <>
                  <div className={styles.formGroup}>
                    <label>Company Name</label>
                <input
                  type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Enter company name"
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>GST Number</label>
                <input
                  type="text"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value)}
                      placeholder="Enter GST number"
                      className={styles.input}
                />
              </div>
                </>
              )}
              
              <div className={styles.formGroup}>
                <label>Coupon Code (Optional)</label>
                <div className={styles.couponInput}>
                <input
                  type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className={styles.input}
                  />
                  <button
                    onClick={validateCoupon}
                    disabled={validatingCoupon}
                    className={styles.couponButton}
                  >
                    {validatingCoupon ? (
                      <LoadingSpinner size="small" text="" className="inlineSpinner" />
                    ) : (
                      'Apply'
                    )}
                  </button>
                </div>
                {couponError && (
                  <div className={styles.errorMessage}>{couponError}</div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                  <span>
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowTermsModal(true);
                      }}
                      className={styles.termsLink}
                    >
                      terms and conditions
                    </button>
                  </span>
                </label>
              </div>
          </div>
          </div>
        )}

        {/* Step 6: Order Summary & Confirmation */}
        {selectedPlan && designFile && (
          <div className={styles.step} data-step="6">
            <h2>Step 6: Order Summary</h2>
                <div className={styles.orderSummary}>
              <div className={styles.summaryItem}>
                <span>Date:</span>
                <span>{selectedDate}</span>
              </div>
                  <div className={styles.summaryItem}>
                    <span>Location:</span>
                <span>{selectedScreen?.name}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Plan:</span>
                    <span>{selectedPlan?.name}</span>
                  </div>
                  <div className={styles.summaryItem}>
                <span>Base Price:</span>
                <span>₹{(selectedPlan?.price || 0).toLocaleString('en-IN')}</span>
                  </div>
              {discountAmount > 0 && (
                  <div className={styles.summaryItem}>
                  <span>Discount:</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
              )}
              <div className={`${styles.summaryItem} ${styles.total}`}>
                <span>Total:</span>
                <span>₹{calculateTotal().toLocaleString('en-IN')}</span>
                  </div>
                </div>

                    <button
              onClick={handleConfirmOrder}
              disabled={!address.trim() || (gstApplicable && (!companyName.trim() || !gstNumber.trim())) || !termsAccepted}
              className={styles.confirmButton}
                    >
              Confirm Order
                    </button>
                  </div>
        )}

        {/* Unavailable Modal */}
        {showUnavailableModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2>Slot Unavailable</h2>
                <button onClick={() => setShowUnavailableModal(false)} className={styles.closeButton}>×</button>
              </div>
              <div className={styles.modalContent}>
                <div className={styles.unavailableContent}>
                  <div className={styles.unavailableIcon}>Unavailable</div>
                  <h2>Already Booked!</h2>
                  <p>This screen is already booked for the selected date and plan combination.</p>
                  <div className={styles.suggestionBox}>
                    <h3>Try these alternatives:</h3>
                    <ul>
                      <li>Choose a different date</li>
                      <li>Select another location</li>
                      <li>Pick a different plan</li>
                    </ul>
                  </div>
                  <div className={styles.actions}>
                    <button
                      onClick={() => setCurrentStep('date-selection')}
                      className={styles.primaryButton}
                    >
                      Book Another Slot
                    </button>
                      <button
                      onClick={() => setShowUnavailableModal(false)}
                      className={styles.secondaryButton}
                    >
                      Try Again
                      </button>
                          </div>
                        </div>
                    </div>
                  </div>
              </div>
            )}

        {/* Terms and Conditions Modal */}
        {showTermsModal && (
          <div className={styles.noticeOverlay}>
            <div className={styles.noticeModal}>
              <div className={styles.noticeHeader}>
                <h2>Terms and Conditions</h2>
                <button 
                  onClick={() => setShowTermsModal(false)} 
                  className={styles.closeNoticeButton}
                >
                  ×
                </button>
              </div>
              <div className={styles.noticeContent}>
                <div className={styles.scrollableContent}>
                  <TermsContent />
                </div>
                <div className={styles.noticeActions}>
                  <button 
                    onClick={() => setShowTermsModal(false)} 
                    className={styles.understandButton}
                  >
                    Back to Booking
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
          </div>
    </div>
  );
}