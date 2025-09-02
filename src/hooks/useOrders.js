import { useState, useEffect } from 'react';
import { mockOrders, mockScreens } from '../data/mockData';
import { generateOrderId, manageStorageQuota } from '../utils/validation';
import { ordersAPI } from '../config/api';

export const useOrders = (userId) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load orders from localStorage on mount
  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem('adscreenhub_orders');
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      } else {
        // Initialize with mock orders for the user
        const userOrders = mockOrders.filter(order => order.userId === userId);
        setOrders(userOrders);
        
        try {
          localStorage.setItem('adscreenhub_orders', JSON.stringify(userOrders));
        } catch (error) {
          if (error.name === 'QuotaExceededError') {
            manageStorageQuota();
            localStorage.setItem('adscreenhub_orders', JSON.stringify(userOrders));
          }
        }
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      // Fallback to empty orders
      setOrders([]);
    }
    setLoading(false);
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

  return {
    orders,
    loading,
    createOrder,
    updateOrderStatus,
    cancelOrder,
    reviseOrder,
    getOrderById,
    getOrdersByStatus,
    isScreenBooked, // Keep for backward compatibility
    hasAvailableInventory,
    getAvailableInventory,
    getBookedScreensForDate,
    syncPendingOrders
  };
};
