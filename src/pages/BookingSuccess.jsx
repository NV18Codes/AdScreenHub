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
      setError('No order ID provided');
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await ordersAPI.getOrders();
      if (response.success) {
        const foundOrder = response.data.find(o => o.id.toString() === orderId);
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          setError('Order not found');
        }
      } else {
        setError(response.error || 'Failed to fetch order details');
      }
    } catch (err) {
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

        <div className={styles.nextSteps}>
          <h3>What's Next?</h3>
          <ul>
            <li>Check your email for payment confirmation</li>
            <li>Your ad will be reviewed within 24 hours</li>
            <li>You'll receive SMS updates about approval status</li>
            <li>Track your ad status in the dashboard</li>
            <li>Contact support if you have any questions</li>
          </ul>
        </div>

        <div className={styles.refundPolicy}>
          <h3>Refund Policy</h3>
          <p>
            <strong>Full refund available</strong> if your ad is rejected or if you cancel within 24 hours of booking. 
            Refunds are processed within 5-7 business days to your original payment method.
          </p>
          <ul>
            <li>100% refund for rejected ads</li>
            <li>100% refund for cancellations within 24 hours</li>
            <li>50% refund for cancellations within 48 hours</li>
            <li>No refund after 48 hours or once ad goes live</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
