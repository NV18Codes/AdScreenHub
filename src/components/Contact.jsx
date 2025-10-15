import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import { contactAPI } from '../config/api';
import StandardPageLayout from './StandardPageLayout';
import styles from '../styles/StandardPageLayout.module.css';

export default function Contact() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      // Get form data
      const formData = new FormData(e.target);
      const data = {
        fullName: formData.get('name'),
        email: formData.get('email'),
        phoneNumber: formData.get('phone'),
        message: formData.get('message')
      };
      
      // Call the API
      const result = await contactAPI.submitContactForm(data);
      
      if (result.success) {
        // Show success message
        setSuccessMessage(
          result.data?.message || 
          `Thank you ${data.fullName}! Your message has been sent. We'll get back to you soon at ${data.email}.`
        );
        
        // Reset form
        e.target.reset();
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      } else {
        // Show error message
        setErrorMessage(
          result.error || 
          result.message || 
          'Failed to send message. Please try again.'
        );
      }
    } catch (error) {
      setErrorMessage('Failed to send message. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StandardPageLayout
      title="Contact Us"
      subtitle="Get in touch with us using the form or send us an e-mail to: info@adscreenhub.com"
    >
      <div className={styles.contactForm}>
        {/* Success Message */}
        {successMessage && (
          <div className={`${styles.message} ${styles.successMessage}`}>
            ✓ {successMessage}
          </div>
        )}
        
        {/* Error Message */}
        {errorMessage && (
          <div className={`${styles.message} ${styles.errorMessage}`}>
            ✗ {errorMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-6">
            <div className={styles.formGroup}>
              <label htmlFor="name">
                Full Name *
              </label>
              <input 
                type="text" 
                id="name"
                name="name"
                required
                placeholder="Enter your full name"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="email">
                Email Address *
              </label>
              <input 
                type="email" 
                id="email"
                name="email"
                required
                placeholder="Enter your email address"
              />
            </div>
          </div>
            
          <div className={styles.formGroup}>
            <label htmlFor="phone">
              Phone Number
            </label>
            <input 
              type="tel" 
              id="phone"
              name="phone"
              placeholder="Enter your phone number"
            />
          </div>
            
          <div className={styles.formGroup}>
            <label htmlFor="message">
              Message *
            </label>
            <textarea 
              id="message"
              name="message"
              required
              placeholder="Tell us how we can help you..."
            ></textarea>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <button 
              type="submit" 
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="small" text="" className="inlineSpinner" />
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </button>
          </div>
        </form>
      </div>
    </StandardPageLayout>
  );
}
