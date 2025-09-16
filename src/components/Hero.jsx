import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/signup');
  };

  return (
    <section className="pt-20 min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: '#1e3a8a' }}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="/Banner.png" 
          alt="Hero Background" 
          className="w-full h-full object-cover opacity-20"
          onError={(e) => {
            console.error('Failed to load Banner.png');
            e.target.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-blue-900 bg-opacity-80"></div>
      </div>
      
      <div className="relative z-10 text-center text-white px-8 max-w-5xl mx-auto">
        <h1 className="heading-hero text-white mb-12">
          Advertise <span className="italic text-8xl md:text-9xl">BIG</span>, Spend small
        </h1>
        <p className="text-3xl md:text-4xl mb-12 text-white font-medium">
          Go <span className="font-bold italic text-5xl md:text-6xl">BIG</span> with LED billboard advertising!
        </p>
        <div className="flex justify-center">
          <button 
            onClick={handleGetStarted}
            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 rounded-full font-bold text-2xl transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 hover:scale-105"
          >
            Get Started
          </button>
        </div>
      </div>
    </section>
  );
}
