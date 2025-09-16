export default function About() {
  const handleCanvaClick = () => {
    window.open('https://www.canva.com/en_in/', '_blank');
  };

  const handleCallUsClick = () => {
    // Navigate to the contact page
    window.location.href = '/contact';
  };

  return (
    <section className="px-8 py-24 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="/Banner.png" 
          alt="About Background" 
          className="w-full h-full object-cover opacity-5"
          onError={(e) => {
            console.error('Failed to load Banner.png');
            e.target.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gray-50 bg-opacity-95"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Side - About Us */}
          <div>
            <h2 className="section-heading mb-8">About Us</h2>
            <p className="text-gray-700 text-xl leading-relaxed text-justify">
              ADSCREENHUB is an AdTech-enabled media buying platform and marketplace based in Bengaluru, India. 
              Our platform provides end-to-end ease to plan, book, and track outdoor advertising campaigns. 
              We make screen advertising planning and execution easier by offering a dashboard of outdoor 
              hoarding inventory for selecting, booking, and managing advertising campaign placements seamlessly. 
              By simplifying searching, filtering (by geography, rate, time) we bring transparency and accessibility 
              to compare rates and reach quickly—ideal for All: big brands, small advertisers, Campaigners and individuals.
            </p>
          </div>

          {/* Right Side - Design Inspiration */}
          <div className="lg:w-3/5 lg:ml-auto">
            <div className="bg-blue-50 rounded-xl p-8 shadow-lg">
              <h3 className="subsection-heading mb-6">Need design inspiration?</h3>
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-gray-700 mb-4">Put your creative mind to work using AI</p>
                  <button 
                    onClick={handleCanvaClick}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
                  >
                    CANVA
                  </button>
                </div>
                
                <div className="text-center">
                  <p className="text-gray-500 font-medium">or</p>
                </div>
                
                <div className="text-center">
                  <p className="text-gray-700 mb-4">Let the professionals do it for you</p>
                  <button 
                    onClick={handleCallUsClick}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
                  >
                    CALL US
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
