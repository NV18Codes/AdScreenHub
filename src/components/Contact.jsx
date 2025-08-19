export default function Contact() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Contact form submitted');
  };

  return (
    <section className="px-8 py-20 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-gray-800 mb-4 heading-font">Contact Us</h2>
          <p className="text-xl text-gray-600">
            Get in touch with us for any inquiries or support
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
        
        <div className="mt-12 text-center">
          <div className="inline-flex items-center bg-blue-50 rounded-full px-6 py-3">
            <div className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-bold mr-3">AD</div>
            <div className="text-xl font-bold text-blue-900">SCREEN HUB</div>
          </div>
          <p className="text-gray-600 mt-4">
            Your trusted partner for LED billboard advertising
          </p>
        </div>
      </div>
    </section>
  );
}
