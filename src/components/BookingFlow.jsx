import React, { useState, useEffect } from 'react';
import { useOrders } from '../hooks/useOrders';
import { useAuth } from '../contexts/AuthContext';
import { isDateDisabled, validateFile, generateOrderId, compressImage, manageStorageQuota, validateGSTNumber, validatePhoneNumber } from '../utils/validation';
import { couponsAPI, dataAPI, filesAPI, ordersAPI } from '../config/api';
import { RAZORPAY_KEY, RAZORPAY_CONFIG, convertToPaise } from '../config/razorpay';
import LoadingSpinner from './LoadingSpinner';
import TermsContent from './TermsContent';
import Toast from './Toast';
import styles from '../styles/BookingFlow.module.css';

export default function BookingFlow() {
  const { createOrder, hasAvailableInventory, getAvailableInventory, getBookedScreensForDate, orders, verifyPayment } = useOrders();
  const { isAuthenticated, user } = useAuth();
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
  const [signedUrlResponse, setSignedUrlResponse] = useState(null);

  // New form fields
  const [address, setAddress] = useState('');
  const [state, setState] = useState('Karnataka'); // Default to Karnataka
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
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };
  const [showImportantNotice, setShowImportantNotice] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [incompleteStep, setIncompleteStep] = useState(null);
  const [confirmingOrder, setConfirmingOrder] = useState(false);
  const [planAvailability, setPlanAvailability] = useState({}); // Track which plans are available
  const [processingPayment, setProcessingPayment] = useState(false); // Track payment verification
  const [checkingAvailability, setCheckingAvailability] = useState(false); // Track availability checking
  const [globalAvailabilityCache, setGlobalAvailabilityCache] = useState({}); // Global cache for availability data
  const [availabilityCheckTimeout, setAvailabilityCheckTimeout] = useState(null);

  // Fetch plans ONLY when BOTH date AND location are selected
  useEffect(() => {
    if (selectedDate && selectedScreen && selectedScreen.id) {
      // Clear any existing timeout
      const timeoutId = setTimeout(() => {
        fetchPlans();
      }, 300); // 300ms debounce
      
      return () => clearTimeout(timeoutId);
    } else {
      // Clear plans if date or screen is not selected
      setPlans([]);
      setPlanAvailability({});
    }
  }, [selectedDate, selectedScreen]);

  // Transform API plan data to match frontend format
  const transformPlanData = (apiPlans) => {
    if (!Array.isArray(apiPlans)) return [];
    
    return apiPlans.map(plan => {
      // Extract duration_days from API response - handle different possible field names
      const durationDays = plan.duration_days || plan.duration || plan.days || 
                          (plan.name === 'IMPACT' ? 3 : plan.name === 'THRIVE' ? 5 : 1);
      
      return {
        id: plan.id || '',
        name: (plan.name || '').toUpperCase(),
        price: plan.price || 0,
        duration: `${durationDays} day${durationDays > 1 ? 's' : ''}`,
        duration_days: durationDays, // Keep numeric value for calculations
        description: plan.description || '',
        adSlots: 1, // Default to 1 slot per plan
        features: plan.features?.features || [
          `${durationDays} day display duration`,
          `High-quality LED display`,
          `Professional ad placement`
        ]
      };
    });
  };

  // Transform location data from API
  const transformLocationData = (apiLocations) => {
    if (!Array.isArray(apiLocations)) return [];
    
    return apiLocations.map(location => ({
      id: location.id || '',
      name: location.name || 'Unknown Location',
      description: location.description || '',
      location: location.name || 'Unknown Location',
      size: location.size || 'N/A',
      pixels: location.pixels || 'N/A',
      orientation: location.orientation || 'Landscape',
      aspect_ratio: location.aspect_ratio || 'N/A',
      image: location.display_image_url || '/Banner.png',
      totalInventory: location.total_slots || location.totalInventory || 0,
      total_slots: location.total_slots || location.totalInventory || 0,
      available_slots: location.available_slots || location.availableInventory || 0
    }));
  };

  // Fetch plans data
  const fetchPlans = async () => {
    if (!selectedScreen || !selectedScreen.id || !selectedDate) {
      setPlans([]);
      return;
    }

    setLoadingPlans(true);
    setCheckingAvailability(true);
    setError('');
    
    try {
      // Step 1: Get plans for specific location
      console.log('📞 Fetching plans for location:', selectedScreen.id);
      const result = await dataAPI.getPlansByLocation(selectedScreen.id);
      
      console.log('📦 Plans by location result:', result);
      
      // Handle different possible response structures
      let plansData = null;
      
      if (result.success && result.data) {
        if (result.data.data && Array.isArray(result.data.data)) {
          plansData = result.data.data;
        } else if (Array.isArray(result.data)) {
          plansData = result.data;
        } else if (result.data.plans && Array.isArray(result.data.plans)) {
          plansData = result.data.plans;
        }
      }
      
      if (plansData && Array.isArray(plansData) && plansData.length > 0) {
        const transformedPlans = transformPlanData(plansData);
        setPlans(transformedPlans);
        
        // Step 2: Pre-check availability for each plan
        await checkPlanAvailability(transformedPlans);
        
        setError('');
      } else {
        setPlans([]);
        setError('No plans available for this location.');
      }
    } catch (error) {
      console.error('❌ Error fetching plans:', error);
      setPlans([]);
      setError('Unable to load plans. Please try again.');
    } finally {
      setLoadingPlans(false);
      setCheckingAvailability(false);
    }
  };

  // Enhanced plan availability checking with duration-based logic
  const checkPlanAvailability = async (plans) => {
    if (!selectedScreen || !selectedDate || !plans || plans.length === 0) {
      return;
    }
    
    // Check if we already have availability data for this exact combination
    const cacheKey = `${selectedScreen.id}-${selectedDate}`;
    if (globalAvailabilityCache[cacheKey]) {
      console.log('🚀 Using cached availability data for', cacheKey);
      return;
    }
    
    // Clear any existing timeout to debounce rapid calls
    if (availabilityCheckTimeout) {
      clearTimeout(availabilityCheckTimeout);
    }
    
    // Debounce the availability check by 500ms to reduce rapid calls
    const timeoutId = setTimeout(async () => {
      await performAvailabilityCheck(plans);
    }, 500);
    
    setAvailabilityCheckTimeout(timeoutId);
  };

  const performAvailabilityCheck = async (plans) => {
    if (!selectedScreen || !selectedDate || !plans || plans.length === 0) {
      return;
    }
    
    setCheckingAvailability(true);
    const availabilityMap = {};
    
    try {
      // Check availability for each plan individually using the Pre-Check API
      const availabilityPromises = plans.map(async (plan) => {
        const cacheKey = `${selectedScreen.id}-${plan.id}-${selectedDate}`;
        
        // Check cache first
        if (globalAvailabilityCache[cacheKey] !== undefined) {
          return { planId: plan.id, isAvailable: globalAvailabilityCache[cacheKey] };
        }
        
        try {
          // Use the Pre-Check Full Plan Duration API
          const result = await dataAPI.checkAvailability(
            selectedScreen.id,
            plan.id, // Actual plan ID
            selectedDate
          );
          
          if (result.success && result.data) {
            const availabilityData = result.data.data || result.data;
            const isAvailable = availabilityData.isAvailable === true;
            
            // Cache the result
            globalAvailabilityCache[cacheKey] = isAvailable;
            setGlobalAvailabilityCache({ ...globalAvailabilityCache, [cacheKey]: isAvailable });
            
            return { planId: plan.id, isAvailable };
          } else {
            // If API fails, assume available (backend will validate)
            return { planId: plan.id, isAvailable: true };
          }
        } catch (error) {
          console.warn(`Availability check failed for plan ${plan.id}:`, error);
          // If error, assume available (backend will validate)
          return { planId: plan.id, isAvailable: true };
        }
      });
      
      // Wait for all checks to complete
      const results = await Promise.all(availabilityPromises);
      
      // Create availability map from results
      results.forEach(({ planId, isAvailable }) => {
        availabilityMap[planId] = isAvailable;
      });
      
      setPlanAvailability(availabilityMap);
      
      // Update global cache
      const overallCacheKey = `${selectedScreen.id}-${selectedDate}`;
      setGlobalAvailabilityCache(prev => ({
        ...prev,
        [overallCacheKey]: true
      }));
      
      console.log('✅ Plan availability checked for', plans.length, 'plans');
    } catch (error) {
      console.error('Error in availability check:', error);
      // If error, mark all plans as available (backend will validate)
      const fallbackAvailability = {};
      plans.forEach(plan => {
        fallbackAvailability[plan.id] = true;
      });
      setPlanAvailability(fallbackAvailability);
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Fetch location availability for selected date
  const fetchLocationAvailability = async (date) => {
    setLoadingAvailability(true);
    setLoadingLocations(true);
    setError(''); // Clear previous errors
    
    try {
      const result = await dataAPI.getLocationAvailability(date);
      
      if (result.success && result.data) {
        const locationsData = result.data.data || result.data;
        if (Array.isArray(locationsData) && locationsData.length > 0) {
          const transformedLocations = transformLocationData(locationsData);
          
          // Always show locations, regardless of availability
          
          // Show all locations regardless of availability
          setLocations(transformedLocations);
          setAvailabilityData({});
          setError('');
        } else {
          // No locations in response - show backend message
          setLocations([]);
          setAvailabilityData({});
          const errorMessage = result.message || 'No available inventory for this location and date';
          setError(errorMessage);
        }
      } else {
        // API returned success: false or no data - use backend error message
        const errorMessage = result.error || result.message || 'No available inventory for this location and date';
        setError(errorMessage);
        setLocations([]);
        setAvailabilityData({});
      }
    } catch (error) {
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
    // Just select the screen - don't block here
    // Availability will be checked when plan is selected
    setSelectedScreen(screen);
    setShowScreenModal(false);
    setError(''); // Clear any previous errors
    
    setTimeout(() => {
      const step3Element = document.querySelector('[data-step="3"]');
      if (step3Element) {
        step3Element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 500);
  };


  const checkUserBookingConflict = (locationId, startDate, durationDays) => {
    if (!orders || orders.length === 0) {
      return null;
    }
    
    const newStart = new Date(startDate);
    const newEnd = new Date(newStart);
    newEnd.setDate(newEnd.getDate() + durationDays - 1);
    
    const conflicts = orders.filter(order => {
      if (order.status === 'Cancelled Display' || 
          order.status === 'Payment Failed') {
        return false;
      }
      
      const orderLocationId = Number(order.locationId || order.location_id);
      const newLocationId = Number(locationId);
      
      if (orderLocationId !== newLocationId) {
        return false;
      }
      
      const orderStart = new Date(order.startDate || order.start_date);
      const orderDuration = order.planDuration || order.plans?.duration_days || order.duration_days || 
                           (order.plan?.name === 'IMPACT' ? 3 : order.plan?.name === 'THRIVE' ? 5 : 1);
      const orderEnd = new Date(orderStart);
      orderEnd.setDate(orderEnd.getDate() + orderDuration - 1);
      
      const hasOverlap = newStart <= orderEnd && orderStart <= newEnd;
      
      return hasOverlap;
    });
    
    return conflicts.length > 0 ? conflicts[0] : null;
  };

  const handlePlanSelect = async (plan) => {
    const isAvailable = planAvailability[plan.id] !== false;
    
    
    if (!isAvailable) {
      // Plan is not available - silently ignore the click
      return;
    }
    
    // Plan is available, proceed with selection
    setSelectedPlan(plan);
    setError('');
    
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
      // Check file size (50MB limit)
      const maxSize = 50 * 1024 * 1024; // 50MB in bytes
      if (file.size > maxSize) {
        setUploadError('File size must be less than 50MB');
        return;
      }
      
      // Show Important Notice popup before allowing file selection
      setShowImportantNotice(true);
      
      // Store the file temporarily
      setDesignFile(file); 
      setUploadError('');
      
      // Create preview for both images and videos
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
      // Trim file name and determine file type
      const trimmedFileName = designFile.name.trim().replace(/\s+/g, '');
      const fileType = designFile.type.startsWith('video/') ? 'video' : 'image';
      
      
      // Try to get signed URL from API
      const signedUrlResponse = await filesAPI.getSignedUploadUrl(
        trimmedFileName,
        designFile.type
      );

      if (signedUrlResponse.success) {
        const uploadData = signedUrlResponse.data.data || signedUrlResponse.data;
        setSignedUrlResponse(uploadData); 
        if (uploadData && uploadData.signedUrl) {
        const { signedUrl, path: filePath, fileName } = uploadData;

        // Upload file to S3
        const uploadResponse = await fetch(signedUrl, {
          method: 'PUT',
          body: designFile,
          headers: {
            'Content-Type': designFile.type,
          },
        });

          if (uploadResponse.ok) {
            setFileUploaded(true); // Mark as uploaded
            setShowUploadModal(false);
            setShowConfirmation(true);
            
            // Store file type for later use in order creation
            setDesignFile(prevFile => ({
              ...prevFile,
              fileType: fileType,
              filePath: filePath
            }));
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
      // If it's a network error or API not available, allow user to proceed
      if (error.message.includes('Network error') || error.message.includes('Failed to get upload URL')) {
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
    // Show loading immediately
    setConfirmingOrder(true);
    
    // Validate all steps and redirect to incomplete step
    if (!selectedDate) {
      setIncompleteStep('date-selection');
      setError('Please select a date to continue');
      setConfirmingOrder(false);
      setTimeout(() => {
        document.querySelector('[data-step="1"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return;
    }
    
    if (!selectedScreen) {
      setIncompleteStep('screen-selection');
      setError('Please select a location to continue');
      setConfirmingOrder(false);
      setTimeout(() => {
        document.querySelector('[data-step="2"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return;
    }
    
    if (!selectedPlan) {
      setIncompleteStep('plan-selection');
      setError('Please select a plan to continue');
      setConfirmingOrder(false);
      setTimeout(() => {
        document.querySelector('[data-step="3"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return;
    }

    const isPlanAvailable = planAvailability[selectedPlan.id] !== false;

    if (!isPlanAvailable) {
      setIncompleteStep('plan-selection');
      setError('Selected plan is no longer available. Please select a different plan.');
      setConfirmingOrder(false);
      setTimeout(() => {
        document.querySelector('[data-step="3"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return;
    }
    
    if (!designFile || !fileUploaded) {
      setIncompleteStep('file-upload');
      setError('Please upload your creative file to continue');
      setConfirmingOrder(false);
      setTimeout(() => {
        document.querySelector('[data-step="4"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return;
    }
    
    if (!address.trim()) {
      setIncompleteStep('order-details');
      setError('Please enter your billing address');
      setConfirmingOrder(false);
      return;
    }
    
    if (gstApplicable && (!companyName.trim() || !gstNumber.trim())) {
      setIncompleteStep('order-details');
      setError('Please fill in all GST details');
      setConfirmingOrder(false);
      return;
    }
    
    if (gstApplicable && gstNumber.trim()) {
      const gstValidation = validateGSTNumber(gstNumber.trim());
      if (!gstValidation.valid) {
        setIncompleteStep('order-details');
        setError(gstValidation.error);
        setConfirmingOrder(false);
        return;
      }
    }
    
    if (!termsAccepted) {
      setIncompleteStep('order-details');
      setError('Please accept the terms and conditions');
      setConfirmingOrder(false);
      return;
    }
    
    setIncompleteStep(null);
    

    try {
      const orderData = {
        planId: selectedPlan.id,
        locationId: selectedScreen.id,
        screenId: selectedScreen.id, 
        startDate: selectedDate,
        displayDate: selectedDate, 
        creativeFilePath: signedUrlResponse?.path || '', 
        creativeFileName: designFile?.name?.trim().replace(/\s+/g, '') || '',
        designFile: designFile?.name?.trim().replace(/\s+/g, '') || '', 
        fileType: designFile?.fileType || (designFile?.type?.startsWith('video/') ? 'video' : 'image'),
        totalAmount: selectedPlan.price || 0, // Send base price as totalAmount (without GST)
        baseAmount: selectedPlan.price || 0,
        price: selectedPlan.price || 0, // Send base price, let backend calculate GST
        address: address,
        city: '', // You might want to extract from address or add a city field
        state: state, // State selection for GST calculation
        zip: '', // You might want to add a zip field
        gstApplicable: true, // Always true now since we always add GST
        companyName: companyName || 'N/A', // Provide default if not filled
        gstNumber: gstNumber || 'N/A', // Provide default if not filled
        gstInfo: gstNumber || 'N/A', // API expects gstInfo
        termsAccepted: termsAccepted,
        couponCode: couponCode,
        discountAmount: discountAmount,
        screenName: selectedScreen.name,
        location: selectedScreen.location,
        duration_days: selectedPlan.duration_days || (selectedPlan.name === 'IMPACT' ? 3 : selectedPlan.name === 'THRIVE' ? 5 : 1),
        planDuration: selectedPlan.duration_days || (selectedPlan.name === 'IMPACT' ? 3 : selectedPlan.name === 'THRIVE' ? 5 : 1),
        
        email: user?.email || '',
        phone: user?.phoneNumber || user?.phone || '',
        userId: user?.id || user?.userId || 'unknown'
      };

    
      const result = await createOrder(orderData);
    
      if (result.success) {
        setNewOrder(result.order);
        
        // Check if we have razorpay_order_id from API response
        // The API returns: response.data.data.order.razorpay_order_id
        const razorpayOrderId = result.apiResponse?.data?.order?.razorpay_order_id || 
                                result.apiResponse?.data?.razorpayOrder?.id ||
                                result.apiResponse?.razorpay_order_id || 
                                result.order?.razorpay_order_id || 
                                result.order?.razorpayOrderId;
        
        // Debug logging
        console.log('💳 Order creation result:', result);
        console.log('💳 API Response:', result.apiResponse);
        console.log('💳 Razorpay Order ID found:', razorpayOrderId);
        
        if (razorpayOrderId) {
          // Show Razorpay payment modal
          console.log('💳 Initiating Razorpay payment for order:', result.order);
          handlePayment(result.order, razorpayOrderId);
        } else {
          console.error('❌ No Razorpay Order ID found in API response');
          console.error('❌ Expected structure: response.data.data.order.razorpay_order_id');
          console.error('❌ Actual response structure:', result.apiResponse);
          showToast('Payment gateway not available. Please contact support.', 'error');
        }
      } else {
        setError(result.error || 'Failed to create order. Please try again.');
      }
    } catch (error) {
      setError('Failed to create order. Please try again.');
    } finally {
      setConfirmingOrder(false);
    }
  };

  // Handle Razorpay payment
  const handlePayment = (order, razorpayOrderId) => {
    console.log('💳 Starting payment process for order:', order.id);
    console.log('💳 Razorpay Order ID:', razorpayOrderId);
    
    // Load Razorpay script if not already loaded
    if (!window.Razorpay) {
      console.log('💳 Loading Razorpay script...');
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        console.log('✅ Razorpay script loaded');
        openRazorpay(order, razorpayOrderId);
      };
      script.onerror = () => {
        console.error('❌ Failed to load Razorpay script');
        showToast('Failed to load payment gateway. Please try again.', 'error');
      };
      document.body.appendChild(script);
    } else {
      console.log('✅ Razorpay script already loaded');
      openRazorpay(order, razorpayOrderId);
    }
  };

  const openRazorpay = (order, razorpayOrderId) => {
    console.log('💳 Opening Razorpay with order:', order);
    console.log('💳 Razorpay Order ID:', razorpayOrderId);
    console.log('💳 Razorpay Key:', RAZORPAY_KEY);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const amount = convertToPaise(order.totalAmount || order.amount || order.total_cost || 0);
    console.log('💳 Amount in paise:', amount);
    
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
        setProcessingPayment(true);
        
        try {
          const verificationData = {
            orderId: order.id.toString(),
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          };
          
          const verifyResponse = await verifyPayment(
            verificationData.orderId,
            verificationData.razorpay_order_id,
            verificationData.razorpay_payment_id,
            verificationData.razorpay_signature
          );
            
            if (verifyResponse.success) {
            window.location.href = `/booking-success?orderId=${order.id}&payment_id=${response.razorpay_payment_id}&verified=true`;
            } else {
            setProcessingPayment(false);
            const errorMessage = verifyResponse.error || verifyResponse.message || 'Payment verification failed';
            window.location.href = `/booking-failed?orderId=${order.id}&message=${encodeURIComponent(errorMessage)}`;
            }
          } catch (error) {
          setProcessingPayment(false);
          const errorMessage = error.message || 'Payment verification failed. Please contact support.';
          window.location.href = `/booking-failed?orderId=${order.id}&message=${encodeURIComponent(errorMessage)}`;
        }
      },
      modal: {
        ondismiss: function() {
          window.location.href = `/booking-failed?orderId=${order.id}&message=${encodeURIComponent('Payment was cancelled')}`;
        }
      }
    };
    
    try {
      console.log('💳 Opening Razorpay with options:', options);
      const razorpay = new window.Razorpay(options);
      console.log('💳 Razorpay instance created, opening modal...');
      razorpay.open();
      console.log('✅ Razorpay modal opened successfully');
    } catch (error) {
      console.error('❌ Failed to open Razorpay modal:', error);
      showToast('Failed to open payment gateway. Please try again.', 'error');
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
    const subtotal = Math.max(0, baseAmount - discount);
    
    // Add GST based on state selection
    const gstAmount = calculateGST();
    return subtotal + gstAmount;
  };

  // Calculate GST amount separately
  const calculateGST = () => {
    if (!selectedPlan || !selectedPlan.price) return 0;
    const baseAmount = selectedPlan.price;
    const discount = discountAmount;
    const subtotal = Math.max(0, baseAmount - discount);
    
    // GST calculation based on state
    if (state === 'Karnataka') {
      // Intra-state: CGST + SGST (9% + 9% = 18%)
      return subtotal * 0.18;
    } else {
      // Inter-state: IGST (18%)
      return subtotal * 0.18;
    }
  };

        return (
    <div className={styles.bookingFlow}>
      {/* Payment Processing Overlay */}
      {processingPayment && (
        <div className={styles.paymentProcessingOverlay}>
          <div className={styles.paymentProcessingContent}>
            <div className={styles.spinner}></div>
            <h2>Processing Payment...</h2>
            <p>Please wait while we verify your payment</p>
          </div>
        </div>
      )}
      
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Book Your Ad Slot</h1>
          <p>Choose your date, location and plan to get started</p>
        </div>


        {/* Step 1: Date Selection */}
        <div className={`${styles.step} ${incompleteStep === 'date-selection' ? styles.incompleteStep : ''}`} data-step="1">
          <h2>Step1: Select Start Date</h2>
          <div className={styles.dateSelection}>
              <input
                type="date"
                value={selectedDate}
              onChange={(e) => handleDateSelect(e.target.value)}
                min={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                className={styles.dateInput}
              />
            </div>
          </div>

        {/* Step 2: Location Selection */}
        {selectedDate && (
          <div className={`${styles.step} ${incompleteStep === 'screen-selection' ? styles.incompleteStep : ''}`} data-step="2">
            <h2>Step 2: Choose Location</h2>
            {loadingAvailability || loadingLocations ? (
              <div className={styles.loadingMessage}>
                <LoadingSpinner size="medium" text="Loading screen availability..." />
              </div>
            ) : locations.length === 0 ? (
              <div className={styles.loadingMessage}>
                <p>Loading available locations...</p>
              </div>
            ) : (
              <div className={styles.screensGrid}>
                {locations.map((location) => {
                  const isSelected = selectedScreen?.id === location.id;
                  const hasAvailableSlots = (location.available_slots || 0) > 0;
                  
        return (
                  <div
                    key={location.id}
                    className={`${styles.screenCard} ${isSelected ? styles.selectedCard : ''}`}
                    onClick={() => handleScreenSelect(location)}
                    style={{ cursor: 'pointer' }}
                  >
                    {isSelected && <div className={styles.selectedBadge}>✓ Selected</div>}
                    <img src={location.image} alt={location.name} className={styles.screenImage} />
                    <div className={styles.screenInfo}>
                    <h3>{location.name}</h3>
                      <p>{location.location}</p>
                      <p>Size: {location.size} ft</p>
                      <p>Orientation: {location.orientation}</p>
                      <p>Resolution: {location.pixels} px</p>
                      <p>Aspect Ratio: {location.aspect_ratio}</p>
                  </div>
                  </div>
                  );
                })}
                </div>
              )}
            </div>
        )}

        {/* Step 3: Plan Selection */}
        {selectedScreen && (
          <div className={`${styles.step} ${incompleteStep === 'plan-selection' ? styles.incompleteStep : ''}`} data-step="3">
            <h2>Step 3: Select Plan</h2>
            {loadingPlans ? (
              <div className={styles.loadingMessage}>
                <LoadingSpinner size="medium" text="Loading plans..." />
              </div>
            ) : checkingAvailability ? (
              <div className={styles.loadingMessage}>
                <LoadingSpinner size="small" text="Checking availability..." />
              </div>
            ) : error && plans.length === 0 ? (
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
                {plans.map((plan) => {
                  const isAvailable = planAvailability[plan.id] !== false; 
                  const isSelected = selectedPlan?.id === plan.id;
                  
                  return (
                  <div
                    key={plan.id}
                    className={`${styles.planCard} ${isSelected ? styles.selected : ''} ${!isAvailable ? styles.unavailable : ''}`}
                    onClick={() => isAvailable && handlePlanSelect(plan)}
                    style={{ cursor: isAvailable ? 'pointer' : 'not-allowed' }}
                  >
                    {isSelected && <div className={styles.selectedBadge}>✓ Selected</div>}
                    {!isAvailable && <div className={styles.unavailableBadge}>Not Available</div>}
                    
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
                  );
                })}
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
          <div className={`${styles.step} ${incompleteStep === 'file-upload' ? styles.incompleteStep : ''}`} data-step="4">
            <h2>Step 4: Upload Design</h2>
            

            {!designFile ? (
              /* Step 1: File Selection - No file selected yet */
              <div className={styles.uploadArea}>
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileSelect}
                  accept=".jpg,.jpeg,.png,.mov,.mp4,image/jpeg,image/png,video/mp4,video/quicktime"
                  className={styles.fileInput}
                />
                <label htmlFor="file-upload" className={styles.uploadLabel}>
                  <div className={styles.uploadIcon}>📁</div>
                  <p className={styles.uploadText}>Click to Select Creative File</p>
                  <small>Accepted formats: JPG, JPEG, PNG, MP4, MOV (Max 50MB)</small>
                </label>
                
                {uploadError && (
                  <div className={styles.errorMessage}>{uploadError}</div>
                )}
              </div>
            ) : !fileUploaded ? (
              /* Step 2: File Selected - Show Preview and Upload Button */
              <div className={styles.previewAndUploadSection}>
                <div className={styles.previewHeader}>
                  <h3>📋 Review Your Creative</h3>
                  <p>Please review your {designFile.type?.startsWith('video/') ? 'video' : 'image'} before uploading</p>
                </div>
                
                {/* Large Preview Area */}
                <div className={styles.largePreviewArea}>
                  {designFile.type?.startsWith('video/') ? (
                    <div className={styles.videoPreviewWrapper}>
                      <video 
                        src={designPreview} 
                        controls 
                        className={styles.largePreviewVideo}
                        preload="metadata"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  ) : (
                    <div className={styles.imagePreviewWrapper}>
                      <img src={designPreview} alt="Preview" className={styles.largePreviewImage} />
                    </div>
                  )}
                </div>
                
                <div className={styles.fileInfoBar}>
                  <div className={styles.fileDetails}>
                    <span className={styles.fileIcon}>
                      {designFile.type?.startsWith('video/') ? '🎬' : '📸'}
                    </span>
                    <div className={styles.fileText}>
                      <p className={styles.fileNameDisplay}>{designFile.name}</p>
                      <p className={styles.fileSizeDisplay}>
                        {(designFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
                
                {uploadError && (
                  <div className={styles.errorMessage}>{uploadError}</div>
                )}
                
                <div className={styles.uploadActionsLarge}>
                  <button
                    onClick={() => {
                      setDesignFile(null);
                      setDesignPreview(null);
                      const fileInput = document.getElementById('file-upload');
                      if (fileInput) fileInput.value = '';
                    }}
                    className={styles.cancelButtonLarge}
                  >
                    ← Choose Different File
                  </button>
                  <button
                    onClick={uploadFile}
                    disabled={loading}
                    className={styles.uploadButtonLarge}
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="small" text="" className="inlineSpinner" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        ✓ Looks Good - Upload Creative
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* After Upload - Show success message only */
              <div className={styles.uploadedSection}>
                <div className={styles.uploadSuccessLarge}>
                  <div className={styles.successIconLarge}>✅</div>
                  <h3 className={styles.successTitle}>Creative Uploaded Successfully!</h3>
                  <p className={styles.successSubtext}>Your {(designFile.fileType === 'video' || designFile.type?.startsWith('video/')) ? 'video' : 'image'} has been uploaded and is ready.</p>
                </div>
                
                <button
                  onClick={() => {
                    setFileUploaded(false);
                    setDesignFile(null);
                    setDesignPreview(null);
                    const fileInput = document.getElementById('file-upload');
                    if (fileInput) fileInput.value = '';
                  }}
                  className={styles.changeFileButton}
                >
                  Change Creative
                </button>
              </div>
            )}
            </div>
        )}

        {/* Step 5: Order Details */}
        {designFile && (
          <div className={`${styles.step} ${incompleteStep === 'order-details' ? styles.incompleteStep : ''}`} data-step="5">
            <h2>Step 5: Order Details</h2>
            <div className={styles.orderForm}>
              <div className={styles.formGroup}>
                <label>Billing Address <span className={styles.required}>*</span></label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your billing address"
                  className={styles.textarea}
                />
              </div>

              <div className={styles.formGroup}>
                <label>State <span className={styles.required}>*</span></label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className={styles.select}
                >
                  <option value="Karnataka">Karnataka</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                  <option value="Assam">Assam</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Chhattisgarh">Chhattisgarh</option>
                  <option value="Goa">Goa</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Himachal Pradesh">Himachal Pradesh</option>
                  <option value="Jharkhand">Jharkhand</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Manipur">Manipur</option>
                  <option value="Meghalaya">Meghalaya</option>
                  <option value="Mizoram">Mizoram</option>
                  <option value="Nagaland">Nagaland</option>
                  <option value="Odisha">Odisha</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Sikkim">Sikkim</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Tripura">Tripura</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Uttarakhand">Uttarakhand</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Puducherry">Puducherry</option>
                </select>
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
                    <label>Company Name <span className={styles.required}>*</span></label>
                <input
                  type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Enter company name"
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>GST Number <span className={styles.required}>*</span></label>
                    <input
                      type="text"
                      value={gstNumber}
                      onChange={(e) => {
                        // Convert to uppercase, remove special characters, and limit to 15 characters
                        const cleanedValue = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15);
                        setGstNumber(cleanedValue);
                        
                        // Real-time validation
                        if (cleanedValue.length > 0) {
                          const validation = validateGSTNumber(cleanedValue);
                          if (!validation.valid) {
                            // Show validation error in real-time
                            setError(validation.error);
                          } else {
                            // Clear error if valid
                            setError('');
                          }
                        }
                      }}
                      placeholder="Enter GST number (e.g., 27AAPCU1234A1Z5)"
                      className={styles.input}
                      maxLength={15}
                      pattern="[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}"
                      title="GST number format: 2 digits (state) + 5 letters + 4 digits + 1 letter + 1 digit/letter + Z + 1 digit/letter"
                    />
                    {gstNumber && (
                      <div className={styles.gstHelpText}>
                        Format: State Code (2 digits) + PAN (10 chars) + Entity (1) + Z + Checksum (1)
                      </div>
                    )}
                  </div>
                </>
              )}
              
              <div className={styles.formGroup}>
                <label>Coupon Code (Optional)</label>
                <div className={styles.couponInput}>
                <input
                  type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      setCouponError(''); // Clear error when user types
                    }}
                    placeholder="Enter coupon code"
                    className={styles.input}
                  />
                  <button
                    onClick={validateCoupon}
                    disabled={!couponCode.trim() || validatingCoupon}
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
                  <div className={styles.couponErrorMessage}>{couponError}</div>
                )}
                {discountAmount > 0 && !couponError && (
                  <div className={styles.couponSuccessMessage}>
                    ✓ Coupon applied! You saved ₹{discountAmount.toLocaleString('en-IN')}
                  </div>
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
                    <span className={styles.required}>*</span>
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
                <span>Start Date:</span>
                <span>{selectedDate}</span>
              </div>
                  <div className={styles.summaryItem}>
                    <span>Location:</span>
                    <span className={styles.locationValue}>{selectedScreen?.name}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Plan:</span>
                    <span>{selectedPlan?.name}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Duration:</span>
                    <span>{selectedPlan?.duration || '1 day'}</span>
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
              <div className={styles.summaryItem}>
                <span>
                  {state === 'Karnataka' ? 'GST (CGST 9% + SGST 9%):' : 'GST (IGST 18%):'}
                </span>
                <span>₹{calculateGST().toLocaleString('en-IN')}</span>
              </div>
              <div className={`${styles.summaryItem} ${styles.total}`}>
                <span>Total:</span>
                <span>₹{calculateTotal().toLocaleString('en-IN')}</span>
                  </div>
                </div>

                    <button
              onClick={handleConfirmOrder}
              disabled={confirmingOrder || !designFile || !fileUploaded || !address.trim() || !termsAccepted}
              className={styles.confirmButton}
            >
              {confirmingOrder ? (
                <>
                  <LoadingSpinner size="small" text="" className="inlineSpinner" />
                  Creating Order...
                </>
              ) : (
                'Confirm Order'
              )}
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
      
      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}
          </div>
    </div>
  );
}