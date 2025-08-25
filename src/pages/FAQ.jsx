import React from 'react';
import styles from '../styles/FAQ.module.css';

export default function FAQ() {
  return (
    <div className={styles.faqContainer}>
      <div className={styles.faqHeader}>
        <h1>Frequently Asked Questions</h1>
        <p>Everything you need to know about AdScreenHub's LED digital screen advertising platform</p>
      </div>

      <div className={styles.faqContent}>
        {/* Company Overview */}
        <section className={styles.faqSection}>
          <h2>About AdScreenHub</h2>
          <p>
            AdScreenHub.com ("AdScreenHub") is an AI-powered online advertising technology ("AdTech")
            platform based in Bengaluru, India, revolutionizing the digital out-of-home (DOOH) advertising
            landscape by streamlining creative generation, campaign scheduling, and smart display placement. We
            simplify LED digital screen advertising by providing a dashboard of outdoor hoarding inventory for
            effortless selection, booking, and campaign management. By streamlining this traditionally
            fragmented ecosystem, AdScreenHub lowers the barriers for small and medium businesses to launch
            professional, hyper-local digital screen campaigns—making outdoor advertising accessible to all: big
            brands, small advertisers, campaigners and individuals.
          </p>
        </section>

        {/* Ad Creative Section */}
        <section className={styles.faqSection}>
          <h2>Ad Creative</h2>
          
          <div className={styles.faqItem}>
            <h3>1. What elements are allowed as the ad?</h3>
            <p>Your digital screen ad would be either:</p>
            <ul>
              <li>An image</li>
              <li>An Animated Image Sequence</li>
            </ul>
          </div>

          <div className={styles.faqItem}>
            <h3>2. What are the ways of crafting a creative for my campaign?</h3>
            <p>Irrespective of the package you choose, you can either:</p>
            <ul>
              <li>Upload your externally crafted creative</li>
              <li>Design using our recommended external AI tools and templates</li>
            </ul>
          </div>

          <div className={styles.faqItem}>
            <h3>3. Do I need specific file formats or sizes for my creative?</h3>
            <p>
              Yes, each location has unique dimensions, aspect ratios, and orientations. To ensure your ad displays
              perfectly and avoids delays or rejection, creatives must meet the exact specifications with high
              resolution. We accept PNG, JPEG, JPG, MP4, and MPEG4 file formats. PDFs are not accepted.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>4. What if I don't have a design for my ad?</h3>
            <p>
              No problem! You can create one yourself using AI tools like Canva, or our professional design team
              can craft it for you—just fill our form and we will call you right back.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>5. Can you help me with design inspiration?</h3>
            <p>
              Yes! You can leave it to our experts for a professionally polished result at a reasonable additional cost.
              Our experts have crafted many breathtaking creatives for numerous occasions.
            </p>
          </div>
        </section>

        {/* Campaign Management Section */}
        <section className={styles.faqSection}>
          <h2>Campaign Management</h2>
          
          <div className={styles.faqItem}>
            <h3>6. What is the length and frequency of the ad?</h3>
            <p>
              The duration of an ad is typically 10-second showing of your advertisement on a digital screen.
              Typically, digital screens operate for about 14 hours daily, and your ad is displayed repeatedly—once
              every minute or every one and a half minute—on one digital screen within your selected target area.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>7. Where will my ad be displayed?</h3>
            <p>
              Your ad would appear on one large LED digital screen in a high-sensitive traffic area based on your
              selected target location.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>8. When will my ad be displayed?</h3>
            <p>Your ad would appear on the digital screen from 8am to 10pm on the chosen day(s).</p>
          </div>

          <div className={styles.faqItem}>
            <h3>9. How do I choose where my ad will be displayed?</h3>
            <p>
              When creating your campaign, simply choose your target location from the suggested options. Your
              ad will then appear on the digital screen, providing focused local coverage based on availability of the
              selected date.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>10. Can I run my ad in multiple locations at the same time?</h3>
            <p>
              Yes! You'll need to create a separate order for each location as each location has its own availability,
              size, dimensions, and orientation.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>11. Can I change my ad or creative after the order?</h3>
            <p>
              Once your campaign is live, changes to the ad or creative aren't possible. Since every creative must go
              through a strict approval process, making modifications mid-campaign could cause delays or rejection.
              To ensure your ad runs smoothly and on time, please upload your final creative before completing the
              order.
            </p>
          </div>
        </section>

        {/* Plans & Pricing Section */}
        <section className={styles.faqSection}>
          <h2>Plans & Pricing</h2>
          
          <div className={styles.faqItem}>
            <h3>12. What are the different packages?</h3>
            <p>AdScreenHub offers three packages based on the level of exposure you want:</p>
            
            <div className={styles.packageCard}>
              <h4>• Spark (1 day):</h4>
              <ul>
                <li><strong>Quick Visibility:</strong> Ideal low-cost choice for small and medium businesses to reach a large targeted audience</li>
                <li><strong>Tactical/ Moment Centric:</strong> Optimal to coincide with a trending moment (Ex: World Environment Day/Festivals)</li>
                <li><strong>Occasion Focussed:</strong> Suitable for celebrating special occasions, birthdays, recognitions, and other personal or community milestones.</li>
                <li><strong>700 ads</strong></li>
              </ul>
            </div>

            <div className={styles.packageCard}>
              <h4>• Impact (3 days):</h4>
              <ul>
                <li><strong>Cost Effective/Awareness Booster:</strong> Perfect to promote flash sales, limited-time offers, or grand openings</li>
                <li><strong>Weekend Blitz:</strong> Flawless idea to drive last-minute attendance or awareness.</li>
                <li><strong>Momentum Gainer:</strong> Helps maintain campaign energy with consistent ad exposure.</li>
                <li><strong>2100 ads</strong></li>
              </ul>
            </div>

            <div className={styles.packageCard}>
              <h4>• Thrive (5 days):</h4>
              <ul>
                <li><strong>Increased Exposure:</strong> Apt for multi-day campaigns synced with other media channels</li>
                <li><strong>Behavioural reinforcement/Lasting Recall:</strong> Boost awareness as frequent repetition in a short period helps build recall and urgency.</li>
                <li><strong>Brand Amplification:</strong> Strengthen your brand's presence in the intended region.</li>
                <li><strong>3500 ads</strong></li>
              </ul>
            </div>

            <p>
              Tailored to support your campaign objectives, each plan offers varying levels of ad repetition, with
              advanced plans enabling more ad runs to drive stronger results.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>13. Are there any additional costs or fees?</h3>
            <p>
              No, there are no hidden costs or additional fees. Your package covers everything, including ad creation,
              location selection and ad plays on the LED digital screen.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>14. Can I book a long-term LED screen advertising campaign?</h3>
            <p>
              Absolutely! If you're looking for an extended booking, our team can design a custom solution
              tailored to your campaign goals and duration.
            </p>
          </div>
        </section>

        {/* Approvals & Restrictions Section */}
        <section className={styles.faqSection}>
          <h2>Approvals & Restrictions</h2>
          
          <div className={styles.faqItem}>
            <h3>15. Why is ad approval necessary?</h3>
            <p>
              Ad approval helps guarantee that your advertisement aligns with local laws, governmental regulations
              and community standards. Certain locations have specific restrictions—for example, ads on specific
              days are restricted by governmental regulations. This review process ensures your ad is appropriate
              and eligible for display.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>16. What are my responsibilities regarding the content of my advertisements?</h3>
            <p>
              You are responsible for ensuring that your advertisement content is not misleading and complies with
              all applicable laws, regulations, and ethical standards. Failure to meet these requirements may result
              in your ad being rejected or your account being terminated. In addition, in accordance to the Bruhat
              Bengaluru Mahanagara Palike Outdoor Signage and Public Messaging Bye-Laws, 2018, the text/logo
              (units) in digital screen must adhere to the ratio of 60:40 of Kannada language : secondary language
              (English).
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>17. What happens if my ad gets rejected?</h3>
            <p>
              If your ad doesn't meet the required guidelines, you'll receive an email outlining the issues. You may
              need to update the content, such as adjusting images or text, to comply with regulations. Once revised,
              you can resubmit your ad for another review. However, the revised ad must be resubmitted at least 12
              hours before the scheduled start time of the relevant ad slot.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>18. What happens if I don't resubmit my revised advertisement?</h3>
            <p>
              If you fail to resubmit the corrected advertisement, the ad slot will be forfeited. In such cases, you will
              not be entitled to any refund, credit, or compensation.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>19. What if I need to make changes but there is less than 12 hours before my ad slot starts?</h3>
            <p>
              It is your responsibility to ensure compliance with all advertisement guidelines during order
              placements. In such cases, the ad slot will be forfeited, and you will remain liable for the full charges
              without refund or credit.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>20. Will my resubmitted advertisement be reviewed again?</h3>
            <p>
              Yes, once your revised advertisement is received, AdScreenHub will review it to ensure it complies with
              all guidelines. Only compliant advertisements will be displayed.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>21. What are the prohibited ads on the platform?</h3>
            <p>
              To comply with diverse location-based and time-specific governmental regulations, AdScreenHub does
              not permit advertisements from the categories listed below.
            </p>
            <ul className={styles.prohibitedList}>
              <li>False or misleading claims</li>
              <li>Fraudulent financial schemes or get-rich-quick scams</li>
              <li>Hate speech, defamation, or politically sensitive content</li>
              <li>Illegal services, counterfeit products, or copyrighted material without permission</li>
              <li>Alcohol Advertising</li>
              <li>Tobacco & Vaping Products</li>
              <li>Gambling, Betting & Lottery Ads</li>
              <li>Political Ads</li>
              <li>Adult Content</li>
              <li>Language, Religious & Culturally Sensitive Ads</li>
            </ul>
          </div>
        </section>

        {/* Payment & Billing Section */}
        <section className={styles.faqSection}>
          <h2>Payment & Billing</h2>
          
          <div className={styles.faqItem}>
            <h3>22. What payment methods do you accept?</h3>
            <p>We accept payments via credit/debit cards, UPI, net banking, and mobile wallets.</p>
          </div>

          <div className={styles.faqItem}>
            <h3>23. Will I get a tax invoice for my booking?</h3>
            <p>Yes, you get a GST invoice for our campaign after the ad is approved.</p>
          </div>
        </section>

        {/* Ad Performance & Reporting Section */}
        <section className={styles.faqSection}>
          <h2>Ad Performance & Reporting</h2>
          
          <div className={styles.faqItem}>
            <h3>24. How do power cuts affect my ad display and billing?</h3>
            <p>
              While Bengaluru may experience occasional power cuts, it's important to note that power
              interruptions can still occur due to various factors such as maintenance activities, infrastructure issues,
              or unforeseen circumstances. Our LED screens typically operate for about 14 hours daily, offering
              around 840 ad slots each day. Based on the latest report related to BESCOM, the average daily power
              outage is approximately 2.2 hours. To account for this, we charge only for 700 slots per day, reflecting
              typical screen availability.
            </p>
            <p>
              In the event of a power outage exceeding the average duration, such occurrence shall be deemed a
              force majeure event beyond the reasonable control of AdScreenHub, and AdScreenHub shall not be
              held liable for any failure or delay in the display of advertisements arising therefrom. Conversely, if
              there are no power interruptions, you'll benefit from additional ad slots beyond the 700 daily
              allotment at no extra charge.
            </p>
            <p>
              Please note, according to Bruhat Bengaluru Mahanagara Palike (Advertisement) Bye-Laws, 2024,
              applicable to Greater Bengaluru Area under the Greater Bengaluru Governance Act, 2024, digital
              screens are not allowed to use diesel generators to operate during power outages.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>25. How can I track my ad?</h3>
            <p>
              After your ad goes live, we will upload an image to your order later the same day containing:
            </p>
            <ul>
              <li>A view of your ad.</li>
              <li>A map showing the locations of the digital screen(s) displaying your ad.</li>
            </ul>
          </div>
        </section>

        {/* Contact Section */}
        <section className={styles.contactSection}>
          <h2>Still Have Questions?</h2>
          <p>
            If you have any further questions, feel free to contact us at{' '}
            <a href="mailto:info@adscreenhub.com" className={styles.contactEmail}>
              info@adscreenhub.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
