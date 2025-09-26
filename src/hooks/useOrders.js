import { useState, useEffect } from 'react';
import { mockOrders, mockScreens } from '../data/mockData';
import { generateOrderId, manageStorageQuota } from '../utils/validation';
import { ordersAPI } from '../config/api';

// Helper function to process orders data from different API response structures
const processOrdersData = (data) => {
  let ordersArray = [];
  
  if (Array.isArray(data)) {
    // Direct array response
    ordersArray = data;
  } else if (data.data && Array.isArray(data.data)) {
    // Nested data structure: response.data.data
    ordersArray = data.data;
  } else if (data.orders && Array.isArray(data.orders)) {
    // Alternative nested structure: response.data.orders
    ordersArray = data.orders;
  } else {
    console.warn('Unexpected API response structure:', data);
    return [];
  }
  
  // Transform the API data to match our frontend format
  return ordersArray.map(order => ({
    id: order.id,
    userId: order.user_id,
    locationId: order.location_id,
    planId: order.plan_id,
    startDate: order.start_date,
    endDate: order.end_date,
    displayDate: order.start_date, // For backward compatibility
    totalAmount: order.total_cost || order.final_amount,
    amount: order.total_cost || order.final_amount, // For backward compatibility
    price: order.total_cost || order.final_amount, // For backward compatibility
    status: order.status,
    razorpayOrderId: order.razorpay_order_id,
    razorpay_order_id: order.razorpay_order_id, // For backward compatibility
    razorpayPaymentId: order.razorpay_payment_id,
    razorpay_payment_id: order.razorpay_payment_id, // For backward compatibility
    razorpaySignature: order.razorpay_signature,
    razorpay_signature: order.razorpay_signature, // For backward compatibility
    createdAt: order.created_at,
    orderDate: order.created_at, // For backward compatibility
    updatedAt: order.updated_at,
    deliveryAddress: order.delivery_address ? JSON.parse(order.delivery_address) : null,
    gstInfo: order.gst_info,
    couponCode: order.coupon_code,
    orderUid: order.order_uid,
    // Plan information
    planName: order.plans?.name || 'Unknown Plan',
    planDescription: order.plans?.description || '',
    planDuration: order.plans?.duration_days || 1,
    planFeatures: order.plans?.features?.features || [],
    planSlots: order.plans?.features?.slots || 0,
    planDurationSec: order.plans?.features?.duration_sec || 10,
    // Location information (we'll need to fetch this separately or include it in the API)
    locationName: `Location ${order.location_id}`, // Placeholder until we get location data
    location: `Location ${order.location_id}`, // For backward compatibility
    // Payment verification status
    paymentVerified: !!order.razorpay_payment_id,
    paymentId: order.razorpay_payment_id
  }));
};

export const useOrders = (userId) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load orders from API and localStorage
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        
        // Try to fetch orders from API first
        let ordersData = [];
        let apiSuccess = false;
        
        // Try main endpoint first
        try {
          const response = await ordersAPI.getOrders();
          console.log('🔍 Orders API Response:', response);
          
          if (response.success && response.data) {
            ordersData = processOrdersData(response.data);
            if (ordersData.length > 0) {
              apiSuccess = true;
            }
          }
        } catch (apiError) {
          console.warn('Main orders API failed, trying alternatives:', apiError);
        }
        
        // Try alternative endpoints if main one failed
        if (!apiSuccess) {
          try {
            const response = await ordersAPI.getAllOrders();
            console.log('🔍 All Orders API Response:', response);
            
            if (response.success && response.data) {
              ordersData = processOrdersData(response.data);
              if (ordersData.length > 0) {
                apiSuccess = true;
              }
            }
          } catch (apiError) {
            console.warn('All orders API failed, trying user orders:', apiError);
          }
        }
        
        // Try user-specific endpoint if others failed
        if (!apiSuccess) {
          try {
            const response = await ordersAPI.getUserOrders();
            console.log('🔍 User Orders API Response:', response);
            
            if (response.success && response.data) {
              ordersData = processOrdersData(response.data);
              if (ordersData.length > 0) {
                apiSuccess = true;
              }
            }
          } catch (apiError) {
            console.warn('User orders API failed:', apiError);
          }
        }
        
        if (apiSuccess) {
          console.log('🔍 Processed Orders Data:', ordersData);
          setOrders(ordersData);
          localStorage.setItem('adscreenhub_orders', JSON.stringify(ordersData));
          return;
        } else {
          console.warn('All orders API endpoints failed, falling back to localStorage');
        }
        
        // Fallback to localStorage
        const savedOrders = localStorage.getItem('adscreenhub_orders');
        if (savedOrders) {
          const parsedOrders = JSON.parse(savedOrders);
          const safeOrders = Array.isArray(parsedOrders) ? parsedOrders : [];
          setOrders(safeOrders);
        } else {
          // Initialize with empty orders
          setOrders([]);
        }
      } catch (error) {
        console.error('Error loading orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [userId]);

  // Calculate available inventory for a specific screen and date
  const getAvailableInventory = (screenId, date) => {
    const screen = mockScreens.find(s => s.id === screenId);
    if (!screen) return 0;

    // Count existing bookings for this screen and date
    const bookedCount = orders.filter(order => 
      order.screenId === screenId && 
      order.displayDate === date && 
      order.status !== 'Cancelled Display'
    ).length;

    // Return available inventory
    return Math.max(0, screen.totalInventory - bookedCount);
  };

  // Check if screen has available inventory for a specific date
  const hasAvailableInventory = (screenId, date) => {
    return getAvailableInventory(screenId, date) > 0;
  };

  // Create new order - For now, accept booking and save locally
  const createOrder = async (orderData) => {
    // Check if inventory is available
    if (!hasAvailableInventory(orderData.screenId, orderData.displayDate)) {
      return { success: false, error: 'No available inventory for this location and date' };
    }

    // For now, accept all bookings and save locally
    // Later we'll add API calls for real-time functionality
    const newOrder = {
      id: generateOrderId(),
      userId,
      orderDate: new Date().toISOString().split('T')[0],
      status: 'Pending Approval',
      screenName: orderData.screenName || 'Unknown Screen',
      location: orderData.location || 'Unknown Location',
      adminProofImage: null, // Will be set by admin when ad goes live
      ...orderData,
      createdAt: new Date().toISOString(),
      // Remove API sync flags for now since we're accepting locally
      apiSyncPending: false
    };

    const updatedOrders = [...orders, newOrder];
    setOrders(updatedOrders);
    
    try {
      // Check storage quota before saving
      if (!manageStorageQuota()) {
        throw new Error('Storage quota exceeded');
      }
      
      localStorage.setItem('adscreenhub_orders', JSON.stringify(updatedOrders));
    } catch (error) {
      if (error.name === 'QuotaExceededError' || error.message === 'Storage quota exceeded') {
        // Clean up and try again
        manageStorageQuota();
        localStorage.setItem('adscreenhub_orders', JSON.stringify(updatedOrders));
      } else {
        console.error('Error saving order locally:', error);
        return { success: false, error: 'Failed to save order. Please try again.' };
      }
    }

    return { success: true, order: newOrder };
  };

  // Update order status
  const updateOrderStatus = (orderId, newStatus) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    
    setOrders(updatedOrders);
    
    try {
      localStorage.setItem('adscreenhub_orders', JSON.stringify(updatedOrders));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        manageStorageQuota();
        localStorage.setItem('adscreenhub_orders', JSON.stringify(updatedOrders));
      }
    }

    return { success: true };
  };

  // Cancel order
  const cancelOrder = (orderId) => {
    return updateOrderStatus(orderId, 'Cancelled Display');
  };

  // Revise order design
  const reviseOrder = (orderId, newDesignFile, newSupportingDoc) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { 
        ...order, 
        designFile: newDesignFile,
        supportingDoc: newSupportingDoc,
        status: 'Pending Approval'
      } : order
    );
    
    setOrders(updatedOrders);
    
    try {
      localStorage.setItem('adscreenhub_orders', JSON.stringify(updatedOrders));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        manageStorageQuota();
        localStorage.setItem('adscreenhub_orders', JSON.stringify(updatedOrders));
      }
    }

    return { success: true };
  };

  // Get order by ID
  const getOrderById = (orderId) => {
    return orders.find(order => order.id === orderId);
  };

  // Get orders by status
  const getOrdersByStatus = (status) => {
    return orders.filter(order => order.status === status);
  };

  // Check if screen is already booked for a specific date (deprecated - use inventory instead)
  const isScreenBooked = (screenId, date) => {
    return !hasAvailableInventory(screenId, date);
  };

  // Get all booked screens for a specific date
  const getBookedScreensForDate = (date) => {
    return orders
      .filter(order => 
        order.displayDate === date && 
        order.status !== 'Cancelled Display'
      )
      .map(order => order.screenId);
  };

  // Verify payment for an order
  const verifyPayment = async (orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
    try {
      const verificationData = {
        orderId,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature
      };

      const response = await ordersAPI.verifyPayment(verificationData);
      
      if (response.success) {
        // Update order status to confirmed
        const updatedOrders = orders.map(order => 
          order.id === orderId 
            ? { ...order, status: 'Confirmed', paymentVerified: true, paymentId: razorpayPaymentId }
            : order
        );
        setOrders(updatedOrders);
        localStorage.setItem('adscreenhub_orders', JSON.stringify(updatedOrders));
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error || 'Payment verification failed' };
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      return { success: false, error: error.message || 'Payment verification failed' };
    }
  };

  // Sync pending orders with API when available
  const syncPendingOrders = async () => {
    const pendingOrders = orders.filter(order => order.apiSyncPending);
    
    for (const order of pendingOrders) {
      try {
        const apiOrderData = {
          userId: order.userId,
          screenId: order.screenId,
          planId: order.planId,
          displayDate: order.displayDate,
          designFile: order.designFile,
          supportingDoc: order.supportingDoc,
          totalAmount: order.totalAmount,
          thumbnail: order.thumbnail,
          address: order.address,
          gstApplicable: order.gstApplicable,
          companyName: order.companyName,
          gstNumber: order.gstNumber,
          couponCode: order.couponCode,
          screenName: order.screenName,
          location: order.location,
        };

        const result = await ordersAPI.createOrder(apiOrderData);
        
        if (result.success) {
          // Update order with API response
          const updatedOrders = orders.map(o => 
            o.id === order.id 
              ? { ...o, ...result.data, apiSyncPending: false, status: result.data.status || 'Pending Approval' }
              : o
          );
          setOrders(updatedOrders);
          localStorage.setItem('adscreenhub_orders', JSON.stringify(updatedOrders));
        }
      } catch (error) {
        console.error(`Failed to sync order ${order.id}:`, error);
        // Keep trying next time
      }
    }
  };

  // Refresh orders from API
  const refreshOrders = async () => {
    setLoading(true);
    try {
      let ordersData = [];
      let apiSuccess = false;
      
      // Try main endpoint first
      try {
        const response = await ordersAPI.getOrders();
        console.log('🔍 Refresh Orders API Response:', response);
        
        if (response.success && response.data) {
          ordersData = processOrdersData(response.data);
          if (ordersData.length > 0) {
            apiSuccess = true;
          }
        }
      } catch (apiError) {
        console.warn('Main orders API failed during refresh, trying alternatives:', apiError);
      }
      
      // Try alternative endpoints if main one failed
      if (!apiSuccess) {
        try {
          const response = await ordersAPI.getAllOrders();
          console.log('🔍 Refresh All Orders API Response:', response);
          
          if (response.success && response.data) {
            ordersData = processOrdersData(response.data);
            if (ordersData.length > 0) {
              apiSuccess = true;
            }
          }
        } catch (apiError) {
          console.warn('All orders API failed during refresh, trying user orders:', apiError);
        }
      }
      
      // Try user-specific endpoint if others failed
      if (!apiSuccess) {
        try {
          const response = await ordersAPI.getUserOrders();
          console.log('🔍 Refresh User Orders API Response:', response);
          
          if (response.success && response.data) {
            ordersData = processOrdersData(response.data);
            if (ordersData.length > 0) {
              apiSuccess = true;
            }
          }
        } catch (apiError) {
          console.warn('User orders API failed during refresh:', apiError);
        }
      }
      
      if (apiSuccess) {
        setOrders(ordersData);
        localStorage.setItem('adscreenhub_orders', JSON.stringify(ordersData));
        return { success: true, data: ordersData };
      } else {
        return { success: false, error: 'All orders API endpoints failed' };
      }
    } catch (error) {
      console.error('Error refreshing orders:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    orders,
    loading,
    createOrder,
    updateOrderStatus,
    cancelOrder,
    reviseOrder,
    verifyPayment,
    getOrderById,
    getOrdersByStatus,
    isScreenBooked, // Keep for backward compatibility
    hasAvailableInventory,
    getAvailableInventory,
    getBookedScreensForDate,
    syncPendingOrders,
    refreshOrders
  };
};
