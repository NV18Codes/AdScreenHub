import React, { useState } from 'react';
import { useOrders } from '../hooks/useOrders';
import { formatDate, formatCurrency, validateFile, compressImage, manageStorageQuota } from '../utils/validation';
import { Link, useNavigate } from 'react-router-dom';
import { RAZORPAY_KEY, RAZORPAY_CONFIG, convertToPaise } from '../config/razorpay';
import styles from '../styles/MyOrders.module.css';

export default function MyOrders() {
  const { orders, loading, cancelOrder, reviseOrder, refreshOrders } = useOrders();
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showReviseModal, setShowReviseModal] = useState(false);
  const [reviseOrderId, setReviseOrderId] = useState(null);
  const [newDesignFile, setNewDesignFile] = useState(null);
  const [newDesignPreview, setNewDesignPreview] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [refreshError, setRefreshError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Handle refresh orders
  const handleRefreshOrders = async () => {
    setRefreshing(true);
    setRefreshError('');
    try {
      const result = await refreshOrders();
      if (!result.success) {
        setRefreshError(result.error || 'Failed to refresh orders');
      }
    } catch (error) {
      setRefreshError('Failed to refresh orders');
    } finally {
      setRefreshing(false);
    }
  };

  // Check if order can be revised (only if status is "Revise Your Design" and not within 12 hours of start date)
  const canReviseOrder = (order) => {
    if (order.status !== 'Revise Your Design') {
      return false;
    }

    // Check if less than 12 hours left before start date (IST)
    const now = new Date();
    const startDate = new Date(order.displayDate);
    const timeDiff = startDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    // If less than 12 hours left, cannot revise
    return hoursDiff >= 12;
  };

  // Check if order can be revised (only if status is "Revise Your Design")
  const canRevisePendingOrder = (order) => {
    return order.status === 'Revise Your Design';
  };

  const handleCancelOrder = (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      cancelOrder(orderId);
    }
  };

  const handleReviseOrder = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    
    if (!canReviseOrder(order)) {
      alert('This order cannot be revised. Please check the status and timing requirements.');
      return;
    }

    setReviseOrderId(orderId);
    setShowReviseModal(true);
    setNewDesignFile(null);
    setNewDesignPreview(null);
    setUploadError('');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 15 * 1024 * 1024; // 15MB

    const validation = validateFile(file, allowedTypes, maxSize);
    
    if (!validation.isValid) {
      setUploadError(validation.errors.type || validation.errors.size);
      return;
    }

    setUploadError('');
    setNewDesignFile(file);

    try {
      // Check storage quota before processing
      if (!manageStorageQuota()) {
        setUploadError('Storage space is full. Please clear some data and try again.');
        return;
      }

      // Compress image for storage
      const compressedPreview = await compressImage(file, 800, 0.7);
      setNewDesignPreview(compressedPreview);
    } catch (error) {
      console.error('Error processing image:', error);
      setUploadError('Error processing image. Please try again.');
    }
  };

  const handleSubmitRevision = () => {
    if (!newDesignFile) {
      setUploadError('Please upload a new design file');
      return;
    }

    // Update the order with new design
    reviseOrder(reviseOrderId, {
      designFile: newDesignFile.name,
      thumbnail: newDesignPreview,
      status: 'Pending Approval'
    });

    // Close modal and reset
    setShowReviseModal(false);
    setReviseOrderId(null);
    setNewDesignFile(null);
    setNewDesignPreview(null);
    setUploadError('');
  };



  // Handle payment for pending orders
  const handleCompletePayment = (order) => {
    console.log('💳 Opening payment for order:', order);
    
    const razorpayOrderId = order.razorpay_order_id || order.razorpayOrderId;
    
    if (!razorpayOrderId) {
      alert('No payment ID found for this order. Please contact support.');
      return;
    }
    
    // Load Razorpay script if not already loaded
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        console.log('✅ Razorpay script loaded');
        openRazorpayForOrder(order, razorpayOrderId);
      };
      script.onerror = () => {
        console.error('❌ Failed to load Razorpay script');
        alert('Failed to load payment gateway. Please try again.');
      };
      document.body.appendChild(script);
    } else {
      openRazorpayForOrder(order, razorpayOrderId);
    }
  };

  const openRazorpayForOrder = (order, razorpayOrderId) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const options = {
      key: RAZORPAY_KEY,
      amount: convertToPaise(order.totalAmount || order.amount || order.final_amount || order.total_cost || 0),
      currency: RAZORPAY_CONFIG.currency,
      name: RAZORPAY_CONFIG.name,
      description: `Payment for Order #${order.id}`,
      order_id: razorpayOrderId,
      prefill: {
        name: user.fullName || user.name || '',
        email: user.email || '',
        contact: user.phoneNumber || user.phone || ''
      },
      theme: RAZORPAY_CONFIG.theme,
      handler: async function (response) {
        console.log('✅ Payment successful:', response);
        window.location.href = `/booking-success?orderId=${order.id}&payment_id=${response.razorpay_payment_id}`;
      },
      modal: {
        ondismiss: function() {
          console.log('⚠️ Payment modal closed by user');
          alert('Payment cancelled. You can retry payment from My Orders page.');
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending Approval':
        return styles.statusPending;
      case 'In Display':
        return styles.statusActive;
      case 'Completed Display':
        return styles.statusCompleted;
      case 'Cancelled Display':
        return styles.statusCancelled;
      case 'Revise Your Design':
        return styles.statusRevision;
      case 'Payment Completed - Pending Approval':
        return styles.statusCompleted;
      case 'Payment Failed':
        return styles.statusCancelled;
      case 'Payment Completed - Refund Initiated':
        return styles.statusRefund;
      default:
        return styles.statusPending;
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div>Loading orders...</div>
      </div>
    );
  }

  // Ensure orders is always an array
  const safeOrders = Array.isArray(orders) ? orders : [];
  

  return (
    <div className={styles.myOrders}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerText}>
              <h1>My Orders</h1>
              <p>Track your advertising campaigns</p>
            </div>
            <div className={styles.headerActions}>
              <button
                onClick={handleRefreshOrders}
                disabled={refreshing || loading}
                className={`${styles.btn} ${styles.btnSecondary} ${styles.refreshBtn}`}
              >
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
          {refreshError && (
            <div className={styles.errorMessage}>
              {refreshError}
            </div>
          )}
        </div>

        <div className={styles.pageLayout}>
          <div className={styles.ordersSection}>
            {safeOrders.length === 0 ? (
              <div className={styles.emptyState}>
                <h2>No orders yet</h2>
                <p>Start your first advertising campaign by booking an LED screen.</p>
                <button 
                  onClick={() => navigate('/booking')}
                  className={`${styles.btn} ${styles.btnPrimary}`}
                >
                  Book Your First Ad
                </button>
              </div>
            ) : (
              <div className={styles.ordersList}>
                {/* Book New Ad Button for users with existing orders */}
                <div className={styles.bookNewSection}>
                  <button 
                    onClick={() => navigate('/booking')}
                    className={`${styles.btn} ${styles.btnPrimary} ${styles.bookNewBtn}`}
                  >
                    Book New Ad
                  </button>
                </div>
                
                {safeOrders.map((order, index) => (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.cardContent}>
                  <div className={styles.orderLeft}>
                    <div className={styles.orderHeader}>
                      <div>
                        <h3>Order #{safeOrders.length - index}</h3>
                        <p className={styles.orderUid}>{order.orderUid || order.order_uid || `ORD-${order.id}`}</p>
                      </div>
                      <div className={`${styles.orderStatus} ${getStatusColor(order.status)}`}>
                        {order.status}
                      </div>
                    </div>

                    <div className={styles.orderInfo}>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Location:</span>
                        <span className={styles.infoValue}>{order.locations?.name || order.locationName || order.location || 'N/A'}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Plan:</span>
                        <span className={styles.infoValue}>{order.plans?.name || order.planName || 'N/A'}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Display Date:</span>
                        <span className={styles.infoValue}>{formatDate(order.start_date || order.startDate || order.displayDate)}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Duration:</span>
                        <span className={styles.infoValue}>{order.plans?.duration_days || order.planDuration || 1} day(s)</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Total Amount:</span>
                        <span className={styles.infoValue}><strong>{formatCurrency(order.total_cost || order.final_amount || order.totalAmount || order.amount || 0)}</strong></span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Ordered:</span>
                        <span className={styles.infoValue}>{formatDate(order.created_at || order.createdAt || order.orderDate)}</span>
                      </div>
                    </div>

                    <div className={styles.orderActions}>
                      {/* Complete Payment Button */}
                      {(order.status === 'Pending Payment' && (order.razorpay_order_id || order.razorpayOrderId)) && (
                        <button
                          onClick={() => handleCompletePayment(order)}
                          className={`${styles.btn} ${styles.btnPrimary}`}
                        >
                          Complete Payment
                        </button>
                      )}
                      
                      {/* Revise Design Button */}
                      {canReviseOrder(order) && (
                        <button
                          onClick={() => handleReviseOrder(order.id)}
                          className={`${styles.btn} ${styles.btnSecondary}`}
                        >
                          Upload New Design
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right Side - Creative Preview (if available) */}
                  <div className={styles.orderRight}>
                    {order.creatives && order.creatives.length > 0 && order.creatives[0].publicUrl ? (
                      <div className={styles.creativePreview}>
                        <img 
                          src={order.creatives[0].publicUrl} 
                          alt="Creative Preview"
                          className={styles.previewImage}
                        />
                        <p className={styles.fileName}>{order.creatives[0].file_name}</p>
                      </div>
                    ) : (
                      <div className={styles.creativePreviewPlaceholder}>
                        <div className={styles.placeholderIcon}>🎨</div>
                        <p>Creative File</p>
                        <small>{order.creatives?.[0]?.file_name || 'Pending Upload'}</small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setShowImageModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.modalClose}
              onClick={() => setShowImageModal(false)}
            >
              ×
            </button>
            <div className={styles.modalHeader}>
              <h2>Order #{safeOrders.length - safeOrders.findIndex(o => o.id === selectedOrder.id)}</h2>
              <p>Your Advertisement</p>
            </div>
            <div className={styles.modalImage}>
              <img src={selectedOrder.thumbnail} alt="Ad Preview" />
            </div>
            <div className={styles.modalActions}>
              <button
                onClick={() => {
                  // Simulate download
                  const link = document.createElement('a');
                  link.href = selectedOrder.thumbnail;
                  link.download = `ad-${selectedOrder.id}.jpg`;
                  link.click();
                }}
                className={`${styles.btn} ${styles.btnPrimary}`}
              >
                Download Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revise Order Modal */}
      {showReviseModal && (
        <div className={styles.modalOverlay} onClick={() => setShowReviseModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.modalClose}
              onClick={() => setShowReviseModal(false)}
            >
              ×
            </button>
            
            <div className={styles.modalHeader}>
              <h2>Revise Your Design</h2>
              <p>Upload a new design for Order #{safeOrders.length - safeOrders.findIndex(o => o.id === reviseOrderId)}</p>
            </div>

            <div className={styles.uploadSection}>
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className={styles.fileInput}
                id="revise-upload"
              />
              <label htmlFor="revise-upload" className={styles.fileInputLabel}>
                <div className={styles.uploadArea}>
                  <svg className={styles.uploadIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p>Click to upload or drag and drop</p>
                  <p className={styles.fileTypes}>JPG, PNG (max 15MB)</p>
                </div>
              </label>

              {uploadError && (
                <div className={styles.errorMessage}>
                  {uploadError}
                </div>
              )}

              {newDesignPreview && (
                <div className={styles.previewSection}>
                  <h3>New Design Preview</h3>
                  <img src={newDesignPreview} alt="New Design Preview" className={styles.previewImage} />
                  <p className={styles.fileInfo}>
                    File: {newDesignFile?.name} ({(newDesignFile?.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              )}
            </div>

            <div className={styles.modalActions}>
              <button
                onClick={() => setShowReviseModal(false)}
                className={`${styles.btn} ${styles.btnSecondary}`}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRevision}
                disabled={!newDesignFile}
                className={`${styles.btn} ${styles.btnPrimary}`}
              >
                Submit Revision
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
