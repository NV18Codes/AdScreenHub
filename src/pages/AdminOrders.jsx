import React, { useState, useEffect } from 'react';
import { adminOrdersAPI } from '../config/adminApi';
import { formatDate, formatCurrency } from '../utils/validation';
import { ORDER_STATUS, ALL_ORDER_STATUSES } from '../config/orderStatuses';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import styles from '../styles/AdminOrders.module.css';

export default function AdminOrders() {
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const getStatusClass = (status) => {
    const trimmedStatus = status ? status.trim() : '';
    
    switch (trimmedStatus) {
      case 'Pending Payment':
        return styles.statusPendingPayment;
      case 'Payment Failed':
        return styles.statusPaymentFailed;
      case 'Pending Approval':
        return styles.statusPendingApproval;
      case 'Design Revise':
        return styles.statusDesignRevise;
      case 'Pending Display Approval':
        return styles.statusPendingDisplay;
      case 'In Display':
        return styles.statusInDisplay;
      case 'Completed':
        return styles.statusCompleted;
      case 'Cancelled - Forfeited':
        return styles.statusCancelledDisplay;
      case 'Cancelled':
        return styles.statusCancelledDisplay;
      case 'Cancelled - Refunded':
        return styles['statusCancelled-Refunded'];
      default:
        return styles.statusPendingPayment;
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  // Fetch all orders
  useEffect(() => {
    fetchOrders();
  }, []);

  // Check and update orders that should move from "In Display" to "Completed" or auto-cancel "Design Revise"
  const checkDisplayDates = async (orders) => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Orders to move from "In Display" to "Completed"
    const inDisplayOrders = orders.filter(order => {
      if (order.status !== ORDER_STATUS.IN_DISPLAY) return false;
      
      const displayDate = order.start_date || order.startDate || order.displayDate;
      if (!displayDate) return false;
      
      const durationDays = order.plans?.duration_days || order.planDuration || 1;
      const startDate = new Date(displayDate);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + durationDays - 1);
      const orderEndDate = endDate.toISOString().split('T')[0];
      
      return orderEndDate < today;
    });
    
    // Orders to cancel "Design Revise" if booking date has passed
    const designReviseOrders = orders.filter(order => {
      if (order.status !== ORDER_STATUS.DESIGN_REVISE) return false;
      
      const displayDate = order.start_date || order.startDate || order.displayDate;
      if (!displayDate) return false;
      
      const orderDisplayDate = new Date(displayDate).toISOString().split('T')[0];
      return orderDisplayDate < today;
    });
    
    let updatedCount = 0;
    
    // Update "In Display" orders to "Completed"
    for (const order of inDisplayOrders) {
      try {
        await adminOrdersAPI.updateOrder(order.id, {
          status: ORDER_STATUS.COMPLETED,
          remarks: (order.remarks || '') + ' [Auto-updated: Display period completed]'
        });
        updatedCount++;
      } catch (error) {
        // Silent error handling
      }
    }
    
    // Cancel "Design Revise" orders if booking date has passed
    for (const order of designReviseOrders) {
      try {
        await adminOrdersAPI.updateOrder(order.id, {
          status: ORDER_STATUS.CANCELLED,
          remarks: (order.remarks || '') + ' [Auto-cancelled: Design revision deadline exceeded]'
        });
        updatedCount++;
      } catch (error) {
        // Silent error handling
      }
    }
    
    return updatedCount;
  };

  const fetchOrders = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const response = await adminOrdersAPI.getAllOrders();
      
      if (response.success === true && response.data?.orders) {
        const ordersArray = response.data.orders;
        
        // Check and update orders that should move to "In Display"
        const updatedCount = await checkDisplayDates(ordersArray);
        
        if (updatedCount > 0) {
          // Re-fetch orders to get updated statuses
          const updatedResponse = await adminOrdersAPI.getAllOrders();
          if (updatedResponse.success === true && updatedResponse.data?.orders) {
            const updatedOrdersArray = updatedResponse.data.orders;
            setAllOrders(updatedOrdersArray);
          } else {
            setAllOrders(ordersArray);
          }
        } else {
          setAllOrders(ordersArray);
        }
        
        setCurrentPage(1); // Reset to first page
        
        if (isRefresh) {
          const message = updatedCount > 0 
            ? `Refreshed! ${ordersArray.length} orders loaded. ${updatedCount} orders moved to "In Display".`
            : `Refreshed! ${ordersArray.length} orders loaded`;
          showToast(message, 'success');
        }
      } else {
        setAllOrders([]);
        showToast('No orders found', 'info');
      }
    } catch (error) {
      setAllOrders([]);
      showToast('Network error. Please check your connection.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter and paginate orders
  const getFilteredOrders = () => {
    let filtered = [...allOrders];

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(order => {
        const orderId = order.id?.toString().toLowerCase() || '';
        const orderUid = order.order_uid?.toLowerCase() || '';
        const userEmail = order.profiles?.email?.toLowerCase() || '';
        const userName = order.profiles?.full_name?.toLowerCase() || '';
        const location = order.locations?.name?.toLowerCase() || '';
        
        return orderId.includes(searchLower) || 
               orderUid.includes(searchLower) ||
               userEmail.includes(searchLower) ||
               userName.includes(searchLower) ||
               location.includes(searchLower);
      });
    }

    return filtered;
  };

  const filteredOrders = getFilteredOrders();
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm]);

  // Calculate analytics from ALL orders
  const analytics = {
    total: allOrders.length,
    pendingApproval: allOrders.filter(o => o.status === ORDER_STATUS.PENDING_APPROVAL).length,
    inDisplay: allOrders.filter(o => o.status === ORDER_STATUS.IN_DISPLAY).length,
    completed: allOrders.filter(o => o.status === ORDER_STATUS.COMPLETED).length,
    needsRevision: allOrders.filter(o => o.status === ORDER_STATUS.DESIGN_REVISE).length,
    totalRevenue: allOrders
      .filter(o => [ORDER_STATUS.IN_DISPLAY, ORDER_STATUS.COMPLETED, ORDER_STATUS.DESIGN_REVISE].includes(o.status))
      .reduce((sum, o) => sum + (o.final_amount || o.total_cost || o.totalAmount || 0), 0)
  };

  // All possible statuses
  const allStatuses = ['All', ...ALL_ORDER_STATUSES];

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setUploadPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle order update
  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;

    setUploading(true);
    try {
      let adDisplayPath = '';

      // Upload file if selected
      if (uploadFile) {
        showToast('Uploading admin preview...', 'info');
        
        const fileName = `admin-preview-${selectedOrder.id}-${Date.now()}.${uploadFile.name.split('.').pop()}`;
        
        // Get signed URL
        const urlResponse = await adminOrdersAPI.getUploadUrl(
          selectedOrder.id,
          fileName,
          uploadFile.type
        );

        if (urlResponse.success && urlResponse.data) {
          // Response structure: { success: true, data: { signedUrl, path }, message }
          const signedUrl = urlResponse.data.signedUrl;
          adDisplayPath = urlResponse.data.path;
          

          // Upload file
          const uploadResponse = await adminOrdersAPI.uploadImage(signedUrl, uploadFile);
          
          if (!uploadResponse.success) {
            throw new Error('Failed to upload file');
          }
          
          showToast('Admin preview uploaded successfully!', 'success');
        } else {
          throw new Error(urlResponse.error || 'Failed to get upload URL');
        }
      }

      // Update order
      const updateData = {
        status: updateStatus || selectedOrder.status,
        remarks: remarks || selectedOrder.remarks || '',
        ...(adDisplayPath && { adDisplayPath })
      };

      const response = await adminOrdersAPI.updateOrder(selectedOrder.id, updateData);
      
      if (response.success) {
        showToast('Order updated successfully!', 'success');
        setShowUpdateModal(false);
        setSelectedOrder(null);
        setUpdateStatus('');
        setRemarks('');
        setUploadFile(null);
        setUploadPreview(null);
        // Refresh orders to show updated data
        await fetchOrders(true);
      } else {
        showToast(response.error || response.message || 'Failed to update order', 'error');
      }
    } catch (error) {
      showToast(error.message || 'Error updating order', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Open update modal
  const openUpdateModal = (order) => {
    setSelectedOrder(order);
    setUpdateStatus(order.status);
    setRemarks(order.remarks || '');
    setUploadFile(null);
    setUploadPreview(null);
    setShowUpdateModal(true);
  };

  if (loading) {
    return (
      <div className={styles.adminOrders}>
        <div className={styles.container}>
          <div className={styles.loading}>
            <LoadingSpinner size="large" />
            <p>Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminOrders}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1>📋 Orders Management</h1>
            <p className={styles.headerSubtext}>Manage and track all customer orders</p>
          </div>
          <button 
            onClick={() => fetchOrders(true)} 
            disabled={refreshing}
            className={styles.refreshBtn}
          >
            {refreshing ? (
              <>
                <LoadingSpinner size="small" />
                Refreshing...
              </>
            ) : (
              <>
                🔄 Refresh
              </>
            )}
          </button>
        </div>

        {/* Analytics */}
        <div className={styles.analytics}>
          <div className={styles.analyticsCard}>
            <div className={styles.analyticsIcon}>📊</div>
            <div className={styles.analyticsContent}>
              <p className={styles.analyticsLabel}>Total Orders</p>
              <p className={styles.analyticsValue}>{analytics.total}</p>
            </div>
          </div>
          <div className={styles.analyticsCard}>
            <div className={styles.analyticsIcon}>⏳</div>
            <div className={styles.analyticsContent}>
              <p className={styles.analyticsLabel}>Pending Approval</p>
              <p className={styles.analyticsValue}>{analytics.pendingApproval}</p>
            </div>
          </div>
          <div className={styles.analyticsCard}>
            <div className={styles.analyticsIcon}>🟢</div>
            <div className={styles.analyticsContent}>
              <p className={styles.analyticsLabel}>In Display</p>
              <p className={styles.analyticsValue}>{analytics.inDisplay}</p>
            </div>
          </div>
          <div className={styles.analyticsCard}>
            <div className={styles.analyticsIcon}>✅</div>
            <div className={styles.analyticsContent}>
              <p className={styles.analyticsLabel}>Completed</p>
              <p className={styles.analyticsValue}>{analytics.completed}</p>
            </div>
          </div>
          <div className={styles.analyticsCard}>
            <div className={styles.analyticsIcon}>📝</div>
            <div className={styles.analyticsContent}>
              <p className={styles.analyticsLabel}>Needs Revision</p>
              <p className={styles.analyticsValue}>{analytics.needsRevision}</p>
            </div>
          </div>
          <div className={styles.analyticsCard}>
            <div className={styles.analyticsIcon}>₹</div>
            <div className={styles.analyticsContent}>
              <p className={styles.analyticsLabel}>Total Revenue</p>
              <p className={styles.analyticsValue}>{(analytics.totalRevenue || 0).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className={styles.searchAndFilter}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search by Order ID Email Name or Location"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className={styles.clearBtn}>
                ✕
              </button>
            )}
          </div>

          <div className={styles.filterContainer}>
            <label>Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              {allStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
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

        {/* Orders List */}
        {currentOrders.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No orders found</p>
          </div>
        ) : (
          <div className={styles.ordersGrid}>
            {currentOrders.map(order => (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div>
                    <h3>Order #{order.order_uid || order.id}</h3>
                    <p className={styles.orderDate}>
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <span className={`${styles.status} ${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className={styles.orderDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>👤 Customer:</span>
                    <span className={styles.value}>{order.profiles?.full_name || 'N/A'}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>📧 Email:</span>
                    <span className={styles.value}>{order.profiles?.email || 'N/A'}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>📍 Location:</span>
                    <span className={styles.value}>{order.locations?.name || 'N/A'}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>📋 Plan:</span>
                    <span className={styles.value}>{order.plans?.name || 'N/A'}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>📅 Start Date:</span>
                    <span className={styles.value}>{order.start_date || 'N/A'}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>📅 End Date:</span>
                    <span className={styles.value}>{order.end_date || 'N/A'}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>₹ Total Cost:</span>
                    <span className={styles.valueAmount}>₹{(order.total_cost || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>💳 Final Amount:</span>
                    <span className={styles.valueAmount}>₹{(order.final_amount || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>💳 Payment ID:</span>
                    <span className={styles.value}>{order.razorpay_payment_id || 'N/A'}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>🏠 Delivery Address:</span>
                    <span className={styles.value}>
                      {order.delivery_address ? 
                        (typeof order.delivery_address === 'string' ? 
                          JSON.parse(order.delivery_address) : 
                          order.delivery_address
                        )?.street + ', ' + 
                        (typeof order.delivery_address === 'string' ? 
                          JSON.parse(order.delivery_address) : 
                          order.delivery_address
                        )?.city + ', ' + 
                        (typeof order.delivery_address === 'string' ? 
                          JSON.parse(order.delivery_address) : 
                          order.delivery_address
                        )?.state + ' - ' + 
                        (typeof order.delivery_address === 'string' ? 
                          JSON.parse(order.delivery_address) : 
                          order.delivery_address
                        )?.zip : 'N/A'
                      }
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>🏢 GST Info:</span>
                    <span className={styles.value}>{order.gst_info || 'N/A'}</span>
                  </div>
                  {order.coupon_code && (
                    <div className={styles.detailRow}>
                      <span className={styles.label}>🎟️ Coupon:</span>
                      <span className={styles.value}>{order.coupon_code}</span>
                    </div>
                  )}
                  {order.remarks && (
                    <div className={styles.detailRow}>
                      <span className={styles.label}>💬 Remarks:</span>
                      <span className={styles.value}>{order.remarks}</span>
                    </div>
                  )}
                  {order.creative_image_url && (
                    <div className={styles.detailRow}>
                      <span className={styles.label}>🎨 Creative:</span>
                      <span className={styles.value}>
                        <a href={order.creative_image_url} target="_blank" rel="noopener noreferrer" className={styles.creativeLink}>
                          View Creative
                        </a>
                      </span>
                    </div>
                  )}
                </div>

                <div className={styles.orderActions}>
                  <button
                    onClick={() => openUpdateModal(order)}
                    className={styles.updateBtn}
                  >
                    ✏️ Update Order
                  </button>
                  {order.creative_image_url && (
                    <a
                      href={order.creative_image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.viewBtn}
                    >
                      👁️ View Creative
                    </a>
                  )}
                  {order.ad_display_url && (
                    <a
                      href={order.ad_display_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.viewBtn}
                    >
                      🖼️ View Admin Preview
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

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

        {/* Update Modal */}
        {showUpdateModal && selectedOrder && (
          <div className={styles.modalOverlay} onClick={() => setShowUpdateModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Update Order #{selectedOrder.order_uid || selectedOrder.id}</h2>
                <button onClick={() => setShowUpdateModal(false)} className={styles.closeBtn}>
                  ✕
                </button>
              </div>

              <div className={styles.modalContent}>
                {/* Status */}
                <div className={styles.formGroup}>
                  <label>Status</label>
                  <select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    className={styles.select}
                  >
                    <option value="Design Revise">Design Revise</option>
                    <option value="Pending Display Approval">Pending Display Approval</option>
                    <option value="Cancelled - Refunded">Cancelled - Refunded</option>
                  </select>
                </div>

                {/* Remarks */}
                <div className={styles.formGroup}>
                  <label>Admin Remarks</label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add remarks for the customer..."
                    className={styles.textarea}
                    rows="4"
                  />
                </div>

                {/* Upload Preview Image */}
                <div className={styles.formGroup}>
                  <label>Upload Admin Preview (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className={styles.fileInput}
                    id="admin-upload"
                  />
                  <label htmlFor="admin-upload" className={styles.fileLabel}>
                    📁 Choose Image
                  </label>
                  {uploadPreview && (
                    <div className={styles.preview}>
                      <img src={uploadPreview} alt="Preview" className={styles.previewImg} />
                      <p className={styles.fileName}>{uploadFile.name}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateOrder}
                  disabled={uploading}
                  className={styles.saveBtn}
                >
                  {uploading ? 'Updating...' : '✓ Update Order'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
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

