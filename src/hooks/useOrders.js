import { useState, useEffect } from 'react';
import { generateOrderId, manageStorageQuota } from '../utils/validation';
import { ordersAPI } from '../config/api';
import { useAuth } from '../contexts/AuthContext';

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

    return [];
  }
  
  // Transform the API data to match our frontend format
  return ordersArray.map(order => ({
    id: order.id,
    userId: order.user_id,
    locationId: order.location_id,
    planId: order.plan_id,
    startDate: order.start_date,
    start_date: order.start_date, // Keep original for compatibility
    endDate: order.end_date,
    end_date: order.end_date, // Keep original for compatibility
    displayDate: order.start_date, // For backward compatibility
    totalAmount: order.total_cost || order.final_amount,
    total_cost: order.total_cost, // Keep original for compatibility
    final_amount: order.final_amount, // Keep original for compatibility
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
    created_at: order.created_at, // Keep original for compatibility
    orderDate: order.created_at, // For backward compatibility
    updatedAt: order.updated_at,
    updated_at: order.updated_at, // Keep original for compatibility
    deliveryAddress: order.delivery_address ? (typeof order.delivery_address === 'string' ? JSON.parse(order.delivery_address) : order.delivery_address) : null,
    gstInfo: order.gst_info,
    gst_info: order.gst_info, // Keep original for compatibility
    couponCode: order.coupon_code,
    orderUid: order.order_uid,
    order_uid: order.order_uid, // Keep original for compatibility
    
    // NEW: Keep original nested objects from API
    plans: order.plans, // Full plans object
    locations: order.locations, // Full locations object
    creatives: order.creatives, // Full creatives array
    
    // NEW: Image URLs and remarks
    creative_image_url: order.creative_image_url,
    ad_desplay_url: order.ad_desplay_url,
    remarks: order.remarks,
    
    // Plan information (for backward compatibility)
    planName: order.plans?.name || 'Unknown Plan',
    planDescription: order.plans?.description || '',
    planDuration: order.plans?.duration_days || 1,
    planFeatures: order.plans?.features?.features || [],
    planSlots: order.plans?.features?.slots || 0,
    planDurationSec: order.plans?.features?.duration_sec || 10,
    
    // Location information
    locationName: order.locations?.name || `Location ${order.location_id}`,
    location: order.locations?.name || `Location ${order.location_id}`, // For backward compatibility
    
    // Payment verification status
    paymentVerified: !!order.razorpay_payment_id,
    paymentId: order.razorpay_payment_id
  }));
};

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load orders from API and localStorage
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        
        // Try to fetch orders from API first
        let ordersData = [];
        let apiSuccess = false;
        
        // Only fetch orders if user is authenticated
        if (!user || !user.id) {
          setOrders([]);
          setLoading(false);
          return;
        }
        
        // Use main endpoint only (the one that works: /orders)
        try {
          const response = await ordersAPI.getOrders();
          
          if (response.success && response.data) {
            const allOrders = processOrdersData(response.data);
            // Filter orders by current user
            ordersData = allOrders.filter(order => order.userId === user.id);
            if (ordersData.length > 0) {
              apiSuccess = true;
              setOrders(ordersData);
              localStorage.setItem('adscreenhub_orders', JSON.stringify(ordersData));
              return;
            }
          }
        } catch (apiError) {

        }
        
        // Fallback to localStorage
        const savedOrders = localStorage.getItem('adscreenhub_orders');
        if (savedOrders) {
          const parsedOrders = JSON.parse(savedOrders);
          const safeOrders = Array.isArray(parsedOrders) ? parsedOrders : [];
          // Filter stored orders by current user as well
          const userOrders = safeOrders.filter(order => order.userId === user.id);
          setOrders(userOrders);
        } else {
          // Initialize with empty orders
          setOrders([]);
        }
      } catch (error) {

        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user]);

  // Calculate available inventory for a specific screen and date
  const getAvailableInventory = (screenId, date) => {
    // This should be handled by backend API
    // Keeping function for backward compatibility
    return 0;
  };

  // Check if screen has available inventory for a specific date
  const hasAvailableInventory = (screenId, date) => {
    // This should be handled by backend API
    // Keeping function for backward compatibility
    return true;
  };

  // Create new order - Call API to initiate order
  const createOrder = async (orderData) => {
    try {
      // Get current user ID
      const userId = user?.id || user?.userId || 'unknown';
      
      // Prepare the API payload according to your exact API requirements
      const apiPayload = {
        planId: (orderData.planId || orderData.plan?.id || '').toString(),
        locationId: (orderData.locationId || orderData.screenId || '').toString(),
        startDate: orderData.startDate || orderData.displayDate || '',
        price: orderData.totalAmount || orderData.price || 0,
        creativeFilePath: orderData.creativeFilePath || orderData.designFile || '',
        creativeFileName: orderData.creativeFileName || orderData.designFile || '',
        deliveryAddress: {
          street: orderData.address || orderData.deliveryAddress?.street || '',
          city: orderData.city || orderData.deliveryAddress?.city || '',
          state: orderData.state || orderData.deliveryAddress?.state || '',
          zip: orderData.zip || orderData.deliveryAddress?.zip || ''
        },
        gstInfo: orderData.gstInfo || orderData.gstNumber || ''
      };






      // Call the API to initiate the order
      // NOTE: Inventory should NOT be decreased here - only after successful payment verification
      console.log('🔍 Creating order with payload:', apiPayload);
      const response = await ordersAPI.initiateOrder(apiPayload);
      console.log('🔍 API response:', response);
      
      if (response.success && response.data) {

        
        // Extract order data from nested structure
        const orderData_from_api = response.data.data?.order || response.data.order || response.data;
        const razorpayOrderData = response.data.data?.razorpayOrder || response.data.razorpayOrder;
        
        console.log('🔍 Extracted order data:', orderData_from_api);
        console.log('🔍 Razorpay order data:', razorpayOrderData);
        


        
        // Create local order object with API response
        // IMPORTANT: Use the API's order ID, not a generated one
        const apiOrderId = orderData_from_api.id || orderData_from_api.orderId || response.data.id;
        const newOrder = {
          id: apiOrderId || generateOrderId(),
          userId: userId,
          orderDate: new Date().toISOString().split('T')[0],
          status: 'Payment Pending',
          screenName: orderData.screenName || 'Unknown Screen',
          location: orderData.location || 'Unknown Location',
          adminProofImage: null,
          ...orderData,
          // API response data - EXTRACT FROM CORRECT LOCATION
          razorpayOrderId: orderData_from_api.razorpay_order_id || razorpayOrderData?.id,
          razorpay_order_id: orderData_from_api.razorpay_order_id || razorpayOrderData?.id,
          totalAmount: orderData_from_api.total_cost || orderData_from_api.final_amount || orderData.totalAmount,
          amount: orderData_from_api.total_cost || orderData_from_api.final_amount || orderData.totalAmount,
          price: orderData_from_api.total_cost || orderData_from_api.final_amount || orderData.totalAmount,
          orderUid: orderData_from_api.order_uid || orderData_from_api.orderUid,
          order_uid: orderData_from_api.order_uid || orderData_from_api.orderUid,
          createdAt: new Date().toISOString(),
          apiSyncPending: false,
          // Store full API response for reference
          apiResponse: response.data
        };
        



        // Update local state
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

            return { success: false, error: 'Failed to save order. Please try again.' };
          }
        }

        console.log('✅ Order created successfully:', newOrder);
        return { success: true, order: newOrder, apiResponse: response.data };
      } else {
        console.log('❌ API response not successful:', response);
        
        // Create a local order as fallback when API fails

        const fallbackOrderId = generateOrderId();
        const fallbackOrder = {
          id: fallbackOrderId,
          userId: userId,
          orderDate: new Date().toISOString().split('T')[0],
          status: 'Payment Pending',
          orderUid: fallbackOrderId,
          order_uid: fallbackOrderId,
          screenName: orderData.screenName || 'Unknown Screen',
          location: orderData.location || 'Unknown Location',
          adminProofImage: null,
          ...orderData,
          // Use original data for fallback
          totalAmount: orderData.totalAmount || orderData.price || 0,
          amount: orderData.totalAmount || orderData.price || 0,
          price: orderData.totalAmount || orderData.price || 0,
          createdAt: new Date().toISOString(),
          apiSyncPending: true, // Mark for later sync
          apiError: response.error || 'API call failed'
        };

        // Update local state
        const updatedOrders = [...orders, fallbackOrder];
        setOrders(updatedOrders);
        
        try {
          localStorage.setItem('adscreenhub_orders', JSON.stringify(updatedOrders));
        } catch (error) {

        }

        return { success: true, order: fallbackOrder, apiResponse: null, isFallback: true };
      }
    } catch (error) {

      
      // Create a local order as fallback when there's an error

      const fallbackOrderId = generateOrderId();
      const fallbackOrder = {
        id: fallbackOrderId,
        userId: userId,
        orderDate: new Date().toISOString().split('T')[0],
        status: 'Payment Pending',
        orderUid: fallbackOrderId,
        order_uid: fallbackOrderId,
        screenName: orderData.screenName || 'Unknown Screen',
        location: orderData.location || 'Unknown Location',
        adminProofImage: null,
        ...orderData,
        // Use original data for fallback
        totalAmount: orderData.totalAmount || orderData.price || 0,
        amount: orderData.totalAmount || orderData.price || 0,
        price: orderData.totalAmount || orderData.price || 0,
        createdAt: new Date().toISOString(),
        apiSyncPending: true, // Mark for later sync
        apiError: error.message || 'Network error'
      };

      // Update local state
      const updatedOrders = [...orders, fallbackOrder];
      setOrders(updatedOrders);
      
      try {
        localStorage.setItem('adscreenhub_orders', JSON.stringify(updatedOrders));
      } catch (storageError) {

      }

      return { success: true, order: fallbackOrder, apiResponse: null, isFallback: true };
    }
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
    // This should be handled by backend API
    // Keeping function for backward compatibility
    return [];
  };

  // Verify payment for an order
  const verifyPayment = async (orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
    try {
      const verificationData = {
        orderId: orderId.toString(),
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature
      };



      const response = await ordersAPI.verifyPayment(verificationData);

      
      if (response.success) {

        
        // Update order status to confirmed
        // NOTE: This is where inventory should be decreased in the backend - after successful payment
        const updatedOrders = orders.map(order => 
          order.id === orderId 
            ? { 
                ...order, 
                status: 'Payment Completed - Pending Approval', 
                paymentVerified: true, 
                paymentId: razorpayPaymentId,
                razorpayPaymentId: razorpayPaymentId,
                razorpay_payment_id: razorpayPaymentId
              }
            : order
        );
        setOrders(updatedOrders);
        localStorage.setItem('adscreenhub_orders', JSON.stringify(updatedOrders));
        return { success: true, data: response.data };
      } else {

        return { success: false, error: response.error || 'Payment verification failed' };
      }
    } catch (error) {

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
      
      // Only fetch orders if user is authenticated
      if (!user || !user.id) {
        setOrders([]);
        setLoading(false);
        return { success: false, error: 'User not authenticated' };
      }
      
      // Try main endpoint first
      try {
        const response = await ordersAPI.getOrders();

        
        if (response.success && response.data) {
          const allOrders = processOrdersData(response.data);
          // Filter orders by current user
          ordersData = allOrders.filter(order => order.userId === user.id);
          if (ordersData.length > 0) {
            apiSuccess = true;
          }
        }
      } catch (apiError) {

      }
      
      // Try alternative endpoints if main one failed
      if (!apiSuccess) {
        try {
          const response = await ordersAPI.getAllOrders();

          
          if (response.success && response.data) {
            const allOrders = processOrdersData(response.data);
            // Filter orders by current user
            ordersData = allOrders.filter(order => order.userId === user.id);
            if (ordersData.length > 0) {
              apiSuccess = true;
            }
          }
        } catch (apiError) {

        }
      }
      
      // Try user-specific endpoint if others failed
      if (!apiSuccess) {
        try {
          const response = await ordersAPI.getUserOrders();

          
          if (response.success && response.data) {
            ordersData = processOrdersData(response.data);
            if (ordersData.length > 0) {
              apiSuccess = true;
            }
          }
        } catch (apiError) {

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
