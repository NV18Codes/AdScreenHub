import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../config/api';
import { useOrders } from '../hooks/useOrders';
import { ORDER_STATUS } from '../config/orderStatuses';
import styles from '../styles/BookingSuccess.module.css';

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { orders, loading: ordersLoading } = useOrders();

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (ordersLoading) {
      setLoading(true);
      return;
    }

    if (orderId) {
      // Find order by ID from useOrders hook
      const foundOrder = orders.find(o => o.id.toString() === orderId.toString());
      if (foundOrder) {
        console.log('Found order by ID:', foundOrder);
        setOrder(foundOrder);
        setError('');
        setLoading(false);
      } else {
        setError('Order not found');
        setLoading(false);
      }
    } else {
      // Try to get the most recent order from useOrders hook
      if (orders && orders.length > 0) {
        const mostRecentOrder = orders[orders.length - 1];
        console.log('Most recent order:', mostRecentOrder);
        setOrder(mostRecentOrder);
        setError('');
        setLoading(false);
      } else {
        setError('No order found');
        setLoading(false);
      }
    }
  }, [orderId, orders, ordersLoading]);


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
            <svg 
              className={styles.checkmarkSvg} 
              viewBox="0 0 100 100" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="50" cy="50" r="45" fill="#4CAF50" stroke="#45a049" strokeWidth="2"/>
              <path 
                d="M25 50 L40 65 L75 30" 
                stroke="white" 
                strokeWidth="6" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        
        <h1>🎉 Payment&nbsp;Successful!</h1>
        <p className={styles.successMessage}>
          Your payment has been processed successfully. Your ad campaign is now pending approval and will be reviewed within 24 hours.
        </p>

        {order && (
          <div className={styles.orderDetails}>
            <h2>Order Details</h2>
            <div className={styles.orderInfo}>
              <div className={styles.orderHeader}>
                <span className={styles.orderNumber}>Order #{order.orderUid || order.order_uid || order.id}</span>
                <span className={styles.orderDate}>
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  }) : new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              
              <div className={styles.detailItem}>
                <span className={styles.label}>📍 Location:</span>
                <span className={styles.value}>{order.location?.name || order.locationName || 'N/A'}</span>
              </div>
              
              <div className={styles.detailItem}>
                <span className={styles.label}>📋 Plan:</span>
                <span className={styles.value}>{order.plan?.name || order.planName || 'N/A'}</span>
              </div>
              
              <div className={styles.detailItem}>
                <span className={styles.label}>📅 Start Date:</span>
                <span className={styles.value}>{order.startDate || order.start_date || 'N/A'}</span>
              </div>
              
              <div className={styles.detailItem}>
                <span className={styles.label}>📅 End Date:</span>
                <span className={styles.value}>{order.endDate || order.end_date || order.startDate || order.start_date || 'N/A'}</span>
              </div>
              
              <div className={styles.detailItem}>
                <span className={styles.label}>₹ Total Cost:</span>
                <span className={styles.value}>
                  ₹{(order.total_cost || order.baseAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              
              <div className={styles.detailItem}>
                <span className={styles.label}>GST (18%):</span>
                <span className={styles.value}>
                  ₹{(order.gstAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              
              <div className={styles.detailItem}>
                <span className={styles.label}>💳 Final Amount:</span>
                <span className={styles.value}>
                  ₹{((order.total_cost || 0) + (order.gstAmount || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
