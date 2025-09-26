import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dataAPI, filesAPI, ordersAPI } from '../config/api';
import { useNavigate } from 'react-router-dom';
import { isTokenValid, clearAuthData } from '../utils/tokenUtils';
import styles from '../styles/BookingFlow.module.css';

const BookingFlow = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Step management
  const [currentStep, setCurrentStep] = useState('date-selection');
  
  // Data states
  const [selectedDate, setSelectedDate] = useState('');
  const [locations, setLocations] = useState([]);
  const [plans, setPlans] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isAvailable, setIsAvailable] = useState(null);
  
  // File upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);

  // Debug: Log uploadedFile state changes
  useEffect(() => {
    if (import.meta.env.DEV) {
    }
  }, [uploadedFile]);
  
  // Order states
  const [orderData, setOrderData] = useState({
    deliveryAddress: {
      street: '',
      city: '',
      state: '',
      zip: ''
    },
    gstInfo: ''
  });

  // Payment states
  const [paymentData, setPaymentData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'pending', 'success', 'failed'
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check authentication on component mount
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!isTokenValid()) {
      clearAuthData();
      navigate('/login');
      return;
    }

  }, [user, navigate]);

  // Step 1: Date Selection
  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    setLoading(true);
    setError('');
    
    try {
      const response = await dataAPI.getLocationAvailability(date);
      
      if (response.success) {
        // Handle nested data structure: response.data.data
        const locationsData = response.data.data || response.data;
        setLocations(locationsData);
        setCurrentStep('location-selection');
      } else {
        setError(response.error || 'Failed to fetch locations');
      }
    } catch (err) {
      console.error('❌ Location API Error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Location Selection
  const handleLocationSelect = async (location) => {
    setSelectedLocation(location);
    setLoading(true);
    setError('');
    
    try {
      const response = await dataAPI.getPlansByLocation(location.id);
      if (import.meta.env.DEV) {
      }
      
      if (response.success) {
        const plansData = response.data.data || response.data;
        setPlans(plansData);
        setCurrentStep('plan-selection');
      } else {
        setError(response.error || 'Failed to fetch plans');
      }
    } catch (err) {
      console.error('❌ Plans API Error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Plan Selection
  const handlePlanSelect = async (plan) => {
    setSelectedPlan(plan);
    setLoading(true);
    setError('');
    
    try {
      const response = await dataAPI.checkAvailability(selectedLocation.id, plan.id, selectedDate);
      if (import.meta.env.DEV) {
      }
      
      if (response.success) {
        const availabilityData = response.data.data || response.data;
        // Handle both 'available' and 'isAvailable' field names
        const isAvailable = availabilityData.available || availabilityData.isAvailable;
        setIsAvailable(isAvailable);
        if (isAvailable) {
          setCurrentStep('file-upload');
        } else {
          setError('This slot is no longer available. Please select another plan.');
        }
      } else {
        setError(response.error || 'Failed to check availability');
      }
    } catch (err) {
      console.error('❌ Availability API Error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 4: File Upload
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError('');
    setUploadProgress(0);

    try {
      // Try to get signed URL from API
      const signedUrlResponse = await filesAPI.getSignedUploadUrl(
        selectedFile.name,
        selectedFile.type
      );

      console.log('📁 Signed URL Response:', signedUrlResponse);

      if (signedUrlResponse.success) {
        // Handle nested data structure: response.data.data
        const uploadData = signedUrlResponse.data.data || signedUrlResponse.data;
        console.log('📁 Upload Data:', uploadData);
        console.log('📁 Upload Data keys:', Object.keys(uploadData));
        
        const { signedUrl, path: filePath, fileName } = uploadData;
        
        // Use selectedFile.name as fileName if not provided by API
        const finalFileName = fileName || selectedFile.name;

        // Upload file to S3
        const uploadResponse = await fetch(signedUrl, {
          method: 'PUT',
          body: selectedFile,
          headers: {
            'Content-Type': selectedFile.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error('File upload failed');
        }

        setUploadedFile({ filePath, fileName: finalFileName });
        setUploadProgress(100);
        
        if (import.meta.env.DEV) {
        }
        
        setCurrentStep('order-details');
      } else {
        throw new Error(signedUrlResponse.error);
      }
    } catch (err) {
      console.error('❌ File Upload Error:', err);
      // Show specific error messages based on the error type
      if (err.message.includes('Could not create signed upload URL')) {
        setError('File upload service is temporarily unavailable. Please try again later.');
      } else if (err.message.includes('500')) {
        setError('Server error occurred during file upload. Please try again.');
      } else if (err.message.includes('401')) {
        setError('Authentication required for file upload. Please log in again.');
      } else if (err.message.includes('404')) {
        setError('File upload endpoint not found. Please contact support.');
      } else {
        setError(err.message || 'Upload failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 5: Order Details & Payment
  const handleOrderDetailsChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setOrderData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setOrderData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const initiatePayment = async () => {
    if (import.meta.env.DEV) {
    }

    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!uploadedFile || !uploadedFile.filePath) {
        throw new Error('Creative file is required. Please upload your creative first.');
      }

      const orderPayload = {
        planId: selectedPlan.id.toString(),
        locationId: selectedLocation.id.toString(),
        startDate: selectedDate,
        price: selectedPlan.price || 0, // Add required price field
        creativeFilePath: uploadedFile.filePath,
        creativeFileName: uploadedFile.fileName,
        deliveryAddress: orderData.deliveryAddress,
        gstInfo: orderData.gstInfo
      };

      if (import.meta.env.DEV) {
        console.log('💳 Order Payload:', orderPayload);
      }

      const response = await ordersAPI.initiateOrder(orderPayload);
      
      if (response.success) {
        // Handle nested data structure: response.data.data
        const orderData = response.data.data || response.data;
        if (import.meta.env.DEV) {
          console.log('💳 Order Data:', orderData);
        }
        
        const { razorpayOrder, order } = orderData;
        
        // Store payment data and go to payment step
        setPaymentData({ razorpayOrder, order });
        setCurrentStep('payment');
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      console.error('❌ Order Initiation Error:', err);
      setError(err.message || 'Order initiation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async () => {
    if (!paymentData) return;
    
    setLoading(true);
    setError('');
    
    try {
      await initializeRazorpayPayment(paymentData.razorpayOrder, paymentData.order);
    } catch (err) {
      console.error('❌ Razorpay Payment Error:', err);
      setError(err.message || 'Payment initialization failed');
      setLoading(false);
    }
  };

  const handleMockPayment = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful payment
      setPaymentStatus('success');
      setLoading(false);
    } catch (err) {
      console.error('❌ Mock Payment Error:', err);
      setPaymentStatus('failed');
      setLoading(false);
    }
  };

  const initializeRazorpayPayment = async (razorpayOrder, order) => {
    try {
      // Initialize Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_1234567890', // Fallback for demo
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "AdScreenHub",
        description: "Ad Slot Booking",
        image: "/logo.png",
        order_id: razorpayOrder.id,
        
        handler: async function (response) {
          setLoading(true);
          
          const verificationData = {
            orderId: order.id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          };

          try {
            const verifyResponse = await ordersAPI.verifyPayment(verificationData);
            
            if (verifyResponse.success) {
              setPaymentStatus('success');
            } else {
              setPaymentStatus('failed');
              throw new Error(verifyResponse.error);
            }
          } catch (error) {
            console.error('❌ Payment Verification Error:', error);
            const status = error.response?.status;
            const message = error.response?.data?.message || error.message;
            
            if (status === 409) {
              navigate(`/booking-failed?message=${encodeURIComponent(message)}`);
            } else {
              setError(`Payment verification failed: ${message}`);
            }
          } finally {
            setLoading(false);
          }
        },
        
        prefill: {
          name: user.fullName,
          email: user.email,
          contact: user.phoneNumber,
        },
        
        notes: {
          address: "AdScreenHub Booking",
        },
        
        theme: {
          color: "#3399cc",
        },
      };

      const paymentObject = new window.Razorpay(options);
      
      paymentObject.on('payment.failed', function (response) {
        setError(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });

      paymentObject.open();
      
    } catch (err) {
      setError(err.message || 'Payment initiation failed');
    }
  };

  const goBack = () => {
    switch (currentStep) {
      case 'location-selection':
        setCurrentStep('date-selection');
        break;
      case 'plan-selection':
        setCurrentStep('location-selection');
        break;
      case 'file-upload':
        setCurrentStep('plan-selection');
        break;
      case 'order-details':
        setCurrentStep('file-upload');
        break;
      default:
        break;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'date-selection':
        return (
          <div className={styles.stepContainer}>
            <h2>Select Date</h2>
            <div className={styles.datePicker}>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={styles.dateInput}
              />
              <button
                onClick={() => handleDateSelect(selectedDate)}
                disabled={!selectedDate || loading}
                className={styles.primaryButton}
              >
                {loading ? 'Loading...' : 'Check Availability'}
              </button>
            </div>
          </div>
        );

      case 'location-selection':
        return (
          <div className={styles.stepContainer}>
            <h2>Select Location</h2>
            <div className={styles.locationGrid}>
              {Array.isArray(locations) && locations.length > 0 ? (
                locations.map((location) => (
                  <div
                    key={location.id}
                    className={styles.locationCard}
                    onClick={() => handleLocationSelect(location)}
                  >
                    <h3>{location.name}</h3>
                    <p>{location.address}</p>
                    <span className={styles.price}>₹{location.basePrice}</span>
                  </div>
                ))
              ) : (
                <div className={styles.noData}>
                  <p>No locations available for the selected date.</p>
                </div>
              )}
            </div>
            <button onClick={goBack} className={styles.secondaryButton}>
              Back
            </button>
          </div>
        );

      case 'plan-selection':
        return (
          <div className={styles.stepContainer}>
            <h2>Select Plan</h2>
            <p className={styles.stepDescription}>
              Choose a plan for your advertisement at <strong>{selectedLocation?.name}</strong>
            </p>
            <div className={styles.planGrid}>
              {Array.isArray(plans) && plans.length > 0 ? (
                plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={styles.planCard}
                    onClick={() => handlePlanSelect(plan)}
                  >
                    <h3>{plan.name}</h3>
                    <p>{plan.description}</p>
                    <span className={styles.price}>₹{plan.price}</span>
                    <span className={styles.duration}>{plan.duration} days</span>
                  </div>
                ))
              ) : (
                <div className={styles.noData}>
                  <p>No plans available for the selected location.</p>
                </div>
              )}
            </div>
            <button onClick={goBack} className={styles.secondaryButton}>
              Back
            </button>
          </div>
        );

      case 'file-upload':
        return (
          <div className={styles.stepContainer}>
            <h2>Upload Your Creative</h2>
            <div className={styles.uploadArea}>
              <input
                type="file"
                id="file-upload"
                onChange={handleFileSelect}
                accept="image/*,video/*"
                className={styles.fileInput}
              />
              <label htmlFor="file-upload" className={styles.uploadLabel}>
                {selectedFile ? selectedFile.name : 'Choose File'}
              </label>
              {selectedFile && (
                <button
                  onClick={uploadFile}
                  disabled={loading}
                  className={styles.primaryButton}
                >
                  {loading ? `Uploading... ${uploadProgress}%` : 'Upload File'}
                </button>
              )}
              
              {uploadedFile && (
                <div className={styles.uploadSuccess}>
                  <p>✅ File uploaded successfully: {uploadedFile.fileName}</p>
                  <p>📁 File Path: {uploadedFile.filePath}</p>
                  <button
                    onClick={() => setCurrentStep('order-details')}
                    className={styles.primaryButton}
                  >
                    Continue to Order Details
                  </button>
                </div>
              )}
              
              {import.meta.env.DEV && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0f0f0', borderRadius: '5px' }}>
                  <p><strong>Debug Info:</strong></p>
                  <p>uploadedFile: {JSON.stringify(uploadedFile)}</p>
                  <p>selectedFile: {selectedFile?.name}</p>
                  <p>loading: {loading.toString()}</p>
                </div>
              )}
            </div>
            <button onClick={goBack} className={styles.secondaryButton}>
              Back
            </button>
          </div>
        );

      case 'order-details':
        
        return (
          <div className={styles.stepContainer}>
            <h2>Order Details</h2>
            <div className={styles.orderForm}>
              <div className={styles.formGroup}>
                <label>Delivery Address</label>
                <input
                  type="text"
                  placeholder="Street Address"
                  value={orderData.deliveryAddress.street}
                  onChange={(e) => handleOrderDetailsChange('deliveryAddress.street', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="City"
                  value={orderData.deliveryAddress.city}
                  onChange={(e) => handleOrderDetailsChange('deliveryAddress.city', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="State"
                  value={orderData.deliveryAddress.state}
                  onChange={(e) => handleOrderDetailsChange('deliveryAddress.state', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="ZIP Code"
                  value={orderData.deliveryAddress.zip}
                  onChange={(e) => handleOrderDetailsChange('deliveryAddress.zip', e.target.value)}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>GST Information (Optional)</label>
                <input
                  type="text"
                  placeholder="GST Number"
                  value={orderData.gstInfo}
                  onChange={(e) => handleOrderDetailsChange('gstInfo', e.target.value)}
                />
              </div>
              
              <div className={styles.orderSummary}>
                <h3>Order Summary</h3>
                <p><strong>Location:</strong> {selectedLocation?.name}</p>
                <p><strong>Plan:</strong> {selectedPlan?.name}</p>
                <p><strong>Date:</strong> {selectedDate}</p>
                <p><strong>Duration:</strong> {selectedPlan?.duration} days</p>
                <p><strong>Total:</strong> ₹{selectedPlan?.price}</p>
              </div>
              
              {!uploadedFile && (
                <div className={styles.warningMessage}>
                  <p>⚠️ Please upload your creative file first before proceeding to payment.</p>
                  <button
                    onClick={() => setCurrentStep('file-upload')}
                    className={styles.secondaryButton}
                  >
                    Go to File Upload
                  </button>
                </div>
              )}
              
              <button
                onClick={initiatePayment}
                disabled={loading || !uploadedFile}
                className={styles.primaryButton}
              >
                {loading ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </div>
            <button onClick={goBack} className={styles.secondaryButton}>
              Back
            </button>
          </div>
        );

      case 'payment':
        return (
          <div className={styles.stepContainer}>
            <h2>Payment</h2>
            
            {paymentData && (
              <div className={styles.paymentContainer}>
                <div className={styles.orderSummary}>
                  <h3>Order Summary</h3>
                  <div className={styles.summaryItem}>
                    <span>Location:</span>
                    <span>{selectedLocation?.name}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Plan:</span>
                    <span>{selectedPlan?.name}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Date:</span>
                    <span>{selectedDate}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Duration:</span>
                    <span>{selectedPlan?.duration} days</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Creative:</span>
                    <span>{uploadedFile?.fileName}</span>
                  </div>
                  <div className={styles.summaryItemTotal}>
                    <span>Total Amount:</span>
                    <span>₹{paymentData.razorpayOrder.amount / 100}</span>
                  </div>
                </div>

                {paymentStatus === 'success' ? (
                  <div className={styles.paymentSuccess}>
                    <div className={styles.successIcon}>✅</div>
                    <h3>Payment Successful!</h3>
                    <p>Your ad slot has been booked successfully.</p>
                    <p>Order ID: {paymentData.order.id}</p>
                    <button
                      onClick={() => window.location.href = '/dashboard'}
                      className={styles.primaryButton}
                    >
                      Go to Dashboard
                    </button>
                  </div>
                ) : paymentStatus === 'failed' ? (
                  <div className={styles.paymentFailed}>
                    <div className={styles.failedIcon}>❌</div>
                    <h3>Payment Failed</h3>
                    <p>There was an issue processing your payment. Please try again.</p>
                    <button
                      onClick={() => setPaymentStatus(null)}
                      className={styles.primaryButton}
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div className={styles.paymentOptions}>
                    <h3>Choose Payment Method</h3>
                    <div className={styles.paymentMethods}>
                      <button
                        onClick={() => handleRazorpayPayment()}
                        disabled={loading}
                        className={styles.paymentButton}
                      >
                        <div className={styles.paymentMethod}>
                          <div className={styles.paymentIcon}>💳</div>
                          <div className={styles.paymentInfo}>
                            <h4>Razorpay</h4>
                            <p>Pay with UPI, Cards, Net Banking</p>
                          </div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => handleMockPayment()}
                        disabled={loading}
                        className={styles.paymentButton}
                      >
                        <div className={styles.paymentMethod}>
                          <div className={styles.paymentIcon}>🧪</div>
                          <div className={styles.paymentInfo}>
                            <h4>Mock Payment</h4>
                            <p>For testing purposes</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <button onClick={goBack} className={styles.secondaryButton}>
              Back
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.bookingFlow}>
      <div className={styles.header}>
        <h1>Book Your Ad Slot</h1>
        <div className={styles.progressBar}>
          <div className={`${styles.progressStep} ${currentStep === 'date-selection' ? styles.active : ''}`}>
            <span>1</span>
            <label>Date</label>
          </div>
          <div className={`${styles.progressStep} ${currentStep === 'location-selection' ? styles.active : ''}`}>
            <span>2</span>
            <label>Location</label>
          </div>
          <div className={`${styles.progressStep} ${currentStep === 'plan-selection' ? styles.active : ''}`}>
            <span>3</span>
            <label>Plan</label>
          </div>
          <div className={`${styles.progressStep} ${currentStep === 'file-upload' ? styles.active : ''}`}>
            <span>4</span>
            <label>Upload</label>
          </div>
          <div className={`${styles.progressStep} ${currentStep === 'order-details' ? styles.active : ''}`}>
            <span>5</span>
            <label>Details</label>
          </div>
          <div className={`${styles.progressStep} ${currentStep === 'payment' ? styles.active : ''}`}>
            <span>6</span>
            <label>Payment</label>
          </div>
        </div>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}


      {renderStep()}
    </div>
  );
};

export default BookingFlow;
