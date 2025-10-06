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
      // Try to get the most recent order from localStorage
      const localOrders = JSON.parse(localStorage.getItem('adscreenhub_orders') || '[]');
      if (localOrders.length > 0) {
        // Get the most recent order
        const mostRecentOrder = localOrders.sort((a, b) => 
          new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0)
        )[0];
        
        // Transform to match expected format
        const transformedOrder = {
          id: mostRecentOrder.id,
          orderId: mostRecentOrder.id,
          orderUid: mostRecentOrder.orderUid || mostRecentOrder.order_uid,
          location: {
            name: mostRecentOrder.locations?.name || mostRecentOrder.location?.name || mostRecentOrder.screenName || 'N/A'
          },
          plan: {
            name: mostRecentOrder.plans?.name || mostRecentOrder.plan?.name || 'N/A',
            duration: mostRecentOrder.plans?.duration_days || mostRecentOrder.plan?.duration_days || 'N/A'
          },
          startDate: mostRecentOrder.start_date || mostRecentOrder.startDate || mostRecentOrder.displayDate,
          totalAmount: mostRecentOrder.total_cost || mostRecentOrder.final_amount || mostRecentOrder.totalAmount || mostRecentOrder.amount,
          status: mostRecentOrder.status,
          createdAt: mostRecentOrder.created_at || mostRecentOrder.createdAt
        };
        
        setOrder(transformedOrder);
        setLoading(false);
      } else {
        setError('No order ID provided');
        setLoading(false);
      }
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    
    try {
      console.log('🔍 Fetching order details for orderId:', orderId);
      const response = await ordersAPI.getOrders();
      console.log('📦 BookingSuccess - API response:', response);
      
      if (response.success || response.statusCode === 200) {
        // Handle different response structures
        let ordersData = [];
        
        // Try different possible structures
        if (Array.isArray(response.data)) {
          ordersData = response.data;
          console.log('✅ Found orders in response.data (array)');
        } else if (response.data?.data?.orders && Array.isArray(response.data.data.orders)) {
          ordersData = response.data.data.orders;
          console.log('✅ Found orders in response.data.data.orders');
        } else if (response.data?.orders && Array.isArray(response.data.orders)) {
          ordersData = response.data.orders;
          console.log('✅ Found orders in response.data.orders');
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          ordersData = response.data.data;
          console.log('✅ Found orders in response.data.data (array)');
        }
        
        console.log(`📊 Total orders found: ${ordersData.length}`);
        console.log(`🔎 Looking for order with ID: ${orderId}`);
        
        const foundOrder = ordersData.find(o => o.id.toString() === orderId.toString());
        console.log('🎯 Found order:', foundOrder);
        
        if (foundOrder) {
          // Transform backend order data to frontend format
          const transformedOrder = {
            id: foundOrder.id,
            orderId: foundOrder.id,
            orderUid: foundOrder.order_uid,
            location: {
              name: foundOrder.locations?.name || foundOrder.location?.name || 'N/A'
            },
            plan: {
              name: foundOrder.plans?.name || foundOrder.plan?.name || 'N/A',
              duration: foundOrder.plans?.duration_days || foundOrder.plan?.duration_days || 1
            },
            startDate: foundOrder.start_date || foundOrder.startDate,
            totalAmount: foundOrder.total_cost || foundOrder.final_amount || foundOrder.totalAmount,
            status: foundOrder.status || 'Pending Approval',
            createdAt: foundOrder.created_at || foundOrder.createdAt
          };
          
          console.log('✅ Transformed order:', transformedOrder);
          setOrder(transformedOrder);
          setError('');
          setLoading(false);
        } else {
          // Check localStorage as fallback
          console.log('⚠️ Order not found in API, checking localStorage...');
          const localOrders = JSON.parse(localStorage.getItem('adscreenhub_orders') || '[]');
          console.log(`📂 LocalStorage orders count: ${localOrders.length}`);
          const localOrder = localOrders.find(o => o.id.toString() === orderId.toString());
          
          if (localOrder) {
            console.log('✅ Found order in localStorage:', localOrder);
            
            // Transform localStorage order
            const transformedOrder = {
              id: localOrder.id,
              orderId: localOrder.id,
              orderUid: localOrder.orderUid || localOrder.order_uid,
              location: {
                name: localOrder.locations?.name || localOrder.location?.name || localOrder.locationName || localOrder.screenName || 'N/A'
              },
              plan: {
                name: localOrder.plans?.name || localOrder.plan?.name || localOrder.planName || 'N/A',
                duration: localOrder.plans?.duration_days || localOrder.plan?.duration_days || localOrder.planDuration || localOrder.duration_days || 1
              },
              startDate: localOrder.start_date || localOrder.startDate || localOrder.displayDate,
              totalAmount: localOrder.total_cost || localOrder.final_amount || localOrder.totalAmount || localOrder.amount,
              status: localOrder.status || 'Pending Approval',
              createdAt: localOrder.created_at || localOrder.createdAt
            };
            
            setOrder(transformedOrder);
            setError('');
            setLoading(false);
          } else {
            // Show success even if order details not found - payment was successful!
            console.log('⚠️ Order not found anywhere, but payment was verified');
            const paymentId = searchParams.get('payment_id');
            const verified = searchParams.get('verified');
            
            if (verified === 'true' && paymentId) {
              // Payment was successful, just show basic success
              setOrder({
                id: orderId,
                orderId: orderId,
                orderUid: `ORD-${orderId}`,
                location: { name: 'Processing...' },
                plan: { name: 'Processing...', duration: '...' },
                startDate: 'Processing...',
                totalAmount: 0,
                status: 'Pending Approval',
                createdAt: new Date().toISOString()
              });
              setLoading(false);
            } else {
              setError('Order not found');
              setLoading(false);
            }
          }
        }
      } else {
        console.log('❌ API response not successful:', response);
        setError(response.error || 'Failed to fetch order details');
        setLoading(false);
      }
    } catch (err) {
      console.error('❌ Error fetching order:', err);
      setError('Network error. Please try again.');
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
        
        <h1>🎉 Payment Successful!</h1>
        <p className={styles.successMessage}>
          Your payment has been processed successfully. Your ad campaign is now pending approval and will be reviewed within 24 hours.
        </p>

        {order && (
          <div className={styles.orderDetails}>
            <h2>Order Details</h2>
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.label}>Order ID:</span>
                <span className={styles.value}>#{order.orderUid || order.order_uid || `ORD-${order.id}`}</span>
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
                <span className={styles.value}>{order.plan?.duration || order.duration_days || order.planDuration || 'N/A'} day{(order.plan?.duration || order.duration_days || order.planDuration || 1) > 1 ? 's' : ''}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Total Amount:</span>
                <span className={styles.value}>
                  {order.totalAmount > 0 ? `₹${order.totalAmount.toLocaleString('en-IN')}` : 'Processing...'}
                </span>
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
