import React, { useState } from 'react';
import { useOrders } from '../hooks/useOrders';
import { formatDate, formatCurrency, validateFile, compressImage, manageStorageQuota } from '../utils/validation';
import { Link } from 'react-router-dom';
import styles from '../styles/MyOrders.module.css';

export default function MyOrders() {
  const { orders, loading, cancelOrder, reviseOrder } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showReviseModal, setShowReviseModal] = useState(false);
  const [reviseOrderId, setReviseOrderId] = useState(null);
  const [newDesignFile, setNewDesignFile] = useState(null);
  const [newDesignPreview, setNewDesignPreview] = useState(null);
  const [uploadError, setUploadError] = useState('');

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

  return (
    <div className={styles.myOrders}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>My Orders</h1>
          <p>Track your advertising campaigns</p>
        </div>

        {orders.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>No orders yet</h2>
            <p>Start your first advertising campaign by booking an LED screen.</p>
            <Link to="/dashboard" className={`${styles.btn} ${styles.btnPrimary}`}>
              Book Your First Ad
            </Link>
          </div>
        ) : (
          <div className={styles.ordersList}>
            {orders.map((order) => (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div className={styles.orderInfo}>
                    <h3>Order #{order.id}</h3>
                    <p className={styles.orderDate}>
                      Ordered on {formatDate(order.orderDate)}
                    </p>
                    <p className={styles.displayDate}>
                      Display Date: {formatDate(order.displayDate)}
                    </p>
                    <p className={styles.orderLocation}>
                      <strong>Location:</strong> {order.location}
                    </p>
                    <p className={styles.orderScreen}>
                      <strong>Screen:</strong> {order.screenName}
                    </p>
                  </div>
                  <div className={`${styles.orderStatus} ${getStatusColor(order.status)}`}>
                    {order.status}
                  </div>
                </div>

                <div className={styles.orderDetails}>
                  <div className={styles.orderAmount}>
                    <strong>Total Amount:</strong> {formatCurrency(order.totalAmount)}
                  </div>
                  
                  {/* Design Thumbnail - Show for all orders */}
                  <div className={styles.orderThumbnail}>
                    <h4>Your Design</h4>
                    <img
                      src={order.thumbnail}
                      alt="Ad Preview"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowImageModal(true);
                      }}
                      className={styles.thumbnailImage}
                    />
                    <small>Click to view full size</small>
                  </div>

                  {/* Admin Proof Image - Show for completed and in-display orders */}
                  {order.adminProofImage && (order.status === 'In Display' || order.status === 'Completed Display') && (
                    <div className={styles.adminProof}>
                      <h4>Proof of Display</h4>
                      <img
                        src={order.adminProofImage}
                        alt="Ad Displayed on LED Screen"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowImageModal(true);
                        }}
                        className={styles.proofImage}
                      />
                      <small>Click to view proof of display</small>
                    </div>
                  )}
                </div>

                <div className={styles.orderActions}>
                  {/* Revise Design Button - Only show if status is "Revise Your Design" and timing allows */}
                  {canReviseOrder(order) && (
                    <button
                      onClick={() => handleReviseOrder(order.id)}
                      className={`${styles.btn} ${styles.btnPrimary}`}
                    >
                      Upload New Design
                    </button>
                  )}
                  
                  {/* Cancel Order Button - Only show for pending and revision orders */}
                  {(order.status === 'Pending Approval' || order.status === 'Revise Your Design') && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className={`${styles.btn} ${styles.btnDanger}`}
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
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
              <h2>Order #{selectedOrder.id}</h2>
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
              <p>Upload a new design for Order #{reviseOrderId}</p>
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
