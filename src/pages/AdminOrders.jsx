import React, { useState, useEffect } from 'react';
import { adminOrdersAPI } from '../config/adminApi';
import { formatDate, formatCurrency } from '../utils/validation';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import styles from '../styles/AdminOrders.module.css';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
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
      console.log('🔄 Fetching admin orders...');
      const response = await adminOrdersAPI.getAllOrders();
      console.log('📦 Full API Response:', JSON.stringify(response, null, 2));
      console.log('📦 Response type:', typeof response);
      console.log('📦 Response.success:', response.success);
      console.log('📦 Response.data:', response.data);
      
      // Try different possible response structures
      let ordersArray = [];
      
      if (response.success === true) {
        // Check for orders in response.data.orders first (your backend structure)
        if (response.data?.orders && Array.isArray(response.data.orders)) {
          ordersArray = response.data.orders;
          console.log('✅ Found orders in response.data.orders:', ordersArray.length);
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          ordersArray = response.data.data;
          console.log('✅ Found orders in response.data.data:', ordersArray.length);
        } else if (Array.isArray(response.data)) {
          ordersArray = response.data;
          console.log('✅ Found orders in response.data:', ordersArray.length);
        }
      } else if (Array.isArray(response)) {
        // Response is directly an array
        ordersArray = response;
        console.log('✅ Response is directly an array:', ordersArray.length);
      }
      
      console.log('📊 Final orders array:', ordersArray);
      setOrders(ordersArray);
      
      if (isRefresh) {
        showToast(`✅ Refreshed! ${ordersArray.length} orders loaded`, 'success');
      } else if (ordersArray.length === 0) {
        showToast('No orders found. This might be normal if there are no orders yet.', 'info');
      }
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      console.error('❌ Error details:', error.message, error.stack);
      setOrders([]);
      showToast('Network error. Please check your connection and authentication.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter orders
  useEffect(() => {
    let filtered = orders;

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

    setFilteredOrders(filtered);
  }, [orders, statusFilter, searchTerm]);

  // Calculate analytics
  const analytics = {
    total: orders.length,
    pendingApproval: orders.filter(o => o.status === 'Pending Approval').length,
    inDisplay: orders.filter(o => o.status === 'In Display').length,
    completed: orders.filter(o => o.status === 'Completed Display').length,
    needsRevision: orders.filter(o => o.status === 'Revise Your Design').length,
    paymentFailed: orders.filter(o => o.status === 'Payment Failed').length,
    totalRevenue: orders
      .filter(o => o.status !== 'Payment Failed' && o.status !== 'Cancelled Display')
      .reduce((sum, o) => sum + (o.total_cost || 0), 0)
  };

  // Get unique statuses
  const uniqueStatuses = ['All', ...new Set(orders.map(o => o.status).filter(Boolean))];

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
        console.log('📤 Getting upload URL for:', fileName);
        const urlResponse = await adminOrdersAPI.getUploadUrl(
          selectedOrder.id,
          fileName,
          uploadFile.type
        );
        console.log('🔗 Upload URL response:', urlResponse);

        if (urlResponse.success && urlResponse.data) {
          // Response structure: { success: true, data: { signedUrl, path }, message }
          const signedUrl = urlResponse.data.signedUrl;
          adDisplayPath = urlResponse.data.path;
          
          console.log('🔗 Signed URL:', signedUrl);
          console.log('📁 Path:', adDisplayPath);

          console.log('⬆️ Uploading file to:', signedUrl);
          // Upload file
          const uploadResponse = await adminOrdersAPI.uploadImage(signedUrl, uploadFile);
          console.log('✅ Upload response:', uploadResponse);
          
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

      console.log('📝 Updating order with:', updateData);
      const response = await adminOrdersAPI.updateOrder(selectedOrder.id, updateData);
      console.log('✅ Update response:', response);
      
      if (response.success) {
        showToast('✅ Order updated successfully!', 'success');
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
      console.error('❌ Error updating order:', error);
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
              <p className={styles.analyticsValue}>₹{(analytics.totalRevenue || 0).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className={styles.searchAndFilter}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search by Order ID, Email, Name, or Location..."
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
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className={styles.resultsCount}>
          Showing {filteredOrders.length} of {orders.length} orders
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No orders found</p>
          </div>
        ) : (
          <div className={styles.ordersGrid}>
            {filteredOrders.map(order => (
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
                    <span className={styles.label}>₹ Amount:</span>
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
                    <option value="Pending Approval">Pending Approval</option>
                    <option value="In Display">In Display</option>
                    <option value="Completed Display">Completed Display</option>
                    <option value="Revise Your Design">Revise Your Design</option>
                    <option value="Cancelled Display">Cancelled Display</option>
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

