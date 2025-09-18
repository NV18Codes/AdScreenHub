import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Contact.module.css';

export default function Contact() {
  const navigate = useNavigate();

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
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message')
    };
    
    // Show success message
    alert(`Thank you ${data.name}! Your message has been sent. We'll get back to you soon at ${data.email}.`);
    
    // Reset form
    e.target.reset();
    
    console.log('Contact form submitted:', data);
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
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-12 py-4 rounded-full font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
