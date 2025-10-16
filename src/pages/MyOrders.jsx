import React, { useState, useEffect } from 'react';
import { useOrders } from '../hooks/useOrders';
import { formatDate, formatCurrency, validateFile, compressImage, manageStorageQuota } from '../utils/validation';
import { useNavigate } from 'react-router-dom';
import { filesAPI } from '../config/api';
import { ORDER_STATUS, ALL_ORDER_STATUSES, canReviseOrder } from '../config/orderStatuses';
import Toast from '../components/Toast';
import styles from '../styles/MyOrders.module.css';

export default function MyOrders() {
  const { orders, loading, reviseOrder, refreshOrders, updateOrderStatus } = useOrders();
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showReuploadModal, setShowReuploadModal] = useState(false);
  const [reuploadOrderId, setReuploadOrderId] = useState(null);
  const [reuploadFile, setReuploadFile] = useState(null);
  const [reuploadPreview, setReuploadPreview] = useState(null);
  const [reuploadError, setReuploadError] = useState('');
  const [reuploading, setReuploading] = useState(false);
  const [reuploadSuccess, setReuploadSuccess] = useState(false);
  const [refreshError, setRefreshError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 5000);
  };
  const [refreshing, setRefreshing] = useState(false);

  // Handle refresh orders
  const handleRefreshOrders = async () => {
    setRefreshing(true);
    setRefreshError('');
    try {
      const result = await refreshOrders();
      if (!result.success) {
        setRefreshError('Unable to load orders. Please try again.');
      }
    } catch (error) {
      setRefreshError('Unable to load orders. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };


  // Check if order can be revised (only if status is "Design Revise")
  const canRevisePendingOrder = (order) => {
    return order.status === ORDER_STATUS.DESIGN_REVISE;
  };


  const canReuploadCreative = (order) => {
    // Allow re-upload for Design Revise orders
    return order.status === ORDER_STATUS.DESIGN_REVISE;
  };






  const handleReuploadCreative = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    
    if (!canReuploadCreative(order)) {
      showToast('This order cannot be re-uploaded. Please check the status.', 'error');
      return;
    }

    setReuploadOrderId(orderId);
    setShowReuploadModal(true);
    setReuploadFile(null);
    setReuploadPreview(null);
    setReuploadError('');
  };

  const handleReuploadFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Manual validation for images and videos
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/quicktime'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    const isImage = allowedImageTypes.includes(file.type);
    const isVideo = allowedVideoTypes.includes(file.type);

    if (!isImage && !isVideo) {
      setReuploadError('Invalid file type. Please upload JPG, PNG, MP4, AVI, or MOV files only.');
      return;
    }

    if (file.size > maxSize) {
      setReuploadError('File size too large. Please upload files smaller than 50MB.');
      return;
    }

    setReuploadError('');
    setReuploadFile(file);

    // Create preview immediately for all file types
    if (file.type.startsWith('image/')) {
      // For images, try compression first, fallback to direct URL
      try {
        if (!manageStorageQuota()) {
          setReuploadError('Storage space is full. Please clear some data and try again.');
          return;
        }
        const compressedBlob = await compressImage(file, 800, 0.7);
        
        if (!compressedBlob) {
          throw new Error('Compression failed - blob is null');
        }
        
        const compressedPreview = URL.createObjectURL(compressedBlob);
        setReuploadPreview(compressedPreview);
      } catch (compressError) {
        // If compression fails, use direct object URL
        const directUrl = URL.createObjectURL(file);
        setReuploadPreview(directUrl);
      }
    } else {
      // For videos, create a simple preview
      const directUrl = URL.createObjectURL(file);
      setReuploadPreview(directUrl);
    }
  };

  const handleSubmitReupload = async () => {
    if (!reuploadFile) {
      setReuploadError('Please upload a new creative file');
      return;
    }

    setReuploading(true);
    setReuploadError('');

    try {
      // Step 1: Get re-upload URL
      showToast('Getting upload URL...', 'info');
      
      const reuploadResponse = await filesAPI.getReuploadUrl(
        reuploadOrderId, 
        reuploadFile.name, 
        reuploadFile.type
      );

      // Check if the response is successful
      if (!reuploadResponse.success) {
        const errorMsg = reuploadResponse.error || reuploadResponse.data?.message || 'Failed to get re-upload URL';
        throw new Error(errorMsg);
      }

      // The backend returns: { statusCode, data: { signedUrl, path }, message, success }
      // And makeRequest wraps it as: { success: true, data: <backend_response> }
      const backendData = reuploadResponse.data?.data || reuploadResponse.data;
      const signedUrl = backendData?.signedUrl;
      const path = backendData?.path;

      if (!signedUrl || !path) {
        throw new Error('Invalid response from server: missing signedUrl or path');
      }

      // Step 2: Upload file to signed URL
      showToast('Uploading file...', 'info');
      
      const uploadResponse = await filesAPI.uploadFile(signedUrl, reuploadFile, reuploadFile.type);
      
      // Upload to Supabase storage should return a successful response
      if (!uploadResponse || !uploadResponse.success) {
        throw new Error('Failed to upload file to storage');
      }

      // Step 3: Finalize re-upload
      showToast('Finalizing upload...', 'info');
      
      // Backend expects docType as "design" for all creative uploads
      const docType = 'design';
      const finalizeResponse = await filesAPI.finalizeReupload(
        reuploadOrderId,
        path,
        reuploadFile.name,
        docType
      );

      // Check if finalize was successful
      if (!finalizeResponse.success) {
        const errorMsg = finalizeResponse.error || finalizeResponse.data?.message || 'Failed to finalize re-upload';
        throw new Error(errorMsg);
      }

      // Clear any previous states
      setReuploading(false);
      setReuploadError('');
      
      // Set success state FIRST for immediate visual feedback
      setReuploadSuccess(true);
      
      // Show success toast IMMEDIATELY
      setTimeout(() => {
        showToast('🎉 Creative re-uploaded successfully! Your order status is now "Pending Approval". The admin team will review your new creative shortly.', 'success');
      }, 100);
      
      // Update the order status locally to "Pending Approval" immediately
      // This will cause the button to disappear as it only shows for "Design Revise" status
      updateOrderStatus(reuploadOrderId, ORDER_STATUS.PENDING_APPROVAL);
      
      // Refresh orders to get updated status and creative URL from backend
      await refreshOrders();

      // Close modal and reset after showing success state
      setTimeout(() => {
        setShowReuploadModal(false);
        setReuploadOrderId(null);
        setReuploadFile(null);
        setReuploadPreview(null);
        setReuploadError('');
        setReuploadSuccess(false);
      }, 3000);

    } catch (error) {
      const errorMessage = error.message || 'Failed to re-upload creative. Please try again.';
      setReuploadError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setReuploading(false);
    }
  };

  // All possible statuses (matching admin module)
  const allStatuses = ['All', ...ALL_ORDER_STATUSES];

  // Filter orders based on search term and status
  const getFilteredOrders = () => {
    return orders.filter(order => {
    // Status filter
    if (statusFilter !== 'All' && order.status !== statusFilter) {
      return false;
    }
    
    // Search filter
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase().trim();
    
    // Search by Order ID - exact match or starts with
    const orderId = order.id?.toString() || '';
    const orderUid = order.orderUid?.toString() || '';
    const order_uid = order.order_uid?.toString() || '';
    
    // Check for exact order ID match first
    if (orderId === searchLower || 
        orderUid.toLowerCase() === searchLower || 
        order_uid.toLowerCase() === searchLower) {
      return true;
    }
    
    // Check if order ID starts with search term
    if (orderId.startsWith(searchLower) || 
        orderUid.toLowerCase().startsWith(searchLower) || 
        order_uid.toLowerCase().startsWith(searchLower)) {
      return true;
    }
    
    // Search by Location - word match
    const locationName = (order.locations?.name || order.locationName || order.location || '').toLowerCase();
    if (locationName.includes(searchLower)) {
      return true;
    }
    
    // Search by Display Date - exact match or contains
    const displayDate = (order.start_date || order.startDate || order.displayDate || '').toLowerCase();
    if (displayDate.includes(searchLower)) {
      return true;
    }
    
    return false;
    });
  };

  const filteredOrders = getFilteredOrders();
  
  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm]);



  const getStatusColorClass = (status) => {
    // Handle both exact matches and trimmed matches
    const trimmedStatus = status ? status.trim() : '';
    
        switch (trimmedStatus) {
          case 'Pending Payment':
            return styles.statusPending;
          case 'Payment Failed':
            return styles.statusPaymentFailed;
          case 'Pending Approval':
            return styles.statusPendingApproval;
          case 'Design Revise':
            return styles.statusDesignRevise;
          case 'Pending Display (Approved)':
            return styles.statusPendingDisplayApproval;
          case 'In Display':
            return styles.statusActive;
          case 'Completed':
            return styles.statusCompleted;
          case 'Cancelled - Forfeited':
            return styles.statusCancelledForfeited;
          case 'Cancelled - Refunded':
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
          <div className={styles.headerLeft}>
          <div className={styles.headerText}>
            <h1>My Orders</h1>
              <p className={styles.headerSubtext}>Track and manage your advertising campaigns</p>
            </div>
          </div>
          <button 
            onClick={handleRefreshOrders}
            disabled={refreshing || loading}
            className={`${styles.btn} ${styles.btnPrimary} ${styles.refreshBtn}`}
            style={{minWidth: '140px'}}
          >
            {refreshing ? (
              <>
                <span className={styles.spinner}></span>
                Refreshing...
              </>
            ) : (
              <>
                🔄 Refresh
              </>
            )}
          </button>
          {refreshError && (
            <div className={styles.errorMessage}>
              {refreshError}
            </div>
          )}
        </div>

        {/* Search Bar, Filter and Refresh Button */}
        <div className={styles.searchAndActions}>
          <div className={styles.searchSection}>
            <div className={styles.searchContainer}>
              <div className={styles.searchInputWrapper}>
                <input
                  type="text"
                  placeholder="Search by Order ID Location or Display Date..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
                <div className={styles.searchIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                </div>
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className={styles.clearSearchBtn}
                  title="Clear search"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
            {searchTerm && (
              <div className={styles.searchResults}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '0.5rem'}}>
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                Found {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} matching "{searchTerm}"
              </div>
            )}
          </div>
          
          <div className={styles.filterSection}>
            <label htmlFor="status-filter" className={styles.filterLabel}>Filter by Status:</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.statusFilterDropdown}
            >
              {allStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        {filteredOrders.length > 0 && (
          <div className={styles.resultsCount}>
            Showing {indexOfFirstOrder + 1}-{Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
          </div>
        )}

        <div className={styles.pageLayout}>
          <div className={styles.ordersSection}>
            {currentOrders.length === 0 ? (
              <div className={styles.emptyState}>
                {searchTerm || statusFilter !== 'All' ? (
                  <>
                    <h2>No orders found</h2>
                    <p>No orders match your current filters.</p>
                    <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem'}}>
                      {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className={`${styles.btn} ${styles.btnSecondary}`}
                    >
                      Clear Search
                    </button>
                      )}
                      {statusFilter !== 'All' && (
                        <button 
                          onClick={() => setStatusFilter('All')}
                          className={`${styles.btn} ${styles.btnSecondary}`}
                        >
                          Clear Filter
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <h2>No orders yet</h2>
                    <p>Start your first advertising campaign by booking an LED screen.</p>
                    <button 
                      onClick={() => navigate('/')}
                      className={`${styles.btn} ${styles.btnPrimary}`}
                    >
                      📺 Book Your First Ad
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className={styles.ordersList}>
                {currentOrders.map((order, index) => (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.cardContent}>
                  <div className={styles.orderLeft}>
                    <div className={styles.orderHeader}>
                      <div>
                        <h3>Order #{order.orderUid || order.order_uid || `ORD-${order.id}`}</h3>
                        <p className={styles.orderUid}>{order.orderUid || order.order_uid || `ORD-${order.id}`}</p>
                      </div>
                      <div className={`${styles.orderStatus} ${getStatusColorClass(order.status)}`}>
                        {order.status}
                      </div>
                    </div>

                    <div className={styles.orderInfo}>
                      <div className={`${styles.infoRow} ${styles.highlightRow}`}>
                        <span className={styles.infoLabel}>📍 Location:</span>
                        <span className={`${styles.infoValue} ${styles.highlightValue}`}>
                          {order.locations?.name || order.locationName || order.location || 'N/A'}
                        </span>
                      </div>
                      <div className={`${styles.infoRow} ${styles.highlightRow}`}>
                        <span className={styles.infoLabel}>📋 Plan:</span>
                        <span className={`${styles.infoValue} ${styles.highlightValue}`}>
                          {order.plans?.name || order.planName || 'N/A'}
                        </span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Display Date:</span>
                        <span className={styles.infoValue}>{formatDate(order.start_date || order.startDate || order.displayDate)}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Duration:</span>
                        <span className={styles.infoValue}>{order.plans?.duration_days || order.planDuration || order.duration_days || (order.plans?.name === 'IMPACT' ? 3 : order.plans?.name === 'THRIVE' ? 5 : 1)} day(s)</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Base Price:</span>
                        <span className={styles.infoValue}>{formatCurrency(order.baseAmount || order.total_cost || 0)}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>GST (18%):</span>
                        <span className={styles.infoValue}>{formatCurrency(order.gstAmount || 0)}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Total Amount:</span>
                        <span className={styles.infoValue}><strong>{formatCurrency(order.final_amount || order.totalAmount || 0)}</strong></span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Ordered:</span>
                        <span className={styles.infoValue}>{formatDate(order.created_at || order.createdAt || order.orderDate)}</span>
                      </div>
                      
                      {/* Admin Remarks - Read Only (Always show for demo, or when available) */}
                      <div className={styles.remarksSection}>
                        <label className={styles.remarksLabel}>💬 Admin Remarks:</label>
                        <textarea
                          value={order.remarks || 'No remarks from admin yet.'}
                          readOnly
                          className={styles.remarksTextarea}
                          rows={3}
                          placeholder="Admin will add remarks here..."
                        />
                      </div>
                    </div>

                    <div className={styles.orderActions}>
                      {/* Re-upload Creative Button - Only shows for "Design Revise" status */}
                      {canReuploadCreative(order) && !(reuploadSuccess && order.id === reuploadOrderId) && (
                        <button
                          onClick={() => handleReuploadCreative(order.id)}
                          className={`${styles.btn} ${styles.btnUpload}`}
                          title="Re-upload your creative file"
                          disabled={reuploading && order.id === reuploadOrderId}
                        >
                          {reuploading && order.id === reuploadOrderId ? (
                            <>🔄 Uploading...</>
                          ) : (
                            <>🎨 Re-upload Creative</>
                          )}
                        </button>
                      )}
                      
                      {/* Success indicator - shows temporarily after successful upload */}
                      {reuploadSuccess && order.id === reuploadOrderId && (
                        <div className={`${styles.btn} ${styles.btnSuccess}`} style={{ cursor: 'default' }}>
                          ✅ Upload Successful - Pending Approval
                        </div>
                      )}
                      
                    </div>
                  </div>

                  {/* Right Side - Creative Preview (if available) */}
                  <div className={styles.orderRight}>
                    {/* User's Uploaded Creative - Always Show */}
                    <div className={styles.imageSection}>
                      <h4 className={styles.imageSectionTitle}>🎨 Your Creative</h4>
                      {(() => {
                        const imageUrl = order.creatives?.[0]?.image_url || 
                                       order.creatives?.[0]?.publicUrl || 
                                       order.creative_image_url;
                        
                        // Determine if file is video or image
                        const isVideo = order.fileType === 'video' || 
                                       order.creativeFileName?.toLowerCase().match(/\.(mp4|mov|avi|mkv|webm)$/) ||
                                       imageUrl?.toLowerCase().match(/\.(mp4|mov|avi|mkv|webm)$/);
                        
                        return imageUrl ? (
                          <div className={styles.creativePreview}>
                            {isVideo ? (
                              <video 
                                src={imageUrl} 
                                className={styles.previewImage}
                                crossOrigin="anonymous"
                                controls
                                preload="metadata"
                                onLoadStart={(e) => {
                                  e.target.style.opacity = '1';
                                }}
                                onError={(e) => {
                                  // Try displaying URL as fallback
                                  const parent = e.target.parentElement;
                                  const fallback = document.createElement('div');
                                  fallback.style.cssText = 'padding: 1rem; background: #f0f9ff; border: 2px dashed #3b82f6; border-radius: 8px; color: #1e40af; font-size: 0.875rem; text-align: center;';
                                  fallback.innerHTML = `
                                    <p style="margin: 0 0 0.5rem 0; font-weight: 600;">🎬 Video Available</p>
                                    <p style="margin: 0; font-size: 0.75rem; word-break: break-all;">${order.creatives?.[0]?.file_name || 'creative.mp4'}</p>
                                    <p style="margin: 0.5rem 0 0 0; font-size: 0.75rem; color: #64748b;">Click download to view</p>
                                  `;
                                  e.target.style.display = 'none';
                                  parent.insertBefore(fallback, e.target.nextSibling);
                                }}
                                style={{ opacity: 0, transition: 'opacity 0.3s ease' }}
                              />
                            ) : (
                              <img 
                                src={imageUrl} 
                                alt="Your Creative"
                                className={styles.previewImage}
                                crossOrigin="anonymous"
                                loading="lazy"
                                onLoad={(e) => {
                                  e.target.style.opacity = '1';
                                }}
                                onError={(e) => {
                                  // Try displaying URL as fallback
                                  const parent = e.target.parentElement;
                                  const fallback = document.createElement('div');
                                  fallback.style.cssText = 'padding: 1rem; background: #f0f9ff; border: 2px dashed #3b82f6; border-radius: 8px; color: #1e40af; font-size: 0.875rem; text-align: center;';
                                  fallback.innerHTML = `
                                    <p style="margin: 0 0 0.5rem 0; font-weight: 600;">📸 Image Available</p>
                                    <p style="margin: 0; font-size: 0.75rem; word-break: break-all;">${order.creatives?.[0]?.file_name || 'creative.png'}</p>
                                    <p style="margin: 0.5rem 0 0 0; font-size: 0.75rem; color: #64748b;">Click download to view</p>
                                  `;
                                  e.target.style.display = 'none';
                                  parent.insertBefore(fallback, e.target.nextSibling);
                                }}
                                style={{ opacity: 0, transition: 'opacity 0.3s ease' }}
                              />
                            )}
                            <p className={styles.fileName}>{order.creatives?.[0]?.file_name || 'creative.png'}</p>
                            <button
                              onClick={() => {
                                window.open(imageUrl, '_blank');
                              }}
                              className={`${styles.btn} ${styles.btnDownload}`}
                            >
                              View/Download
                            </button>
                          </div>
                        ) : (
                          <div className={styles.creativePreviewPlaceholder}>
                            <div className={styles.placeholderIcon}>🎨</div>
                            <p>Creative File</p>
                            <small>{order.creatives?.[0]?.file_name || 'Pending Upload'}</small>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Admin's Preview Image - Always Show Section */}
                    <div className={styles.imageSection}>
                      <h4 className={styles.imageSectionTitle}>🖼️ Admin Preview</h4>
                      {(() => {
                        // Check multiple possible field names for admin preview
                        const adminImageUrl = order.ad_display_url || order.ad_desplay_url || order.admin_preview_url || order.adDisplayPath;
                        
                        return adminImageUrl ? (
                          <div className={styles.creativePreview}>
                            <img 
                              src={adminImageUrl} 
                              alt="Admin Preview"
                              className={styles.previewImage}
                              crossOrigin="anonymous"
                              loading="lazy"
                              onLoad={(e) => {
                                e.target.style.opacity = '1';
                              }}
                              onError={(e) => {
                                const parent = e.target.parentElement;
                                const fallback = document.createElement('div');
                                fallback.style.cssText = 'padding: 1rem; background: #f0f9ff; border: 2px dashed #3b82f6; border-radius: 8px; color: #1e40af; font-size: 0.875rem; text-align: center;';
                                fallback.innerHTML = `
                                  <p style="margin: 0 0 0.5rem 0; font-weight: 600;">📸 Admin Preview Available</p>
                                  <p style="margin: 0.5rem 0 0 0; font-size: 0.75rem; color: #64748b;">Click download to view</p>
                                `;
                                e.target.style.display = 'none';
                                parent.insertBefore(fallback, e.target.nextSibling);
                              }}
                              style={{ opacity: 0, transition: 'opacity 0.3s ease' }}
                            />
                            <p className={styles.fileName}>Preview from Admin</p>
                            <button
                              onClick={() => {
                                window.open(adminImageUrl, '_blank');
                              }}
                              className={`${styles.btn} ${styles.btnDownload}`}
                            >
                              View/Download
                            </button>
                          </div>
                        ) : (
                          <div className={styles.creativePreviewPlaceholder}>
                            <div className={styles.placeholderIcon}>⏳</div>
                            <p>Admin Preview</p>
                            <small>Admin will upload preview soon</small>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
                ))}
              </div>
            )}
          </div>
          
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className={styles.paginationContainer}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={styles.paginationBtn}
            >
              ← Previous
            </button>
            
            <div className={styles.pageNumbers}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`${styles.pageBtn} ${currentPage === page ? styles.activePage : ''}`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              className={styles.paginationBtn}
            >
              Next →
            </button>
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
              <h2>Order #{selectedOrder.orderUid || selectedOrder.order_uid || `ORD-${selectedOrder.id}`}</h2>
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

      {/* Re-upload Creative Modal */}
      {showReuploadModal && (() => {
        const reuploadOrder = orders.find(o => o.id === reuploadOrderId);
        return reuploadOrder ? (
          <div className={styles.modalOverlay} onClick={() => setShowReuploadModal(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <button
                className={styles.modalClose}
                onClick={() => setShowReuploadModal(false)}
              >
                ×
              </button>
              
              <div className={styles.modalHeader}>
                <h2>Re-upload Creative</h2>
                <p>Upload a new creative file for Order #{reuploadOrder?.orderUid || reuploadOrder?.order_uid || `ORD-${reuploadOrderId}`}</p>
              </div>

              <div className={styles.uploadSection}>
                {!reuploadFile ? (
                  <>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.mp4,.avi,.mov"
                      onChange={handleReuploadFileUpload}
                      className={styles.fileInput}
                      id="reupload-upload"
                      disabled={reuploading}
                    />
                    <label htmlFor="reupload-upload" className={styles.fileInputLabel}>
                      <div className={styles.uploadArea}>
                        <svg className={styles.uploadIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p>Click to upload or drag and drop</p>
                        <p className={styles.fileTypes}>JPG, PNG, MP4, AVI, MOV (max 50MB)</p>
                      </div>
                    </label>
                  </>
                ) : (
                  <div className={styles.previewSection}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 style={{ margin: 0 }}>New Creative Preview</h3>
                      <button
                        type="button"
                        onClick={() => {
                          setReuploadFile(null);
                          setReuploadPreview(null);
                          setReuploadError('');
                        }}
                        className={`${styles.btn} ${styles.btnSecondary}`}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                        disabled={reuploading}
                      >
                        Change File
                      </button>
                    </div>
                    <div className={styles.previewContainer}>
                      {reuploadFile.type.startsWith('video/') ? (
                        <video 
                          src={reuploadPreview} 
                          className={styles.previewImage}
                          controls
                          preload="metadata"
                          style={{ width: '100%', height: 'auto', maxHeight: '300px' }}
                        />
                      ) : (
                        <img 
                          src={reuploadPreview} 
                          alt="New Creative Preview" 
                          className={styles.previewImage}
                          style={{ width: '100%', height: 'auto', maxHeight: '300px' }}
                        />
                      )}
                    </div>
                    <p className={styles.fileInfo}>
                      File: {reuploadFile.name} ({(reuploadFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
                )}

                {reuploadError && (
                  <div className={styles.errorMessage} style={{ marginTop: '1rem' }}>
                    {reuploadError}
                  </div>
                )}
              </div>

              <div className={styles.modalActions}>
                <button
                  onClick={() => setShowReuploadModal(false)}
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  disabled={reuploading}
                >
                  ← Cancel
                </button>
                <button
                  onClick={handleSubmitReupload}
                  disabled={!reuploadFile || reuploading}
                  className={`${styles.btn} ${styles.btnUpload}`}
                >
                  {reuploading ? (
                    <>
                      <div className={styles.spinner}></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      ✓ Looks Good - Re-upload Creative
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : null;
      })()}

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
