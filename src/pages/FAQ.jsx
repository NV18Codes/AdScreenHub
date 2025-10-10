import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/FAQ.module.css';

export default function FAQ() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const faqData = [
    {
      category: "Ad Creative",
      questions: [
        {
          q: "What elements are allowed as the ad?",
          a: "Your digital screen ad would be either:\n• An image\n• An Animated Image Sequence"
        },
        {
          q: "What are the ways of crafting a creative for my campaign?",
          a: "Irrespective of the package you choose, you can either:\n• Upload your externally crafted creative\n• Design using our recommended external AI tools and templates"
        },
        {
          q: "Do I need specific file formats or sizes for my creative?",
          a: "Yes, each location has unique dimensions, aspect ratios, and orientations. To ensure your ad displays perfectly and avoids delays or rejection, creatives must meet the exact specifications with high resolution. We accept PNG, JPEG, JPG, MP4, and MPEG4 file formats. PDFs are not accepted."
        },
        {
          q: "What if I don't have a design for my ad?",
          a: "No problem! You can create one yourself using AI tools like Canva, or our professional design team can craft it for you—just fill our form and we will call you right back."
        },
        {
          q: "Can you help me with design inspiration?",
          a: "Yes! You can leave it to our experts for a professionally polished result at a reasonable additional cost. Our experts have crafted many breathtaking creatives for numerous occasions."
        }
      ]
    },
    {
      category: "Campaign Management",
      questions: [
        {
          q: "What is the length and frequency of the ad?",
          a: "The duration of an ad is typically 10-second showing of your advertisement on a digital screen. Typically, digital screens operate for about 14 hours daily, and your ad is displayed repeatedly—once every minute or every one and a half minute—on the digital screen within your selected target area."
        },
        {
          q: "Where will my ad be displayed?",
          a: "Your ad would appear on the LED digital screen in the high-sensitive traffic area based on your selected target location."
        },
        {
          q: "When will my ad be displayed?",
          a: "Your ad would appear on the digital screen from 8am to 10pm on the chosen day(s)."
        },
        {
          q: "How do I choose where my ad will be displayed?",
          a: "When creating your campaign, simply choose your target location from the suggested options. Your ad will then appear on the digital screen, providing focused local coverage based on availability of the selected date."
        },
        {
          q: "Can I run my ad in multiple locations at the same time?",
          a: "Yes! You'll need to create a separate order for each location as each location has its own availability, size, dimensions, and orientation."
        },
        {
          q: "Can I change my ad or creative after the order?",
          a: "Once your campaign is live, changes to the ad or creative aren't possible. Since every creative must go through a strict approval process, making modifications mid-campaign could cause delays or rejection. To ensure your ad runs smoothly and on time, please upload your final creative before completing the order. Once a creative is approved and scheduled for display, no changes are permitted."
        }
      ]
    },
    {
      category: "Plans & Pricing",
      questions: [
        {
          q: "What are the different packages?",
          a: "AdScreenHub offers three packages based on the level of exposure you want:\n\n• Spark (1 day):\n  - Quick Visibility: Ideal low-cost choice for small and medium businesses to reach a large targeted audience\n  - Tactical/Moment Centric: Optimal to coincide with a trending moment (Ex: World Environment Day/Festivals)\n  - Occasion Focussed: Suitable for celebrating special occasions, birthdays, recognitions, and other personal or community milestones\n  - 700 ads\n\n• Impact (3 days):\n  - Cost Effective/Awareness Booster: Perfect to promote flash sales, limited-time offers, or grand openings\n  - Weekend Blitz: Flawless idea to drive last-minute attendance or awareness\n  - Momentum Gainer: Helps maintain campaign energy with consistent ad exposure\n  - 2100 ads\n\n• Thrive (5 days):\n  - Increased Exposure: Apt for multi-day campaigns synced with other media channels\n  - Behavioural reinforcement/Lasting Recall: Boost awareness as frequent repetition in a short period helps build recall and urgency\n  - Brand Amplification: Strengthen your brand's presence in the intended region\n  - 3500 ads\n\nTailored to support your campaign objectives, each plan offers varying levels of ad repetition, with advanced plans enabling more ad runs to drive stronger results."
        },
        {
          q: "Are there any additional costs or fees?",
          a: "No, there are no hidden costs or additional fees. Your package covers everything, including ad creation, location selection and ad plays on the LED digital screen."
        },
        {
          q: "Can I book a long-term LED screen advertising campaign?",
          a: "Absolutely! If you're looking for an extended booking, our team can design a custom solution tailored to your campaign goals and duration."
        }
      ]
    },
    {
      category: "Approvals & Restrictions",
      questions: [
        {
          q: "Why is ad approval necessary?",
          a: "Ad approval helps guarantee that your advertisement aligns with local laws, governmental regulations and community standards. Certain locations have specific restrictions—for example, ads on specific days are restricted by governmental regulations. This review process ensures your ad is appropriate and eligible for display."
        },
        {
          q: "What are my responsibilities regarding the content of my advertisements?",
          a: "You are responsible for ensuring that your advertisement content is not misleading and complies with all applicable laws, regulations, and ethical standards. Failure to meet these requirements may result in your ad being rejected or your account being terminated. In addition, in accordance to the Bruhat Bengaluru Mahanagara Palike Outdoor Signage and Public Messaging Bye-Laws, 2018, the text/logo (units) in digital screen must adhere to the ratio of 60:40 of Kannada language : secondary language (English)."
        },
        {
          q: "What happens if my ad gets rejected?",
          a: "If your ad doesn't meet the required guidelines, you'll receive an email notification about the rejection. You may need to update the content, such as adjusting images or text, to comply with regulations. Once revised, you can resubmit your ad for another review. However, the revised ad must be resubmitted at least 12 hours before the scheduled display start date of the relevant ad slot."
        },
        {
          q: "What happens if I don't resubmit my revised advertisement?",
          a: "If you fail to resubmit the corrected advertisement, the ad slot will be forfeited. In such cases, you will not be entitled to any refund, credit, or compensation."
        },
        {
          q: "What if I need to make changes but there is less than 12 hours before my ad slot starts?",
          a: "It is your responsibility to ensure compliance with all advertisement guidelines during order placements. In such case, the ad slot will be forfeited, and you will remain liable for the full charges without refund or credit."
        },
        {
          q: "Will my resubmitted advertisement be reviewed again?",
          a: "Yes, once your revised advertisement is received, AdScreenHub will review it to ensure it complies with all guidelines. Only compliant advertisements will be displayed."
        },
        {
          q: "What are the prohibited ads on the platform?",
          a: "To comply with diverse location-based and time-specific governmental regulations, AdScreenHub does not permit advertisements from the categories listed below:\n\n• False or misleading claims\n• Fraudulent financial schemes or get-rich-quick scams\n• Hate speech, defamation, or politically sensitive content\n• Illegal services, counterfeit products, or copyrighted material without permission\n• Alcohol Advertising\n• Tobacco & Vaping Products\n• Gambling, Betting & Lottery Ads\n• Political Ads\n• Adult Content\n• Language, Religious & Culturally Sensitive Ads"
        }
      ]
    },
    {
      category: "Payment & Billing",
      questions: [
        {
          q: "What payment methods do you accept?",
          a: "We accept payments via credit/debit cards, UPI, net banking, and mobile wallets."
        },
        {
          q: "Will I get a tax invoice for my booking?",
          a: "Yes, you get a GST invoice for our campaign after the ad is approved."
        }
      ]
    },
    {
      category: "Ad Performance & Reporting",
      questions: [
        {
          q: "How do power cuts affect my ad display and billing?",
          a: "While Bengaluru may experience occasional power cuts, it's important to note that power interruptions can still occur due to various factors such as maintenance activities, infrastructure issues, or unforeseen circumstances. Our LED screens typically operate for about 14 hours daily, offering around 840 ad slots each day. Based on the latest report related to BESCOM, the average daily power outage is approximately 2.2 hours. To account for this, we charge only for 700 slots per day, reflecting typical screen availability.\n\nIn the event of a power outage exceeding the average duration, such occurrence shall be deemed a force majeure event beyond the reasonable control of AdScreenHub, and AdScreenHub shall not be held liable for any failure or delay in the display of advertisements arising therefrom. Conversely, if there are no power interruptions, you'll benefit from additional ad slots beyond the 700 daily allotment at no extra charge.\n\nPlease note, according to Bruhat Bengaluru Mahanagara Palike (Advertisement) Bye-Laws, 2024, applicable to Greater Bengaluru Area under the Greater Bengaluru Governance Act, 2024, digital screens are not allowed to use diesel generators to operate during power outages."
        },
        {
          q: "How can I track my ad?",
          a: "After your ad goes live, we will upload an image to your order later the same day containing:\n• A view of your ad\n• A map showing the locations of the digital screen(s) displaying your ad"
        }
      ]
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={handleGoBack} className={styles.backButton}>
          ← Back
        </button>
        <h1 className={styles.title}>Frequently Asked Questions</h1>
        <p className={styles.subtitle}>Find answers to common questions about AdScreenHub</p>
      </div>

      <div className={styles.intro}>
        <p>
          AdScreenHub.com ("AdScreenHub") is an AI-powered online advertising technology ("AdTech") platform based in 
          Bengaluru, India, revolutionizing the digital out-of-home (DOOH) advertising landscape by streamlining creative 
          generation, campaign scheduling, and smart display placement. We simplify LED digital screen advertising by 
          providing a dashboard of outdoor hoarding inventory for effortless selection, booking, and campaign management. 
          By streamlining this traditionally fragmented ecosystem, AdScreenHub lowers the barriers for small and medium 
          businesses to launch professional, hyper-local digital screen campaigns—making outdoor advertising accessible 
          to all: big brands, small advertisers, campaigners and individuals.
        </p>
      </div>

      <div className={styles.scrollableContent}>
        {faqData.map((category, categoryIndex) => (
          <section key={categoryIndex} className={styles.categorySection}>
            <h2 className={styles.categoryTitle}>{category.category}</h2>
            {category.questions.map((item, qIndex) => (
              <div key={qIndex} className={styles.faqItem}>
                <h3 className={styles.question}>
                  {categoryIndex * 10 + qIndex + 1}. {item.q}
                </h3>
                <div className={styles.answer}>
                  {item.a.split('\n').map((line, lineIndex) => (
                    <p key={lineIndex}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))}

        <section className={styles.contactSection}>
          <h2>Still Have Questions?</h2>
          <p>
            If you have any further questions, please feel free to contact us at{' '}
            <a href="mailto:info@adscreenhub.com" className={styles.emailLink}>
              info@adscreenhub.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
