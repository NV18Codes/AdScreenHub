import React, { useState, useEffect } from 'react';
import { adminOrdersAPI } from '../config/adminApi';
import { formatDate, formatCurrency } from '../utils/validation';
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

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  // Fetch all orders
  useEffect(() => {
    fetchOrders();
  }, []);

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
        setAllOrders(ordersArray);
        setCurrentPage(1); // Reset to first page
        
        if (isRefresh) {
          showToast(`Refreshed! ${ordersArray.length} orders loaded`, 'success');
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
    pendingApproval: allOrders.filter(o => o.status === 'Pending Approval').length,
    inDisplay: allOrders.filter(o => o.status === 'In Display').length,
    completed: allOrders.filter(o => o.status === 'Completed').length,
    needsRevision: allOrders.filter(o => o.status === 'Design Revise').length,
    paymentFailed: allOrders.filter(o => o.status === 'Payment Failed').length,
    totalRevenue: allOrders
      .filter(o => ['Pending Approval', 'In Display', 'Completed', 'Design Revise'].includes(o.status))
      .reduce((sum, o) => sum + (o.total_cost || 0), 0)
  };

  // All possible statuses
  const allStatuses = [
    'All',
    'Pending Payment',
    'Pending Approval',
    'In Display',
    'Completed',
    'Cancelled',
    'Design Revise',
    'Cancelled - Refunded'
  ];

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
              placeholder="Search by Order ID Email Name or Location..."
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
                  <span className={`${styles.status} ${styles[`status${order.status?.replace(/\s+/g, '')}`]}`}>
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
                    <span className={styles.label}>📅 Display Date:</span>
                    <span className={styles.value}>{formatDate(order.start_date)}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Amount:</span>
                    <span className={styles.valueAmount}>₹{(order.total_cost || 0).toLocaleString('en-IN')}</span>
                  </div>
                  {order.remarks && (
                    <div className={styles.detailRow}>
                      <span className={styles.label}>💬 Remarks:</span>
                      <span className={styles.value}>{order.remarks}</span>
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
                    <option value="Pending Payment">Pending Payment</option>
                    <option value="Pending Approval">Pending Approval</option>
                    <option value="In Display">In Display</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Design Revise">Design Revise</option>
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

