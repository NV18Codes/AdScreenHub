import React from 'react';
import styles from '../styles/Profile.module.css';

export default function Profile() {
  return (
    <div className={styles.profile}>
      <div className={styles.container}>
        <h1>Profile</h1>
        <p>Welcome to your profile!</p>
        <p>Profile management functionality will be implemented here.</p>
      </div>
    </div>
  );
}
