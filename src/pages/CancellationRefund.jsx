import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/CancellationRefund.module.css';

export default function CancellationRefund() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    // Go back to the previous page
    navigate(-1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={handleGoBack} className={styles.backButton}>
          ← Back
        </button>
        <h1 className={styles.title}>Cancellation and Refund Policy</h1>
        <p className={styles.subtitle}>Transparent and fair advertising process for all clients</p>
      </div>
      
      <div className={styles.scrollableContent}>
        <section className={styles.section}>
          <h2>Advertisement Review and Rejection</h2>
          <p>
            All advertisements submitted to AdScreenHub undergo a review process to ensure compliance to guidelines. 
            Ad approval helps guarantee that your advertisement aligns with local laws, governmental regulations 
            and community standards. Certain locations have specific restrictions—for example, ads on specific 
            days are restricted by governmental regulations. This review process ensures your ad is appropriate 
            and eligible for display.
          </p>
          <p>If your ad does not meet the required standards:</p>
          <ul>
            <li>You will receive a notification outlining the issues.</li>
            <li>You may revise your ad to correct the specified issues (e.g., image, text, or formatting adjustments).</li>
            <li>
              Revised ads must be resubmitted at least 12 hours before the scheduled display start date of the 
              relevant ad slot for re-review. It is your responsibility to ensure compliance with all advertisement 
              guidelines during order placements. In case less than 12 hours remain before the display start date 
              and the ad creative is not submitted, the ad slot will be forfeited, and you will remain liable for 
              the full charges without refund or credit.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Resubmission and Compliance</h2>
          <p>
            Once a revised advertisement is received, AdScreenHub will conduct a new review to verify compliance 
            with all applicable guidelines. Only compliant advertisements will be displayed.
          </p>
          <p>If you do not resubmit the corrected advertisement within the required timeframe:</p>
          <ul>
            <li>Your ad slot will be forfeited.</li>
            <li>You will not be entitled to any refund, credit, or compensation.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>No Cancellation Policy</h2>
          <p>
            Owing to the upfront nature of procurement and allocation costs, once an order is placed, no 
            cancellations are permitted for any reason. All advertisement bookings and orders are final and 
            non-refundable, regardless of whether the ad has been reviewed, approved, or displayed.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Refunds and Credits</h2>
          <p>Refunds or credits will only be issued as an exception if:</p>
          <ul>
            <li>An error on AdScreenHub's part prevents your approved advertisement from being displayed during its scheduled time slot.</li>
            <li>Technical or system failures occur that are directly attributable to AdScreenHub.</li>
          </ul>
          <p>
            All other circumstances, including non-compliance or late resubmissions, are not eligible for 
            cancellations, refunds or credits.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Still Have Questions?</h2>
          <p>
            For questions regarding cancellations, refunds, or ad revisions, please feel free to contact us at{' '}
            <a href="mailto:info@adscreenhub.com" className={styles.emailLink}>
              info@adscreenhub.com
            </a>
          </p>
          <p className={styles.lastUpdated}>
            Last updated: October 2025
          </p>
        </section>
      </div>
    </div>
  );
}
