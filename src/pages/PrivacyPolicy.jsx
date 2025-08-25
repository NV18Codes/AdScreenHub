import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/PrivacyPolicy.module.css';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={handleGoBack} className={styles.backButton}>
          ← Go Back
        </button>
        <h1 className={styles.title}>Privacy Policy</h1>
      </div>
      
      <div className={styles.content}>
        <section className={styles.section}>
          <h2>1. Introduction</h2>
          <p>1.1 AdScreenHub.com ("AdScreenHub") is committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.</p>
          
          <p>1.2 By using AdScreenHub, you consent to the data practices described in this policy. If you do not agree with the practices described in this policy, please do not use our services.</p>
        </section>

        <section className={styles.section}>
          <h2>2. Information We Collect</h2>
          <p>2.1 Personal Information: We may collect personal information such as your name, email address, phone number, and address when you create an account or use our services.</p>
          
          <p>2.2 Usage Information: We collect information about how you use our website, including pages visited, time spent on pages, and other browsing behavior.</p>
          
          <p>2.3 Technical Information: We may collect technical information such as your IP address, browser type, operating system, and device information.</p>
        </section>

        <section className={styles.section}>
          <h2>3. How We Use Your Information</h2>
          <p>3.1 We use the information we collect to:</p>
          <ul>
            <li>Provide and maintain our services</li>
            <li>Process your orders and payments</li>
            <li>Send you important updates and notifications</li>
            <li>Improve our website and services</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>4. Information Sharing</h2>
          <p>4.1 We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
          
          <p>4.2 We may share your information with:</p>
          <ul>
            <li>Service providers who assist us in operating our website</li>
            <li>Payment processors for transaction processing</li>
            <li>Legal authorities when required by law</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>5. Data Security</h2>
          <p>5.1 We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
          
          <p>5.2 However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>
        </section>

        <section className={styles.section}>
          <h2>6. Cookies and Tracking</h2>
          <p>6.1 We use cookies and similar tracking technologies to enhance your browsing experience and analyze website traffic.</p>
          
          <p>6.2 You can control cookie settings through your browser preferences, but disabling cookies may affect website functionality.</p>
        </section>

        <section className={styles.section}>
          <h2>7. Third-Party Links</h2>
          <p>7.1 Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these external sites.</p>
          
          <p>7.2 We encourage you to review the privacy policies of any third-party sites you visit.</p>
        </section>

        <section className={styles.section}>
          <h2>8. Children's Privacy</h2>
          <p>8.1 Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13.</p>
          
          <p>8.2 If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.</p>
        </section>

        <section className={styles.section}>
          <h2>9. Your Rights</h2>
          <p>9.1 You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Opt-out of marketing communications</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>10. Data Retention</h2>
          <p>10.1 We retain your personal information for as long as necessary to provide our services and comply with legal obligations.</p>
          
          <p>10.2 When we no longer need your information, we will securely delete or anonymize it.</p>
        </section>

        <section className={styles.section}>
          <h2>11. Links to Third-Party Websites</h2>
          <p>11.1 The Site and/or the Services may, from time to time, contain hyperlinks, banners, widgets, or
          other forms of references to external websites, applications, or online resources which are owned,
          operated, and controlled by third parties not under the direct control, supervision, or management of
          AdScreenHub (hereinafter referred to as "Third-Party Sites").</p>
          
          <p>11.2 By following, clicking, or otherwise engaging with any such hyperlink or reference, you
          acknowledge and agree that you shall be redirected to such Third-Party Site, the access, use, and
          interaction with which shall be governed exclusively by the terms and conditions, privacy policies, and
          other applicable rules and regulations of such Third-Party Site, as may be in force from time to time.</p>
          
          <p>11.3 AdScreenHub expressly disclaims any and all responsibility, liability, or obligation with respect to
          the content, representations, privacy practices, data handling methodologies, or security safeguards
          employed by any Third-Party Site, whether or not such Third-Party Site has been referenced, linked, or
          otherwise made accessible through the Site or the Services.</p>
          
          <p>11.4 You are strongly advised, prior to accessing or engaging with any Third-Party Site, to undertake
          an independent review of the privacy policy, terms of use, and any other relevant documentation of
          such Third-Party Site to ensure that you are fully informed of your rights, obligations, and data
          protection safeguards therein.</p>
        </section>

        <section className={styles.section}>
          <h2>12. Web Analytics and Tracking Technologies</h2>
          <p>12.1 For the purposes of monitoring, measuring, and analysing patterns of use, user engagement, and
          traffic trends on the Site, and in furtherance of legitimate business interests, AdScreenHub may engage
          reputable third-party analytics service providers (hereinafter referred to as "Analytics Providers"),
          which may include, without limitation, Google Analytics, to collect, process, and analyse certain non-
          personally identifiable and/or aggregated data relating to your interaction with the Site and the
          Services.</p>
          
          <p>12.2 Google Analytics is a web analytics service provided by Google (and its affiliates), which collects,
          tracks, and reports information concerning user visits, interactions, and navigation paths on the Site.
          Such data may be utilised by Google for the purposes of evaluating Site usage, compiling reports,
          improving service offerings, and, in certain cases, contextualising and personalising advertisements
          displayed through its proprietary advertising networks.</p>
          
          <p>12.3 Further information concerning the data collection practices, usage policies, and privacy
          safeguards employed by Google may be reviewed at the following link: Google Privacy & Terms.</p>
        </section>

        <section className={styles.section}>
          <h2>13. Amendments to this Policy</h2>
          <p>13.1 AdScreenHub reserves the right to amend, modify, or revise this Policy at its sole discretion,
          without prior notice, provided that the updated Policy is published on the Site with a revised "Last
          Updated" date.</p>
          
          <p>13.2 Your continued use of the Site or Services after publication of amendments shall constitute
          deemed acceptance of the updated Policy.</p>
        </section>

        <section className={styles.section}>
          <h2>14. Contact Us</h2>
          <p>14.1 If you have any questions, concerns, or requests regarding this Privacy Policy or AdScreenHub's
          privacy practices, you may contact us at <a href="mailto:info@adscreenhub.com" className={styles.contactLink}>info@adscreenhub.com</a></p>
        </section>

        <section className={styles.section}>
          <h2>15. Download Privacy Policy</h2>
          <p>For your convenience, you can download a PDF version of this Privacy Policy:</p>
          <div className={styles.downloadSection}>
            <a 
              href="/privacy-policy-document.pdf" 
              download="AdScreenHub_Privacy_Policy.pdf"
              className={styles.downloadButton}
              target="_blank"
              rel="noopener noreferrer"
            >
              📄 Download Privacy Policy (PDF)
            </a>
            <p className={styles.downloadNote}>
              <small>Click the button above to download the complete Privacy Policy document in PDF format.</small>
            </p>
            <div className={styles.alternativeDownload}>
              <p>If the download doesn't work, try:</p>
              <ul>
                <li>Right-click the button and select "Save link as..."</li>
                <li>Disable ad blocker for this site</li>
                <li>Use a different browser</li>
              </ul>
              <div className={styles.textDownload}>
                <p>Or download as text file:</p>
                <a 
                  href="/privacy-policy.txt" 
                  download="AdScreenHub_Privacy_Policy.txt"
                  className={styles.textDownloadButton}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📝 Download as Text File
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
