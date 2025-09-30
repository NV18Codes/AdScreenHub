import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../config/api';
import styles from '../styles/BookingSuccess.module.css';

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    } else {
      console.warn('⚠️ No order ID in URL, checking localStorage for recent order');
      // Try to get the most recent order from localStorage
      const localOrders = JSON.parse(localStorage.getItem('adscreenhub_orders') || '[]');
      if (localOrders.length > 0) {
        // Get the most recent order
        const mostRecentOrder = localOrders.sort((a, b) => 
          new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0)
        )[0];
        console.log('✅ Found recent order in localStorage:', mostRecentOrder);
        setOrder(mostRecentOrder);
        setLoading(false);
      } else {
        setError('No order ID provided');
        setLoading(false);
      }
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await ordersAPI.getOrders();
      console.log('📋 Fetching order details, response:', response);
      
      if (response.success) {
        // Handle different response structures
        let ordersData = [];
        
        console.log('📋 Raw response.data:', response.data);
        
        // Try different possible structures
        if (Array.isArray(response.data)) {
          ordersData = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          ordersData = response.data.data;
        } else if (response.data?.statusCode === 200 && response.data?.data && Array.isArray(response.data.data)) {
          ordersData = response.data.data;
        } else if (response.data?.orders && Array.isArray(response.data.orders)) {
          ordersData = response.data.orders;
        }
        
        console.log('📋 Extracted orders data:', ordersData);
        console.log('📋 Looking for order ID:', orderId, typeof orderId);
        
        if (ordersData.length > 0) {
          console.log('📋 First order ID:', ordersData[0].id, typeof ordersData[0].id);
          console.log('📋 All order IDs:', ordersData.map(o => o.id));
        }
        
        const foundOrder = ordersData.find(o => o.id.toString() === orderId.toString());
        
        if (foundOrder) {
          console.log('✅ Order found:', foundOrder);
          setOrder(foundOrder);
          setError('');
        } else {
          console.warn('⚠️ Order not found in list');
          console.log('📋 Available order IDs:', ordersData.map(o => o.id));
          
          // Check localStorage as fallback
          const localOrders = JSON.parse(localStorage.getItem('adscreenhub_orders') || '[]');
          const localOrder = localOrders.find(o => o.id.toString() === orderId.toString());
          
          if (localOrder) {
            console.log('✅ Order found in localStorage:', localOrder);
            setOrder(localOrder);
            setError('');
          } else {
            setError('Order not found');
          }
        }
      } else {
        console.error('❌ API error:', response.error);
        setError(response.error || 'Failed to fetch order details');
      }
    } catch (err) {
      console.error('❌ Network error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>❌ Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/dashboard')} className={styles.button}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.successCard}>
        <div className={styles.successIcon}>
          <div className={styles.checkmark}>
            <div className={styles.checkmarkCircle}>
              <div className={styles.checkmarkStem}></div>
              <div className={styles.checkmarkKick}></div>
            </div>
          </div>
        </div>
        
        <h1>Payment Completed</h1>
        <p className={styles.successMessage}>
          Your payment has been processed successfully. Your ad is now pending approval and will be reviewed within 24 hours.
        </p>

        {order && (
          <div className={styles.orderDetails}>
            <h2>Order Details</h2>
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.label}>Order ID:</span>
                <span className={styles.value}>#{order.id}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Location:</span>
                <span className={styles.value}>{order.location?.name || 'N/A'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Plan:</span>
                <span className={styles.value}>{order.plan?.name || 'N/A'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Start Date:</span>
                <span className={styles.value}>{order.startDate || 'N/A'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Duration:</span>
                <span className={styles.value}>{order.plan?.duration || 'N/A'} days</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Total Amount:</span>
                <span className={styles.value}>₹{order.totalAmount || order.plan?.price || 'N/A'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Status:</span>
                <span className={`${styles.value} ${styles.status}`}>
                  {order.status || 'Payment Completed - Pending Approval'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <button 
            onClick={() => navigate('/dashboard')} 
            className={styles.primaryButton}
          >
            Go to Dashboard
          </button>
          <button 
            onClick={() => navigate('/my-orders')} 
            className={styles.secondaryButton}
          >
            View All Orders
          </button>
        </div>

      </div>
    </div>
  );
};

export default BookingSuccess;
