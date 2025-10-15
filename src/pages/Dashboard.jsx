import React, { useState, useEffect } from 'react';
import { useOrders } from '../hooks/useOrders';
import { isDateDisabled, validateFile, generateOrderId, compressImage, manageStorageQuota } from '../utils/validation';
import { getUserDisplayName, getUserEmail } from '../utils/userUtils';
import { useNavigate } from 'react-router-dom';
import { couponsAPI, dataAPI } from '../config/api';
import { ORDER_STATUS } from '../config/orderStatuses';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import styles from '../styles/Dashboard.module.css';

export default function Dashboard() {
  const { createOrder, hasAvailableInventory, getAvailableInventory, getBookedScreensForDate } = useOrders();
  const navigate = useNavigate();
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
  const [error, setError] = useState('');
  
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
  const [confirmingBooking, setConfirmingBooking] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };
  const user = JSON.parse(localStorage.getItem('user'));
  const displayName = getUserDisplayName(user);
  
  // Dynamic data state - removed mock data
  const [plans, setPlans] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [availabilityData, setAvailabilityData] = useState({});
  
  // User data is available in the 'user' object from AuthContext

  // Transform API plan data to match frontend format
  const transformPlanData = (apiPlans) => {
    return apiPlans.map(plan => ({
      id: plan.id,
      name: plan.name.toUpperCase(), // Convert to uppercase to match mock data
      price: plan.price,
      duration: `${plan.duration_days} day${plan.duration_days > 1 ? 's' : ''}`,
      adSlots: plan.features.slots,
      features: [
        `${plan.features.slots} ad slots (${plan.features.duration_sec} sec/slot)`,
        ...plan.features.features.filter(feature => 
          !feature.toLowerCase().includes('day plan') && 
          !feature.toLowerCase().includes('day display') &&
          !feature.toLowerCase().includes('duration')
        )
      ]
    }));
  };

  // Plans will be fetched in BookingFlow component when needed

  // Fetch location availability for a specific date
  const fetchLocationAvailability = async (date) => {
    if (!date) return;
    
    setLoadingAvailability(true);
    
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API timeout')), 5000)
      );
      
      const apiPromise = dataAPI.getLocationAvailability(date);
      const result = await Promise.race([apiPromise, timeoutPromise]);
      
      
      // Handle the actual API response structure
      let locationsData = null;
      if (result.success && result.data && result.data.data && Array.isArray(result.data.data)) {
        locationsData = result.data.data;
      } else if (result.success && result.data && Array.isArray(result.data)) {
        locationsData = result.data;
      }
      
      if (locationsData) {
        // Transform array to object with screen IDs as keys
        const transformedData = {};
        locationsData.forEach(location => {
          transformedData[location.id] = {
            available: location.available_slots > 0,
            slots: location.available_slots,
            totalSlots: location.total_slots,
            name: location.name,
            description: location.description
          };
        });
        setAvailabilityData(transformedData);
      } else {
        setAvailabilityData({});
      }
    } catch (error) {
      // Don't set any availability data - let the UI handle it with defaults
      setAvailabilityData({});
    } finally {
      setLoadingAvailability(false);
    }
  };

  // Check slot availability for specific location and plan
  const checkSlotAvailability = async (locationId, startDate, planId) => {
    try {
      const result = await dataAPI.checkSlotAvailability(locationId, startDate, planId);
      if (result.success) {
        // Handle the actual API response structure
        const data = result.data?.data || result.data;
        return data || { available: false, slots: 0 };
      } else {
        return { available: false, slots: 0 };
      }
    } catch (error) {
      return { available: false, slots: 0 };
    }
  };

  const handleDateChange = async (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    setSelectedScreen(null);
    setSelectedPlan(null);
    
    // Clear availability data when no date is selected
    if (!newDate) {
      setAvailabilityData({});
      return;
    }
    
    // Fetch availability data for the selected date
    await fetchLocationAvailability(newDate);
  };

  const handleScreenSelect = async (screen) => {
    // Allow selection regardless of inventory - let the API handle availability
    setSelectedScreen(screen);
    setShowScreenModal(true);
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  const handleCouponValidation = async () => {
    if (!couponCode.trim()) {
      setCouponError('');
      setDiscountAmount(0);
      return;
    }

    setValidatingCoupon(true);
    setCouponError('');

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For now, accept a few mock coupon codes
    const validCoupons = {
      'WELCOME10': 100,
      'SAVE20': 200,
      'DISCOUNT50': 500,
      'FIRST50': 50
    };

    const discount = validCoupons[couponCode.toUpperCase()];
    
    if (discount) {
      // Valid coupon - apply discount
      setDiscountAmount(discount);
      setCouponError('');
    } else {
      // Invalid coupon - show warning but allow order to proceed
      setCouponError('Invalid coupon code - order will proceed without discount');
      setDiscountAmount(0);
    }

    setValidatingCoupon(false);
  };

  // Allow booking even with invalid coupon - just ignore the discount
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

    setConfirmingBooking(true);

    // Create new order - always proceed regardless of coupon validation
    // Use discount if coupon was validated successfully, otherwise use 0
    const finalDiscount = couponError ? 0 : discountAmount;
    
    const orderData = {
      planId: selectedPlan.id,
      locationId: selectedScreen.id,
      screenId: selectedScreen.id, // Keep for backward compatibility
      startDate: selectedDate,
      displayDate: selectedDate, // Keep for backward compatibility
      creativeFilePath: designFile.name, // This should be the actual file path from upload
      creativeFileName: designFile.name,
      designFile: designFile.name, // Keep for backward compatibility
      supportingDoc: null,
      totalAmount: selectedPlan.price, // Send base price as totalAmount (without GST)
      baseAmount: selectedPlan.price,
      price: selectedPlan.price, // Send base price, let backend calculate GST and apply discount
      thumbnail: designPreview,
      address: address,
      city: '', // You might want to extract from address or add a city field
      state: '', // You might want to add a state field
      zip: '', // You might want to add a zip field
      deliveryAddress: {
        street: address,
        city: '', // Will be empty for Dashboard orders
        state: '', // Will be empty for Dashboard orders
        zip: '' // Will be empty for Dashboard orders
      },
      gstApplicable: gstApplicable,
      companyName: companyName,
      gstNumber: gstNumber,
      gstInfo: gstNumber, // API expects gstInfo
      couponCode: couponCode,
      screenName: selectedScreen.name,
      location: selectedScreen.location
    };

    try {
      const result = await createOrder(orderData);
      
      if (result.success) {
      // Update order status to show payment pending
      const updatedOrder = {
        ...result.order,
        status: ORDER_STATUS.PENDING_PAYMENT
      };
      setNewOrder(updatedOrder);
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
        
        // Clear localStorage
        localStorage.removeItem('adscreenhub_design');
      } else {
        showToast(result.error || 'Failed to create order. Please try again.', 'error');
      }
    } catch (error) {
      showToast('Failed to create order. Please try again.', 'error');
    } finally {
      setConfirmingBooking(false);
    }
  };

  // Load saved design from localStorage
  useEffect(() => {
    const savedDesign = localStorage.getItem('adscreenhub_design');
    if (savedDesign) {
      setDesignPreview(savedDesign);
    }
  }, []);

  // Don't fetch plans on mount - only fetch when user starts booking
  // Plans will be loaded in BookingFlow when date and location are selected

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Updated allowed types to include more formats
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'video/mp4', 'video/mpeg4', 'video/mpeg', 'image/gif'];
    const maxSize = 15 * 1024 * 1024; // 15MB

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please upload JPG, PNG, MP4, or GIF files only.');
      return;
    }

    // Check file size
    if (file.size > maxSize) {
      setUploadError('File size too large. Please upload files smaller than 15MB.');
      return;
    }

    setUploadError('');
    setDesignFile(file);

    try {
      // Check storage quota before processing
      if (!manageStorageQuota()) {
        setUploadError('Storage space is full. Please clear some data and try again.');
        return;
      }

      // Compress image for storage
      const compressedPreview = await compressImage(file, 800, 0.7);
      setDesignPreview(compressedPreview);
      
      // Save compressed preview to localStorage
      try {
        localStorage.setItem('adscreenhub_design', compressedPreview);
      } catch (error) {
        if (error.name === 'QuotaExceededError') {
          // Clean up and try again
          manageStorageQuota();
          localStorage.setItem('adscreenhub_design', compressedPreview);
        } else {
          throw error;
        }
      }
    } catch (error) {
      setUploadError('Error processing image. Please try again.');
    }
  };

  const handleBooking = () => {
    if (!selectedDate || !selectedScreen || !selectedPlan) {
      showToast('Please select date, screen, and plan', 'error');
      return;
    }
    
    // Show warning modal first before upload
    setShowWarningModal(true);
  };

  const handleAcceptWarning = () => {
    setShowWarningModal(false);
    setShowUploadModal(true);
  };



  const handleCancel = () => {
    setShowUploadModal(false);
    setShowScreenModal(false);
    // Clear design data when canceling
    setDesignFile(null);
    setDesignPreview(null);
    localStorage.removeItem('adscreenhub_design');
  };

  // Get minimum date (today + 2 days) - Fixed timezone issue
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

  // Dashboard statistics functions
  const getTotalOrders = () => {
    const orders = JSON.parse(localStorage.getItem('adscreenhub_orders') || '[]');
    return orders.length;
  };

  const getTotalSpent = () => {
    const orders = JSON.parse(localStorage.getItem('adscreenhub_orders') || '[]');
    const total = orders
      .filter(order => !['Cancelled - Forfeited', 'Cancelled - Refunded'].includes(order.status))
      .reduce((sum, order) => sum + (order.amount || order.price || 0), 0);
    return (total || 0).toLocaleString('en-IN');
  };

  const getActiveOrders = () => {
    const orders = JSON.parse(localStorage.getItem('adscreenhub_orders') || '[]');
    return orders.filter(order => 
      order.status === ORDER_STATUS.IN_DISPLAY || order.status === ORDER_STATUS.PENDING_APPROVAL
    ).length;
  };

  const getCompletedOrders = () => {
    const orders = JSON.parse(localStorage.getItem('adscreenhub_orders') || '[]');
    return orders.filter(order => order.status === ORDER_STATUS.COMPLETED).length;
  };

  const getRecentOrders = () => {
    const orders = JSON.parse(localStorage.getItem('adscreenhub_orders') || '[]');
    return orders
      .sort((a, b) => new Date(b.displayDate) - new Date(a.displayDate))
      .slice(0, 3); // Show only 3 most recent orders
  };

  const getStatusClass = (status) => {
    switch (status) {
      case ORDER_STATUS.PENDING_PAYMENT:
        return styles.statusPending;
      case ORDER_STATUS.PAYMENT_FAILED:
        return styles.statusPaymentFailed;
      case ORDER_STATUS.PENDING_APPROVAL:
        return styles.statusPending;
      case ORDER_STATUS.DESIGN_REVISE:
        return styles.statusRevision;
      case ORDER_STATUS.PENDING_DISPLAY_APPROVED:
        return styles.statusPendingDisplayApproval;
      case ORDER_STATUS.IN_DISPLAY:
        return styles.statusActive;
      case ORDER_STATUS.COMPLETED:
        return styles.statusCompleted;
      case ORDER_STATUS.CANCELLED_FORFEITED:
        return styles.statusCancelledForfeited;
      case ORDER_STATUS.CANCELLED_REFUNDED:
        return styles.statusRefund;
      default:
        return styles.statusPending;
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div>
              <h1>Hi, {displayName}!</h1>
              <p>Book your LED screen advertising campaign</p>
            </div>
            <button 
              onClick={() => navigate('/booking')}
              className={styles.bookNewButton}
            >
              Book New Ad Slot
            </button>
          </div>
        </div>

        {error && (
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
        )}

        {/* Dashboard Overview */}
        <div className={styles.dashboardOverview}>
          <div className={styles.overviewGrid}>
            <div className={styles.overviewCard}>
              <div className={styles.overviewIcon}>Orders</div>
              <div className={styles.overviewContent}>
                <h3>Total Orders</h3>
                <p className={styles.overviewNumber}>{getTotalOrders()}</p>
                <span className={styles.overviewLabel}>Campaigns placed</span>
              </div>
            </div>
            
            <div className={styles.overviewCard}>
              <div className={styles.overviewIcon}>₹</div>
              <div className={styles.overviewContent}>
                <h3>Total Spent</h3>
                <p className={styles.overviewNumber}>₹{getTotalSpent()}</p>
                <span className={styles.overviewLabel}>All time spending</span>
              </div>
            </div>
            
            <div className={styles.overviewCard}>
              <div className={styles.overviewIcon}>▶️</div>
              <div className={styles.overviewContent}>
                <h3>Active Campaigns</h3>
                <p className={styles.overviewNumber}>{getActiveOrders()}</p>
                <span className={styles.overviewLabel}>Currently running</span>
              </div>
            </div>
            
            <div className={styles.overviewCard}>
              <div className={styles.overviewIcon}>✓</div>
              <div className={styles.overviewContent}>
                <h3>Completed</h3>
                <p className={styles.overviewNumber}>{getCompletedOrders()}</p>
                <span className={styles.overviewLabel}>Successfully finished</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className={styles.recentOrders}>
          <div className={styles.sectionHeader}>
            <h2>Recent Orders</h2>
            <button 
              className={styles.viewAllBtn}
              onClick={() => navigate('/my-orders')}
            >
              View All Orders
            </button>
          </div>
          
          <div className={styles.ordersList}>
            {getRecentOrders().length > 0 ? (
              getRecentOrders().map((order) => (
                <div key={order.id} className={styles.orderCard}>
                  <div className={styles.orderInfo}>
                    <h4>{order.screenName}</h4>
                    <p className={styles.orderLocation}>{order.location}</p>
                    <p className={styles.orderDate}>{formatDate(order.displayDate)}</p>
                  </div>
                  <div className={styles.orderStatus}>
                    <span className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                    <p className={styles.orderAmount}>₹{(order.final_amount || order.total_cost || order.totalAmount || order.amount || 0).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noOrders}>
                <p>No orders yet. Start your first campaign!</p>
                <button 
                  className={styles.startCampaignBtn}
                  onClick={() => navigate('/booking')}
                >
                  Book Your First Ad
                </button>
              </div>
            )}
          </div>
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
                    <p>Loading plans...</p>
                  </div>
                ) : (
                  <div className={styles.plansGrid}>
                    {Array.isArray(plans) && plans.length > 0 ? (
                      plans.map((plan) => (
                        <div
                          key={plan.id}
                          className={`${styles.planCard} ${
                            selectedPlan?.id === plan.id ? styles.selected : ''
                          }`}
                          onClick={() => handlePlanSelect(plan)}
                        >
                          <h4>{plan.name}</h4>
                          <div className={styles.planPrice}>Plan Available</div>
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
                    <span>Plan:</span> <span>{selectedPlan.name}</span>
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

        {/* Warning Modal - Now shows before upload */}
        {showWarningModal && (
          <div className={`${styles.modalOverlay} ${styles.warningModal}`} onClick={() => setShowWarningModal(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <button
                className={styles.modalClose}
                onClick={() => setShowWarningModal(false)}
              >
                ×
              </button>
              
              <div className={styles.warningHeader}>
                <h2>IMPORTANT NOTICE</h2>
                <p>Please read the following terms before proceeding with your order:</p>
              </div>

              <div className={styles.importantNoticeSection}>
                <div className={styles.noticeContainer}>
                  <div className={styles.noticeContent}>
                    <p className={styles.noticeIntro}>
                      Please ensure your advertisement creative strictly adheres to the design and content guidelines before uploading.
                    </p>
                    
                    <div className={styles.noticeSection}>
                      <h4>Content & Legal Compliance</h4>
                      <ul>
                        <li>Your creative must comply with all applicable laws in force in India, the Advertising Standards Council of India (ASCI) Code, and local municipal (BBMP) bye-laws.</li>
                        <li>Prohibited content includes:
                          <ul>
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

                    <div className={styles.noticeSection}>
                      <h4>Technical Specifications</h4>
                      <ul>
                        <li>Creatives must strictly match the size, dimensions, aspect ratio, and resolution required for the chosen display location.</li>
                        <li>Poor quality or non-compliant creatives will be rejected.</li>
                      </ul>
                    </div>

                    <div className={styles.noticeSection}>
                      <h4>Approval & Timelines</h4>
                      <ul>
                        <li>All ads require AdScreenHub.com's approval before going live.</li>
                        <li>If your creative is rejected, you must alter the creative to follow guidelines and resubmit at least 12 hours prior to the scheduled display start date.</li>
                        <li>Failure to resubmit on time will result in forfeiture of the ad slot without refund, credit, or compensation.</li>
                        <li>Any creative that remains incorrect or non-compliant upon resubmission will be rejected, and AdScreenHub.com shall bear no liability or entitlement to any refund, credit, or compensation.</li>
                      </ul>
                    </div>

                    <div className={styles.noticeSection}>
                      <h4>Intellectual Property</h4>
                      <ul>
                        <li>You must own or have legal permission to use all images, text, logos, music, and other elements in your creative.</li>
                        <li>Do not submit material that infringes trademarks, copyrights, or other intellectual property rights of any third party.</li>
                        <li>AdScreenHub.com reserves the right to remove any infringing content without notice and is not responsible for any claims arising from your infringement.</li>
                      </ul>
                    </div>

                    <div className={styles.noticeSection}>
                      <h4>Advertiser Liability</h4>
                      <ul>
                        <li>You are solely responsible for ensuring your creative is accurate, lawful, and compliant.</li>
                        <li>Any breach of the Terms & Conditions, specifications, guidelines or laws may result in rejection, account termination, and/or legal action.</li>
                        <li>AdScreenHub.com is not liable for any losses, delays, or damages resulting from your submission of non-compliant creatives.</li>
                      </ul>
                    </div>

                    <p className={styles.noticeConclusion}>
                      By proceeding with your upload, you agree to have read the detailed Terms & Conditions and confirm that your creative meets these requirements in full.
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.warningActions}>
                <button
                  onClick={() => setShowWarningModal(false)}
                  className={`${styles.btn} ${styles.btnSecondary}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAcceptWarning}
                  className={`${styles.btn} ${styles.btnPrimary}`}
                >
                  I Accept & Proceed
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Design Upload Modal */}
        {showUploadModal && (
          <div className={styles.modalOverlay} onClick={() => setShowUploadModal(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <button
                className={styles.modalClose}
                onClick={() => setShowUploadModal(false)}
              >
                ×
              </button>
              
              <div className={styles.modalHeader}>
                <h2>Upload Your Design</h2>
                <p>Please upload your advertisement design (JPG, PNG, MP4, MPEG4, MPEG, GIF formats only, max 15MB)</p>
              </div>

              <div className={styles.uploadSection}>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.mp4,.mpeg4,.mpeg,.gif"
                  onChange={handleFileUpload}
                  className={styles.fileInput}
                  id="design-upload"
                />
                <label htmlFor="design-upload" className={styles.fileInputLabel}>
                  <div className={styles.uploadArea}>
                    <svg className={styles.uploadIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p>Click to upload or drag and drop</p>
                    <p className={styles.fileTypes}>JPG, PNG, MP4, MPEG4, MPEG, GIF (max 15MB)</p>
                  </div>
                </label>

                {uploadError && (
                  <div className={styles.errorMessage}>
                    {uploadError}
                  </div>
                )}

                {designPreview && (
                  <div className={styles.previewSection}>
                    <h3>Design Preview</h3>
                    <div className={styles.previewContainer}>
                      <img src={designPreview} alt="Design Preview" className={styles.previewImage} />
                    </div>
                    <p className={styles.fileInfo}>
                      File: {designFile?.name} ({(designFile?.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Address Section */}
              <div className={styles.addressSection}>
                <h3>Delivery Address</h3>
                <div className={styles.formGroup}>
                  <label htmlFor="address" className={styles.formLabel}>
                    Address <span style={{ color: 'red' }}>*</span>
                  </label>
                  <textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={styles.formInput}
                    placeholder="Enter your complete address"
                    rows="3"
                    required
                  />
                </div>
              </div>

              {/* GST Section */}
              <div className={styles.gstSection}>
                <h3>GST Information</h3>
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={gstApplicable}
                      onChange={(e) => setGstApplicable(e.target.checked)}
                      className={styles.checkbox}
                    />
                    <span>GST is applicable</span>
                  </label>
                </div>
                
                {gstApplicable && (
                  <>
                    <div className={styles.formGroup}>
                      <label htmlFor="companyName" className={styles.formLabel}>
                        Company Name <span style={{ color: 'red' }}>*</span>
                      </label>
                      <input
                        type="text"
                        id="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className={styles.formInput}
                        placeholder="Enter company name"
                        required
                      />
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="gstNumber" className={styles.formLabel}>
                        GST Number <span style={{ color: 'red' }}>*</span>
                      </label>
                      <input
                        type="text"
                        id="gstNumber"
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value)}
                        className={styles.formInput}
                        placeholder="Enter GST number"
                        required
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Coupon Section */}
              <div className={styles.couponSection}>
                <h3>Discount Code</h3>
                <div className={styles.formGroup}>
                  <label htmlFor="couponCode" className={styles.formLabel}>
                    Coupon Code
                  </label>
                  <div className={styles.couponInputGroup}>
                    <input
                      type="text"
                      id="couponCode"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value);
                        setCouponError(''); // Clear error when typing
                      }}
                      className={styles.formInput}
                      placeholder="Enter coupon code (optional)"
                    />
                    <button
                      type="button"
                      onClick={handleCouponValidation}
                      disabled={!couponCode.trim() || validatingCoupon}
                      className={styles.validateButton}
                    >
                      {validatingCoupon ? 'Validating...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && (
                    <div className={styles.errorMessage}>
                      {couponError}
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div className={styles.successMessage}>
                      Discount applied: ₹{discountAmount}
                    </div>
                  )}
                </div>
              </div>

              {/* Terms Section */}
              <div className={styles.termsSection}>
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className={styles.checkbox}
                      required
                    />
                    <span>
                      I accept the{' '}
                      <a 
                        href="/terms" 
                        target="_blank" 
                        className={styles.link}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate('/terms', { state: { referrer: '/dashboard' } });
                        }}
                      >
                        Terms & Conditions
                      </a>
                      <span style={{ color: 'red' }}> *</span>
                    </span>
                  </label>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  onClick={handleCancel}
                  className={`${styles.btn} ${styles.btnSecondary}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBooking}
                  disabled={!designFile || !address.trim() || (gstApplicable && (!companyName.trim() || !gstNumber.trim())) || !termsAccepted || confirmingBooking}
                  className={`${styles.btn} ${styles.btnPrimary} ${confirmingBooking ? styles.loading : ''}`}
                >
                  {confirmingBooking ? (
                    <>
                      <LoadingSpinner size="small" text="" className="inlineSpinner" />
                      Confirming...
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Booking Confirmation Modal */}
        {showConfirmation && newOrder && (
          <div className={styles.modalOverlay} onClick={() => setShowConfirmation(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <button
                className={styles.modalClose}
                onClick={() => setShowConfirmation(false)}
              >
                ×
              </button>
              
              <div className={styles.confirmationHeader}>
                <div className={styles.successIcon}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2>Order Created!</h2>
                <p>Your advertisement order has been created. Please proceed to payment to complete your booking.</p>
              </div>

              <div className={styles.orderDetails}>
                <h3>Order Details</h3>
                <div className={styles.orderInfo}>
                  <div className={styles.orderItem}>
                    <span>Order ID:</span>
                    <span className={styles.orderId}>{newOrder.id}</span>
                  </div>
                  <div className={styles.orderItem}>
                    <span>Screen:</span>
                    <span>{mockScreens.find(s => s.id === newOrder.screenId)?.name}</span>
                  </div>
                  <div className={styles.orderItem}>
                    <span>Plan:</span>
                    <span>{plans.find(p => p.id === newOrder.planId)?.name}</span>
                  </div>
                  <div className={styles.orderItem}>
                    <span>Display Date:</span>
                    <span>{formatDate(newOrder.displayDate)}</span>
                  </div>
                  <div className={styles.orderItem}>
                    <span>Base Price:</span>
                    <span className={styles.orderAmount}>₹{(newOrder.baseAmount || newOrder.total_cost || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className={styles.orderItem}>
                    <span>GST (18%):</span>
                    <span className={styles.orderAmount}>₹{(newOrder.gstAmount || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className={styles.orderItem}>
                    <span>Total Amount:</span>
                    <span className={styles.orderAmount}>₹{(newOrder.final_amount || newOrder.totalAmount || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className={styles.orderItem}>
                    <span>Status:</span>
                    <span className={styles.statusPending}>{newOrder.status}</span>
                  </div>
                </div>

                {newOrder.thumbnail && (
                  <div className={styles.designPreview}>
                    <h4>Your Design</h4>
                    <div className={styles.previewContainer}>
                      <img src={newOrder.thumbnail} alt="Design Preview" className={styles.previewImage} />
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.confirmationActions}>
                <button
                  onClick={() => {
                    setShowConfirmation(false);
                    navigate('/my-orders');
                  }}
                  className={`${styles.btn} ${styles.btnPrimary}`}
                >
                  View My Orders
                </button>
                <button
                  onClick={() => {
                    setShowConfirmation(false);
                    // Reset everything for new booking
                    setNewOrder(null);
                  }}
                  className={`${styles.btn} ${styles.btnSecondary}`}
                >
                  Book Another Ad
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Storage Manager Modal - Removed for simplicity */}

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
