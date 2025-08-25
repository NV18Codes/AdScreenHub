import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Terms.module.css';

export default function Terms() {
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
        <h1 className={styles.title}>Terms of Service</h1>
      </div>
      
      <div className={styles.content}>
        <section className={styles.section}>
          <h2>Introduction</h2>
          <p>1.1 Thank you for choosing AdScreenHub.com (hereinafter referred to as "AdScreenHub") operated by
          ADSCREENHUB MEDIA as your platform for posting digital screen advertisements. These Terms of
          Service (the "Terms") govern your access of the AdScreenHub website as a user (hereinafter referred
          to as "Advertiser") and its subsequent use to place bookings on the website. Please read these Terms
          carefully before using the website. By accessing, browsing, or otherwise using the website, the
          Advertiser expressly acknowledges and agrees to be bound by these Terms, and such act shall be
          deemed to constitute valid consent under Section 10A of the Information Technology Act, 2000.</p>
          
          <p>1.2 These Terms are to be read in conjunction with, and subject to, all applicable laws in force in India,
          including but not limited to the Indian Contract Act, 1872; the Consumer Protection Act, 2019; the
          Information Technology Act, 2000 and allied Rules thereunder; and the Advertising Standards Council
          of India (ASCI) Code.</p>
        </section>

        <section className={styles.section}>
          <h2>Disclaimer</h2>
          <p>2.1 AdScreenHub is an AI-powered online advertising technology ("AdTech") platform facilitating the
          booking of digital screen advertisements. While due care is taken to ensure the accuracy of information
          displayed on the platform, AdScreenHub shall not be liable for any errors, omissions,
          misrepresentations, or misleading statements contained on the platform or in any displayed
          advertisements, to the fullest extent permissible under Indian law.</p>
        </section>

        <section className={styles.section}>
          <h2>Account Creation</h2>
          <p>3.1 In order to access the AdScreenHub platform as an Advertiser, the Advertiser shall be required to
          create a user account in accordance with the registration process prescribed by AdScreenHub.
          AdScreenHub reserves the absolute right, in its sole discretion, to refuse, suspend, or terminate access
          to the platform.</p>
          
          <p>3.2 By signing up for an account:</p>
          <ul>
            <li>3.2.1 The Advertiser represents and warrants that it possesses all necessary rights, authorisations, and
            permissions to post advertisements through the platform.</li>
            <li>3.2.2 The Advertiser undertakes to provide advertisement content that is accurate, lawful, and
            compliant with applicable Indian laws.</li>
            <li>3.2.3 The Advertiser shall ensure that all advertisements comply with the Consumer Protection Act,
            2019, the ASCI Code for Self-Regulation of Advertising Content, and all other applicable laws, rules,
            and regulations in force in India.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Advertisement Content Guidelines</h2>
          <p>4.1 AdScreenHub shall accept advertisements in good faith; however, AdScreenHub expressly reserves
          the right to reject, edit, suspend, or remove any advertisement at any stage if it violates these Terms
          or applicable laws.</p>
          
          <p>4.2 Without prejudice to the generality of the foregoing, the following categories of content are
          expressly prohibited under Indian law and AdScreenHub policy:</p>
          <ul>
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
        </section>

        <section className={styles.section}>
          <h2>Ad Creative & Approval</h2>
          <p>5.1 An Advertiser using AdScreenHub may post advertisements only on those digital screens approved
          by AdScreenHub. The Advertiser shall be responsible for uploading advertisement creative materials
          designed externally.</p>
          
          <p>5.2 All advertisements submitted via AdScreenHub shall be subject to prior approval by AdScreenHub
          before being displayed. Such approval shall be granted only upon confirmation of compliance with
          applicable laws, public advertising standards, and these Terms.</p>
          
          <p>5.3 Accepted Creative Types: Advertisements displayed on digital screens shall consist solely of static
          images or animated image sequences.</p>
          
          <p>5.4 AdScreenHub shall accept creatives only in the following file formats: PNG, JPEG, JPG, MP4, and
          MPEG4. Creatives submitted in PDF or any other unsupported format shall be rejected.</p>
          
          <p>5.5 In strict compliance with the Bruhat Bengaluru Mahanagara Palike Outdoor Signage and Public
          Messaging Bye-Laws, 2018, the text/logo units in a digital screen advertisement shall adhere to the
          ratio of 60:40 between the Kannada language and any secondary language (such as English).
          AdScreenHub hereby affirms adherence to these statutory requirements and requires all ad creatives to
          conform thereto.</p>
          
          <p>5.6 Each display location shall have specific requirements regarding dimensions, aspect ratios, and
          orientations. To ensure optimal display quality and to prevent rejection, all creatives must strictly
          conform to these specifications and be of high resolution. The Advertiser shall be solely responsible
          for ensuring that all creatives meet the requirements as per the technical specifications of the selected
          display locations. Non-compliance shall result in rejection of the advertisement.</p>
          
          <p>5.7 It shall be the sole responsibility of the Advertiser to ensure that the content is not false,
          misleading, or in violation of any applicable laws, rules, or ethical standards. Any breach may result in
          rejection of the advertisement or immediate termination of the Advertiser's account without liability
          on the part of AdScreenHub.</p>
          
          <p>5.8 The Advertiser shall have the right to amend and resubmit the advertisement content to rectify
          identified issues, provided that such resubmission occurs no later than twelve (12) hours before the
          scheduled commencement date of the relevant advertisement slot.</p>
          
          <p>5.9 If the Advertiser fails to resubmit the revised advertisement within the stipulated time, the
          advertisement slot shall stand forfeited, and the Advertiser shall have no entitlement to any refund,
          credit, or compensation.</p>
          
          <p>5.10 The Advertiser acknowledges and agrees that it is their exclusive responsibility to ensure full
          compliance at the time of placing an order. Where less than twelve (12) hours remain before the
          scheduled start time and changes are still required, the slot shall be deemed forfeited and full charges
          shall remain payable.</p>
          
          <p>5.11 Upon receipt of the resubmitted advertisement, AdScreenHub shall conduct a subsequent review
          to verify compliance. Only upon successful clearance shall the advertisement be displayed.</p>
        </section>

        <section className={styles.section}>
          <h2>Plans and Ad Plays</h2>
          <p>6.1 AdScreenHub offers subscription plans that determine the number of advertisement plays ("ad
          slots") purchased by the Advertiser. For the purposes of these Terms, an "ad play" shall mean a ten-
          second display of the Advertiser's advertisement on a digital screen.</p>
          
          <p>6.2 Digital screens typically operate for approximately fourteen (14) hours daily, during which the
          Advertiser's advertisement is displayed repeatedly—generally once every sixty (60) to ninety (90)
          seconds—on the digital screen(s) within the selected target area.</p>
          
          <p>6.3 The subscription packages presently offered are as follows:</p>
          <ul>
            <li>Spark: 700 ad plays.</li>
            <li>Impact: 2100 ad plays.</li>
            <li>Thrive: 3500 ad plays.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Payment and Compensation</h2>
          <p>7.1 The Advertiser shall be required to subscribe to one of AdScreenHub's plans to display
          advertisements. Save and except as expressly provided herein, there shall be no additional costs
          beyond the subscribed plan for ad placements.</p>
          
          <p>7.2 The plan costs expressly exclude any and all design fees or creative charges that may be payable
          should the Advertiser engage AdScreenHub to provide design services.</p>
        </section>

        <section className={styles.section}>
          <h2>Cancellation and Refunds</h2>
          <p>8.1 All payments made towards subscription plans are non-refundable, irrespective of whether the
          Advertiser cancels prior to completion of the ad play period, owing to the upfront nature of
          procurement and allocation costs.</p>
          
          <p>8.2 An exceptional refund may be granted solely in cases where the advertisement is not displayed
          due to the sole and direct fault of AdScreenHub</p>
          
          <p>8.3 No entitlement to a refund shall arise if the Advertiser submits an advertisement design that does
          not comply with the prescribed guidelines and fails to make the necessary adjustments within the
          twelve (12) hours timeframe prior to the scheduled start of the advertisement slot date.</p>
        </section>

        <section className={styles.section}>
          <h2>Compliance with Laws and Policies</h2>
          <p>9.1 The Advertiser acknowledges and agrees, that it shall, at all times, comply with all applicable laws,
          regulations, and industry standards while using the AdScreenHub. This includes, but is not limited to,
          adhering to intellectual property rights, privacy laws, and any specific guidelines or policies provided
          by AdScreenHub.</p>
        </section>

        <section className={styles.section}>
          <h2>Intellectual Property</h2>
          <p>10.1 All intellectual property rights related to the AdScreenHub, including software, trademarks, logos,
          and domain names, belong to AdScreenHub or its licensors. Advertisers are granted a limited, non-
          exclusive, non-transferable license to use the website solely for the purpose of posting and managing
          your advertisements in accordance with these Terms. You may not copy, modify, distribute, sell, or
          lease any part of the website or its associated content without prior written consent from
          AdScreenHub.</p>
          
          <p>10.2 All content on AdScreenHub, including text, images, and trademarks, are protected under
          copyright law.</p>
          <ul>
            <li>Advertisers must not submit copyrighted material unless they hold rights.</li>
            <li>AdScreenHub reserves the right to remove infringing content without notice.</li>
          </ul>
          
          <p>10.3 Advertiser may not use the website for any purpose or in any manner that infringes the rights of
          any third party. AdScreenHub encourages users to report any content on its website that an Advertiser
          believes infringes his or her rights. Only the intellectual property rights owner or person authorized to
          act on behalf of the owner can report potentially infringing content to AdScreenHub by email on
          info@adscreenhub.com.</p>
        </section>

        <section className={styles.section}>
          <h2>Privacy and Data Protection</h2>
          <p>11.1 AdScreenHub is committed to safeguarding the privacy of Advertisers and end-users. By accessing
          or using the AdScreenHub website and its services, the Advertiser expressly consents to the collection,
          processing, use, and disclosure of their personal information, as well as the personal information of
          end-users, in accordance with AdScreenHub's Privacy Policy. The Advertiser is encouraged to review
          the Privacy Policy to understand how personal data is collected, stored, used, and protected.</p>
          
          <p>11.2 AdScreenHub shall, at all times:</p>
          <ul>
            <li>Employ secure payment processing mechanisms to protect financial and personal data;</li>
            <li>Utilize Advertiser data solely for purposes such as advertisement personalization, analytics,
            and service improvement; and</li>
            <li>Refrain from selling, trading, or otherwise disclosing Advertiser data to any third party, except
            as required by law or expressly permitted under the Privacy Policy.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Campaign Tracking</h2>
          <p>12.1 After Advertiser's ad is live, AdScreenHub will upload an image to your order later the same day
          containing:</p>
          <ul>
            <li>A view of the ad.</li>
            <li>A map showing the locations of the digital screen(s) displaying the ad.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Indemnity</h2>
          <p>13.1 Advertiser agrees to indemnify, defend, and hold harmless AdScreenHub, its subsidiaries and
          parent companies, AdScreenHub partnered screen owners and each of its affiliates, officers, directors,
          employees, and agents from and against any and all claims, liabilities, damages, losses, costs, expenses,
          or fees (including reasonable attorneys' fees) arising out of or in connection with (a) their use of or
          inability to use the AdScreenHub; (b) their Content; (c) their violation of these Terms or their violation
          of any rights of a third party; (d) their violation of any applicable laws, rules or regulations; or (e) the
          unauthorized or unlawful use of AdScreenHub by any person using their account.</p>
        </section>

        <section className={styles.section}>
          <h2>Termination</h2>
          <p>14.1 AdScreenHub may, at its sole discretion, terminate an Advertiser's account or suspend access to
          the website at any time and for any reason, including but not limited to violations of these Terms, non-
          compliance with AdScreenHub's guidelines and policies, or failure to secure approval for
          advertisements. Upon termination, the Advertiser's content will no longer be displayed on any
          AdScreenHub partner screens.</p>
          
          <p>14.2 Termination shall not relieve the Advertiser from any obligation to pay accrued fees or from any
          liability for prior breaches.</p>
        </section>

        <section className={styles.section}>
          <h2>Representations, Warranties, and Disclaimers</h2>
          <p>15.1 Representations and Warranties: Advertiser represents and warrants that they have the authority
          and legal capacity to enter into these Terms and perform your obligations hereunder. Furthermore,
          Advertiser represents and warrants that the content of the advertisements you post through the
          AdScreenHub complies with all applicable laws, regulations, and ethical standards.</p>
          
          <p>15.2 Disclaimer of Warranty: The AdScreenHub is provided on an "as is" and "as available" basis,
          without any warranties of any kind, whether express or implied. AdScreenHub does not guarantee the
          accuracy, reliability, completeness, or effectiveness of the website for your specific advertising goals.
          Advertiser acknowledges and agrees that their use of the website is at their own risk.</p>
        </section>

        <section className={styles.section}>
          <h2>Restrictions</h2>
          <p>16.1 AdScreenHub has the right, but not the obligation, to take any of the following actions, in our sole
          discretion at any time, and for any reason without giving user any prior notice:</p>
          <ul>
            <li>Restrict, suspend, or terminate user access to all or any part of AdScreenHub</li>
            <li>Change, suspend, or discontinue all or any part of AdScreenHub</li>
            <li>Refuse, move, or remove any material that you submit to AdScreenHub for any reason</li>
            <li>Refuse, move, or remove any content that is available on AdScreenHub</li>
            <li>Deactivate or delete your accounts and all related information and files in your account</li>
            <li>Establish general practices and limits concerning use of AdScreenHub</li>
          </ul>
          <p>Advertiser agrees that AdScreenHub will not be liable to them or any third party for taking any of these
          actions.</p>
        </section>

        <section className={styles.section}>
          <h2>Liability Limitation & Force Majeure</h2>
          <p>17.1 AdScreenHub acts as an intermediary between advertisers and digital screen owners. We are not
          responsible for:</p>
          <ul>
            <li>Display delays caused by the partnered screen owners.</li>
            <li>Losses incurred by advertisers due to errors or omissions.</li>
            <li>Response or success rates of displayed ads.</li>
          </ul>
          
          <p>17.2 AdScreenHub shall not be liable for any failure or unavailability of the website or AdScreenHub's
          failure to provide the website as a result of strikes, lockouts, calamities, acts of God, unavailability of
          screens, the loss or destruction of data, the deletion or corruption of storage media, power failures,
          natural phenomena, riots, acts of vandalism, acts or omissions of civil or military authority, war,
          terrorism or any other event beyond our control.</p>
          
          <p>17.3 Power Interruptions and Advertising Display: The Advertiser acknowledges that Bengaluru may
          experience intermittent power outages attributable to, but not limited to, scheduled maintenance,
          infrastructural deficiencies, or other unforeseen events. AdScreenHub's LED display screens operate
          for approximately fourteen (14) hours per day, equating to an estimated 840 advertising slots daily.
          Pursuant to the latest report related to BESCOM, the average daily duration of power interruptions is
          approximately 2.2 hours. Notwithstanding the maximum available slots, the Advertiser shall be
          invoiced solely for 700 advertisement slots per day, which reflects typical screen operational
          availability after accounting for the average power outages. Any power outage exceeding the average
          daily duration of 2.2 hours shall constitute a force majeure event beyond the reasonable control of
          AdScreenHub. AdScreenHub shall not be held liable for any delay, failure, or interruption in
          advertisement display arising from such force majeure events. In the absence of power interruptions
          or if power outages remain below the average daily duration, the Client shall be entitled to additional
          advertisement slots exceeding the contracted 700 slots per day at no additional charge. In strict
          compliance with the Bruhat Bengaluru Mahanagara Palike (Advertisement) Bye-Laws, 2024, enacted
          under the Greater Bengaluru Governance Act, 2024, the operation of digital advertisement screens
          using diesel generators during power outages is explicitly prohibited. AdScreenHub hereby affirms
          adherence to these statutory requirements.</p>
        </section>

        <section className={styles.section}>
          <h2>Miscellaneous</h2>
          <p>18.1 Governing Law and Jurisdiction: Any disputes, claims, or controversies arising out of or relating to
          these Terms, including their breach, termination, or validity, shall be subject to the exclusive
          jurisdiction of the courts in Bengaluru, India. Any disputes shall be resolved through arbitration in
          Bengaluru, India before seeking legal action.</p>
          
          <p>18.2 Taxes: Advertisers are solely responsible for any taxes or duties associated with their use of the
          AdScreenHub and the payment for the display of their advertisements.</p>
          
          <p>18.3 Contact Email: For any questions, concerns, or support related to the AdScreenHub, please
          contact us at info@adscreenhub.com.</p>
          
          <p>18.4 Severability: If any provision of these Terms is found to be invalid, illegal, or unenforceable, the
          remaining provisions shall continue in full force and effect.</p>
          
          <p>18.5 Headings: The headings of articles and sections contained in these Terms are for reference
          purposes only and shall not affect in any way the meaning or interpretation of these Terms.</p>
          
          <p>18.6 Electronic Documents: This electronic document, and all other electronic documents referred to
          or incorporated herein, will be: (a) deemed for all purposes to be a "writing" or "in writing", and to
          comply with all statutory, contractual, and other legal requirements for (a) writing; and (b) legally
          enforceable as a signed agreement. A printed version of these Terms and any notice given in electronic
          form shall be admissible in judicial proceedings or administrative proceedings based upon or relating
          to these Terms to the same extent and subject to the same conditions as other business documents
          and records originally generated and maintained in printed form.</p>
          
          <p>18.7 Entire Agreement: These Terms constitute the entire agreement between the Advertiser and
          AdScreenHub with respect to the subject matter herein and supersede all prior or contemporaneous
          oral or written agreements, communications, or understandings.</p>
          
          <p>18.8 Waiver: No failure or delay by AdScreenHub in exercising any right or remedy under these Terms
          shall constitute a waiver of such right or remedy. A waiver of any provision or breach of these Terms
          shall only be effective if provided in writing and signed by an authorized representative of
          AdScreenHub.</p>
          
          <p>18.9 Survival: Clauses relating to payment, intellectual property, indemnity, limitation of liability,
          governing law, and dispute resolution shall survive the termination or expiration of these Terms.</p>
          
          <p>18.10 Modifications: AdScreenHub reserves the right to solely modify or update these Terms at any
          time. Advertisers continued use of our services implies acceptance of the updated Terms.</p>
          
          <p>By using AdScreenHub's services, the Advertiser acknowledges that it has read, understood, and
          agreed to be bound by these Terms in their entirety.</p>
        </section>
      </div>
    </div>
  );
}
