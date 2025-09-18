import React from 'react';
import LongerBookingCard from './LongerBookingCard';
import styles from '../styles/WhyAdScreenHub.module.css';

export default function WhyAdScreenHub() {
  return (
    <section className="px-8 py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className={styles.titleContainer}>
          <div className={styles.overlappingTitle}>
            <img 
              src="/Animation-transparent-bkgd.gif" 
              alt="AdScreenHub Animation" 
              className={styles.titleAnimation}
              onError={(e) => {
                console.error('Failed to load Animation-transparent-bkgd.gif');
                e.target.style.display = 'none';
              }}
            />
            <h2 className={styles.overlappingText}>
              Why
            </h2>
          </div>
        </div>
        
        <div className={styles.example}>
          <div className={`${styles.hexagon} ${styles.big}`}>
            <span className={styles.text}>Your Ideas<br/>Meet<br/>Our Screens</span>
          </div>
          <div className={`${styles.hexagon} ${styles.semiBig}`}>
            <span className={styles.text}>Target Crowds That Matter,<br/>At Places That Count</span>
          </div>
          <div className={`${styles.hexagon} ${styles.normal}`}>
            <span className={styles.text}>Playback Proof<br/>&<br/>Analytical Dashboards</span>
          </div>
          <div className={`${styles.hexagon} ${styles.normal}`}>
            <span className={styles.text}>Transparent Monitoring</span>
          </div>
          <div className={`${styles.hexagon} ${styles.normal}`}>
            <span className={styles.text}>Strategic Marketing</span>
          </div>
          <div className={`${styles.hexagon} ${styles.small}`}>
            <span className={styles.text}></span>
          </div>
          <div className={`${styles.hexagon} ${styles.small}`}>
            <span className={styles.text}>Precise Insights</span>
          </div>
          <div className={`${styles.hexagon} ${styles.small}`}>
            <span className={styles.text}>Smart Focus</span>
          </div>
          <div className={`${styles.hexagon} ${styles.small}`}>
            <span className={styles.text}></span>
          </div>
        </div>
        
        {/* Longer Booking Card */}
        <div className="mt-12 flex justify-center">
          <LongerBookingCard />
        </div>
      </div>
    </section>
  );
}
