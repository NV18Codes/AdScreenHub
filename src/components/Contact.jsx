import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import { contactAPI } from '../config/api';
import styles from '../styles/Contact.module.css';

export default function Contact() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleGoBack = () => {
    console.log('Contact Back button clicked!');
    try {
      // Try React Router navigation first
      navigate('/');
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to direct URL change
      window.location.href = '/';
    }
  };
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
    <div className={styles.container}>
      <div className={styles.header}>
        <button 
          onClick={handleGoBack} 
          className={styles.backButton}
          type="button"
        >
          ← Go Back
        </button>
        <h1 className={styles.title}>Contact Us</h1>
        <p className={styles.subtitle}>Get in touch with us using the form or send us an e-mail to : <a href="mailto:info@adscreenhub.com" className={styles.emailLink}>info@adscreenhub.com</a></p>
      </div>
      
      <div className={styles.scrollableContent}>
        
        {/* Success Message */}
        {successMessage && (
          <div className={styles.successMessage}>
            ✓ {successMessage}
          </div>
        )}
        
        {/* Error Message */}
        {errorMessage && (
          <div className={styles.errorMessage}>
            ✗ {errorMessage}
          </div>
        )}
        
        <div className="bg-gray-50 rounded-2xl p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input 
                  type="text" 
                  id="name"
                  name="name"
                  required
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <input 
                  type="email" 
                  id="email"
                  name="email"
                  required
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number *
              </label>
              <input 
                type="tel" 
                id="phone"
                name="phone"
                required
                placeholder="Enter your phone number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                Message *
              </label>
              <textarea 
                id="message"
                name="message"
                required
                rows="6"
                placeholder="Tell us about your inquiry or how we can help you"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              ></textarea>
            </div>
            
            <div className="text-center">
              <button 
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-12 py-4 rounded-full font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
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
      </div>
    </div>
  );
}
