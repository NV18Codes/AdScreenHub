import React from 'react';
import StandardPageLayout from '../components/StandardPageLayout';
import styles from '../styles/StandardPageLayout.module.css';

export default function Privacy() {
  return (
    <StandardPageLayout
      title="Privacy Policy"
      subtitle="How we collect, use, and protect your information"
    >
        <section className={styles.section}>
          <h2>Information We Collect</h2>
          <p>
            At AdScreenHub, we collect information to provide better services to our users. This includes:
          </p>
          <ul>
            <li>Personal information you provide (name, email, phone number)</li>
            <li>Payment information for processing transactions</li>
            <li>Account credentials and preferences</li>
            <li>Advertisement content and campaign data</li>
            <li>Usage data and analytics</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide and maintain our advertising services</li>
            <li>Process payments and manage your account</li>
            <li>Review and approve advertisement content</li>
            <li>Communicate with you about your campaigns</li>
            <li>Improve our platform and services</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Information Sharing</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
          </p>
          <ul>
            <li>With service providers who assist in our operations</li>
            <li>When required by law or legal process</li>
            <li>To protect our rights and prevent fraud</li>
            <li>With your explicit consent</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:
          </p>
          <ul>
            <li>Encryption of sensitive data</li>
            <li>Secure payment processing</li>
            <li>Regular security assessments</li>
            <li>Limited access controls</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Cookies and Tracking</h2>
          <p>
            Our website uses cookies and similar technologies to enhance your experience. These help us:
          </p>
          <ul>
            <li>Remember your preferences and login status</li>
            <li>Analyze website usage and performance</li>
            <li>Provide personalized content</li>
            <li>Improve our services</li>
          </ul>
          <p>You can control cookie settings through your browser preferences.</p>
        </section>

        <section className={styles.section}>
          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of marketing communications</li>
            <li>Data portability</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Data Retention</h2>
          <p>
            We retain your personal information for as long as necessary to provide our services and comply with legal obligations. Campaign data may be retained for reporting and analytics purposes.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Children's Privacy</h2>
          <p>
            Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children under 18.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>
        </section>

        <section className={styles.section} style={{ 
          backgroundColor: '#f0fdf4', 
          border: '1px solid #bbf7d0', 
          borderRadius: '0.75rem',
          marginTop: '2rem'
        }}>
          <h2 style={{ color: '#166534', marginBottom: '1rem' }}>Contact Us</h2>
          <p style={{ color: '#15803d', margin: 0 }}>
            If you have any questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:info@adscreenhub.com" style={{ 
              color: '#1319B3', 
              textDecoration: 'underline',
              fontWeight: '600'
            }}>
              info@adscreenhub.com
            </a>
          </p>
          <p style={{ color: '#15803d', fontSize: '0.875rem', marginTop: '1rem', marginBottom: 0 }}>
            Last Updated: {new Date().toLocaleDateString()}
          </p>
        </section>
    </StandardPageLayout>
  );
}
