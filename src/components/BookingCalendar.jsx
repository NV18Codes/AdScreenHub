import React, { useState, useEffect } from 'react';
import { useOrders } from '../hooks/useOrders';
import { useAuth } from '../contexts/AuthContext';
import { isDateDisabled, validateFile, generateOrderId, compressImage, manageStorageQuota } from '../utils/validation';
import { couponsAPI, dataAPI } from '../config/api';
import LoadingSpinner from './LoadingSpinner';
import Toast from './Toast';
import styles from '../styles/BookingCalendar.module.css';

export default function BookingCalendar() {
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
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  // Transform API plan data to match frontend format
  const transformPlanData = (apiPlans) => {
    return apiPlans.map(plan => ({
      id: plan.id,
      name: plan.name.toUpperCase(),
      price: plan.price,
      duration: `${plan.duration_days} day${plan.duration_days > 1 ? 's' : ''}`,
      adSlots: plan.features.slots,
      features: [
        `${plan.features.slots} ad slots (${plan.features.duration_sec} sec/slot)`,
        ...plan.features.features
      ]
    }));
  };

  // Transform location data from API
  const transformLocationData = (apiLocations) => {
    const screenDetails = {
      1: { size: "20ft x 10ft", pixels: "1920px x 1080px", location: "MG Road, Bangalore" },
      2: { size: "15ft x 8ft", pixels: "1440px x 720px", location: "Koramangala, Bangalore" },
      3: { size: "25ft x 12ft", pixels: "2560px x 1280px", location: "Indiranagar, Bangalore" }
    };
    
    return apiLocations.map(location => ({
      id: location.id,
      name: location.name,
      description: location.description,
      location: screenDetails[location.id]?.location || location.name,
      size: screenDetails[location.id]?.size || "1440px x 720px",
      pixels: screenDetails[location.id]?.pixels || "1440px x 720px",
      orientation: "Landscape",
      image: "/Banner.png", // Use Banner.png for all screens
      totalInventory: location.total_slots,
      available_slots: location.available_slots
    }));
  };

  // Fetch plans data
  const fetchPlans = async () => {
    setLoadingPlans(true);
    try {
      const result = await dataAPI.getPlans();
      // Handle nested data structure: result.data.data
      if (result.success && result.data && result.data.data && Array.isArray(result.data.data)) {
        const transformedPlans = transformPlanData(result.data.data);
        setPlans(transformedPlans);
      } else if (result.success && result.data && Array.isArray(result.data)) {
        const transformedPlans = transformPlanData(result.data);
        setPlans(transformedPlans);
      } else {
        setPlans([]);
      }
    } catch (error) {
      console.error('Plans API error:', error);
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  };

  // Fetch location availability for a specific date
  const fetchLocationAvailability = async (date) => {
    if (!date) return;
    
    setLoadingAvailability(true);
    setLoadingLocations(true);
    
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API timeout')), 5000)
      );
      
      const apiPromise = dataAPI.getLocationAvailability(date);
      const result = await Promise.race([apiPromise, timeoutPromise]);
      
      
      // Handle nested data structure: result.data.data
      let locationsData = null;
      if (result.success && result.data && result.data.data && Array.isArray(result.data.data)) {
        locationsData = result.data.data;
      } else if (result.success && result.data && Array.isArray(result.data)) {
        locationsData = result.data;
      }
      
      if (locationsData) {
        // Transform and set locations data
        const transformedLocations = transformLocationData(locationsData);
        setLocations(transformedLocations);
        
        // Set availability data
        const transformedAvailability = {};
        locationsData.forEach(location => {
          transformedAvailability[location.id] = {
            available: location.available_slots > 0,
            slots: location.available_slots,
            totalSlots: location.total_slots,
            name: location.name,
            description: location.description
          };
        });
        setAvailabilityData(transformedAvailability);
      } else {
        console.error('Location availability API failed - unexpected structure:', result);
        setLocations([]);
        setAvailabilityData({});
      }
    } catch (error) {
      console.error('Location availability API error:', error);
      setLocations([]);
      setAvailabilityData({});
    } finally {
      setLoadingAvailability(false);
      setLoadingLocations(false);
    }
  };

  // Load plans when component mounts (only if authenticated)
  useEffect(() => {
    if (isAuthenticated()) {
      fetchPlans();
    } else {
    }
  }, [isAuthenticated]);

  // Load saved design from localStorage
  useEffect(() => {
    const savedDesign = localStorage.getItem('adscreenhub_design');
    if (savedDesign) {
      setDesignPreview(savedDesign);
    }
  }, []);

  const handleDateChange = async (e) => {
    const newDate = e.target.value;
    console.log('Date selected:', newDate);
    setSelectedDate(newDate);
    setSelectedScreen(null);
    setSelectedPlan(null);
    
    // Clear data when no date is selected
    if (!newDate) {
      setAvailabilityData({});
      setLocations([]);
      return;
    }
    
    // Only fetch if authenticated
    if (!isAuthenticated()) {
      console.log('User not authenticated, please login to check availability');
      return;
    }
    
    // Step 2: Fetch location availability for the selected date
    console.log('Step 2: Fetching location availability for date:', newDate);
    await fetchLocationAvailability(newDate);
  };

  const handleScreenSelect = async (screen) => {
    console.log('Screen selected:', screen.name);
    setSelectedScreen(screen);
    setShowScreenModal(true);
  };

  const handlePlanSelect = async (plan) => {
    setSelectedPlan(plan);
    
    // Step 3: Check specific slot availability if we have screen, date, and plan
    if (selectedScreen && selectedDate) {
      
      try {
        const availabilityResult = await dataAPI.checkSlotAvailability(selectedScreen.id, selectedDate, plan.id);
        
        // Handle nested data structure: result.data.data.isAvailable
        const isSlotAvailable = availabilityResult.data?.data?.isAvailable;
        
        // Update slot availability status for visual feedback
        const statusKey = `${selectedScreen.id}-${selectedDate}-${plan.id}`;
        setSlotAvailabilityStatus(prev => ({
          ...prev,
          [statusKey]: isSlotAvailable
        }));
        
        if (availabilityResult.success && availabilityResult.data && availabilityResult.data.data && !isSlotAvailable) {
          setShowUnavailableModal(true);
          setSelectedPlan(null); // Reset plan selection
          return;
        } else {
        }
      } catch (error) {
        console.warn('⚠️ Slot availability check failed, proceeding with booking:', error);
      }
    }
  };

  const handleCouponValidation = async () => {
    if (!couponCode.trim()) {
      setCouponError('');
      setDiscountAmount(0);
      return;
    }

    setValidatingCoupon(true);
    setCouponError('');

    await new Promise(resolve => setTimeout(resolve, 1000));

    const validCoupons = {
      'WELCOME10': 100,
      'SAVE20': 200,
      'DISCOUNT50': 500,
      'FIRST50': 50
    };

    const discount = validCoupons[couponCode.toUpperCase()];
    
    if (discount) {
      setDiscountAmount(discount);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code - order will proceed without discount');
      setDiscountAmount(0);
    }

    setValidatingCoupon(false);
  };

  const handleConfirmBooking = async () => {
    if (!designFile) {
      showToast('Please upload your design first', 'error');
      return;
    }

    if (!address.trim()) {
      showToast('Please enter your address', 'error');
      return;
    }

    if (gstApplicable && (!companyName.trim() || !gstNumber.trim())) {
      showToast('Please enter company name and GST number when GST is applicable', 'error');
      return;
    }

    if (!termsAccepted) {
      showToast('Please accept the terms and conditions', 'error');
      return;
    }

    const finalDiscount = couponError ? 0 : discountAmount;
    
    const orderData = {
      screenId: selectedScreen.id,
      planId: selectedPlan.id,
      displayDate: selectedDate,
      designFile: designFile.name,
      supportingDoc: null,
      totalAmount: selectedPlan.price - finalDiscount,
      thumbnail: designPreview,
      address: address,
      gstApplicable: gstApplicable,
      companyName: companyName,
      gstNumber: gstNumber,
      couponCode: couponCode,
      screenName: selectedScreen.name,
      location: selectedScreen.location
    };

    const result = await createOrder(orderData);
    
    if (result.success) {
      setNewOrder(result.order);
      setShowConfirmation(true);
      setShowUploadModal(false);
      
      // Reset form
      setSelectedDate('');
      setSelectedScreen(null);
      setSelectedPlan(null);
      setDesignFile(null);
      setDesignPreview(null);
      setAddress('');
      setGstApplicable(false);
      setCompanyName('');
      setGstNumber('');
      setTermsAccepted(false);
      setCouponCode('');
      setDiscountAmount(0);
      setCouponError('');
      
      localStorage.removeItem('adscreenhub_design');
    } else {
      showToast(result.error || 'Failed to create order. Please try again.', 'error');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'video/mp4', 'video/mpeg4', 'video/mpeg', 'image/gif'];
    const maxSize = 15 * 1024 * 1024; // 15MB

    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please upload JPG, PNG, MP4, or GIF files only.');
      return;
    }

    if (file.size > maxSize) {
      setUploadError('File size too large. Please upload files smaller than 15MB.');
      return;
    }

    setUploadError('');
    setDesignFile(file);

    try {
      if (!manageStorageQuota()) {
        setUploadError('Storage space is full. Please clear some data and try again.');
        return;
      }

      const compressedPreview = await compressImage(file, 800, 0.7);
      setDesignPreview(compressedPreview);
      
      try {
        localStorage.setItem('adscreenhub_design', compressedPreview);
      } catch (error) {
        if (error.name === 'QuotaExceededError') {
          manageStorageQuota();
          localStorage.setItem('adscreenhub_design', compressedPreview);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error processing image:', error);
      setUploadError('Error processing image. Please try again.');
    }
  };

  const handleBooking = () => {
    if (!selectedDate || !selectedScreen || !selectedPlan) {
      showToast('Please select date, screen, and plan', 'error');
      return;
    }
    
    setShowWarningModal(true);
  };

  const handleAcceptWarning = () => {
    setShowWarningModal(false);
    setShowUploadModal(true);
  };

  const handleCancel = () => {
    setShowUploadModal(false);
    setShowScreenModal(false);
    setDesignFile(null);
    setDesignPreview(null);
    localStorage.removeItem('adscreenhub_design');
  };

  // Get minimum date (today + 2 days)
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + 2);
  const minDateString = minDate.toISOString().split('T')[0];

  // Format date to dd-mm-yyyy
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Show login message if not authenticated
  if (!isAuthenticated()) {
    return (
      <div className={styles.bookingCalendar}>
        <div className={styles.bookingSection}>
          <div className={styles.authMessage}>
            <h2>Please Login to Book an Ad</h2>
            <p>You need to be logged in to access the booking calendar and check screen availability.</p>
            <button 
              onClick={() => window.location.href = '/login'}
              className={styles.loginBtn}
            >
              Login to Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.bookingCalendar}>
      <div className={styles.bookingSection}>
        <div className={styles.dateSection}>
          <h2>Select Display Start Date</h2>
          <div className={styles.dateInputWrapper}>
            <svg className={styles.calendarIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              min={minDateString}
              className={styles.dateInput}
            />
          </div>
          <p className={styles.dateNote}>
            Note: Bookings must be made at least 2 days in advance
          </p>
        </div>

        {selectedDate && (
          <div className={styles.screensSection}>
            <h2>Choose Your LED Screen</h2>
            {loadingAvailability || loadingLocations ? (
              <div className={styles.loadingMessage}>
                <LoadingSpinner size="medium" text="Loading screen availability..." />
              </div>
            ) : locations.length === 0 ? (
              <div className={styles.loadingMessage}>
                <p>No screens available for this date. Please try another date.</p>
              </div>
            ) : (
              <div className={styles.screensGrid}>
                {locations.map((screen) => {
                  let availability;
                  let isFullyBooked = false;
                  let hasInventory = true;
                  
                  if (availabilityData[screen.id]) {
                    availability = availabilityData[screen.id];
                    isFullyBooked = !availability.available || availability.slots === 0;
                    hasInventory = availability.available && availability.slots > 0;
                  } else {
                    // Default to available if no API data
                    availability = { available: true, slots: screen.totalInventory || 3 };
                    isFullyBooked = false;
                    hasInventory = true;
                  }
                  
                  return (
                    <div
                      key={screen.id}
                      className={`${styles.screenCard} ${isFullyBooked ? styles.fullyBooked : ''} ${hasInventory ? styles.available : ''}`}
                      onClick={() => hasInventory ? handleScreenSelect(screen) : null}
                    >
                      <img src={screen.image} alt={screen.name} className={styles.screenImage} />
                      <div className={styles.screenInfo}>
                        <h3>{screen.name}</h3>
                        <p className={styles.screenLocation}>{screen.location}</p>
                        <p className={styles.screenSize}>{screen.size}</p>
                        <p className={styles.screenPixels}>{screen.pixels}</p>
                        <p className={styles.screenPrice}>LED Screen Available</p>
                        
                        {isFullyBooked ? (
                          <div className={styles.fullyBookedBadge}>
                            <span>Fully Booked</span>
                          </div>
                        ) : (
                          <div className={styles.inventoryInfo}>
                            <span className={styles.availableSlots}>
                              {availability.slots} slot{availability.slots !== 1 ? 's' : ''} available
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Screen Selection Modal */}
      {showScreenModal && selectedScreen && (
        <div className={styles.modalOverlay} onClick={() => setShowScreenModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.modalClose}
              onClick={() => setShowScreenModal(false)}
            >
              ×
            </button>
            
            <div className={styles.modalHeader}>
              <h2>{selectedScreen.name}</h2>
              <p>{selectedScreen.description}</p>
            </div>

            <div className={styles.screenDetails}>
              <img src={selectedScreen.image} alt={selectedScreen.name} />
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <strong>Location:</strong> {selectedScreen.location}
                </div>
                <div className={styles.detailItem}>
                  <strong>Size:</strong> {selectedScreen.size}
                </div>
                <div className={styles.detailItem}>
                  <strong>Resolution:</strong> {selectedScreen.pixels}
                </div>
                <div className={styles.detailItem}>
                  <strong>Orientation:</strong> {selectedScreen.orientation}
                </div>
              </div>
            </div>

            <div className={styles.plansSection}>
              <h3>Select Your Plan</h3>
              {loadingPlans ? (
                <div className={styles.loadingMessage}>
                  <LoadingSpinner size="medium" text="Loading plans..." />
                </div>
              ) : (
                <div className={styles.plansGrid}>
                  {Array.isArray(plans) && plans.length > 0 ? (
                    plans.map((plan) => (
                      <div
                        key={plan.id}
                        className={`${styles.planCard} ${
                          selectedPlan?.id === plan.id ? styles.selected : ''
                        } ${
                          slotAvailabilityStatus[`${selectedScreen.id}-${selectedDate}-${plan.id}`] === true ? styles.available : 
                          slotAvailabilityStatus[`${selectedScreen.id}-${selectedDate}-${plan.id}`] === false ? styles.unavailable : ''
                        }`}
                        onClick={() => handlePlanSelect(plan)}
                      >
                        <h4>{plan.name}</h4>
                        <div className={styles.planPrice}>₹{(plan.price || 0).toLocaleString('en-IN')}</div>
                        <div className={styles.planDuration}>{plan.duration}</div>
                        <ul className={styles.planFeatures}>
                          {plan.features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    ))
                  ) : (
                    <div className={styles.loadingMessage}>
                      <p>No plans available. Please try again later.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {selectedPlan && (
              <div className={styles.bookingSummary}>
                <h3>Booking Summary</h3>
                <div className={styles.summaryItem}>
                  <span>Screen:</span> <span>{selectedScreen.name}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span>Plan:</span> <span>{selectedPlan.name}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span>Date:</span> <span>{formatDate(selectedDate)}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span>Price:</span> <span>₹{(selectedPlan.price || 0).toLocaleString('en-IN')}</span>
                </div>
                
                <button
                  onClick={handleBooking}
                  className={`${styles.btn} ${styles.btnPrimary}`}
                >
                  Continue to Upload Design
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Unavailable Slot Modal */}
      {showUnavailableModal && (
        <div className={styles.modalOverlay} onClick={() => setShowUnavailableModal(false)}>
          <div className={styles.unavailableModal} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.modalClose}
              onClick={() => setShowUnavailableModal(false)}
            >
              ×
            </button>
            
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
              
              <div className={styles.refundInfo}>
                <p><strong>Note:</strong> If payment was deducted, you'll receive a full refund within 5-7 business days.</p>
              </div>
              
              <div className={styles.actions}>
                <button 
                  onClick={() => navigate('/booking')}
                  className={styles.btnPrimary}
                >
                  Book Another Slot
                </button>
                <button 
                  onClick={() => setShowUnavailableModal(false)}
                  className={styles.btnSecondary}
                >
                  Try Again
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
  );
}
