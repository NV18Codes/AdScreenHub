import React from 'react';

export default function Contact() {
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
    <section className="px-8 py-20 bg-white" style={{ paddingTop: '6rem' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="section-heading mb-4">Contact Us</h2>
          <p className="text-xl text-gray-600">
            Get in touch with us using the form or send us an e-mail to : <a href="mailto:info@adscreenhub.com" className="text-blue-600 hover:text-blue-800 underline">info@adscreenhub.com</a>
          </p>
        </div>
        
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
    </section>
  );
}
