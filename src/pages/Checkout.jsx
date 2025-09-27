import React from 'react';
import styles from '../styles/Checkout.module.css';

export default function Checkout() {
  return (
    <div className={styles.checkout}>
      <div className={styles.container}>
        <h1>Checkout</h1>
        <p>Checkout functionality will be implemented here.</p>
        
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
}
