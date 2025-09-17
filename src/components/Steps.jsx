import calendarIcon from '../assets/icons/calendar.svg';
import locationIcon from '../assets/icons/location.svg';
import uploadIcon from '../assets/icons/upload.svg';
import approveIcon from '../assets/icons/approve.svg';

const steps = [
  { 
    icon: calendarIcon, 
    text: "SELECT DATE & LOCATION",
    description: "Choose when and where you want your ad to appear"
  },
  { 
    icon: calendarIcon, 
    text: "CHOOSE EXPOSURE PLAN",
    description: "Select the right plan for your campaign goals"
  },
  { 
    icon: uploadIcon, 
    text: "UPLOAD YOUR DESIGN",
    description: "Upload your creative content in the required format"
  },
  { 
    icon: approveIcon, 
    text: "GET YOUR DESIGN APPROVED",
    description: "Our team reviews and approves your content"
  },
  { 
    icon: approveIcon, 
    text: "MAKE YOURSELF KNOWN",
    description: "Your ad goes live on our LED screens"
  },
];

export default function Steps() {
  return (
    <section className="px-8 py-24 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Steps */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-16">How to get started</h2>
            <div className="space-y-8">
              {steps.map((step, i) => (
                <div key={i} className="flex items-start space-x-6">
                  <div className="flex-shrink-0 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center">
                    <img src={step.icon} alt={step.text} className="w-7 h-7 filter brightness-0 invert" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-blue-900 text-xl">{step.text}</h3>
                    <p className="text-gray-600 mt-2 text-lg">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Video Placeholder */}
          <div className="lg:pl-8 flex flex-col justify-center h-full">
            <p className="text-gray-700 text-xl mb-10 font-medium italic text-center lg:text-left">
              AS EASY AS ADDING A PRODUCT TO CART — RENT OUR LED SCREENS IN MINUTES.
            </p>
            <div className="bg-gray-200 rounded-xl p-16 text-center relative overflow-hidden" style={{ minHeight: '500px' }}>
              <div className="absolute inset-0">
                <img 
                  src="/Banner.png" 
                  alt="Video Background" 
                  className="w-full h-full object-cover opacity-20"
                  onError={(e) => {
                    console.error('Failed to load Banner.png');
                    e.target.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 opacity-50"></div>
              </div>
              <div className="relative z-10 flex flex-col justify-center h-full">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
                  <svg className="w-16 h-16 text-blue-600 ml-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                <p className="text-gray-700 font-medium text-xl">Watch a quick video to understand how it works and get started instantly.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
