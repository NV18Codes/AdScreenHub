import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/signup');
  };

  return (
    <section className="pt-20 min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="/Banner.png" 
          alt="Hero Background" 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>
      
      <div className="relative z-10 text-center text-white px-8 max-w-6xl mx-auto">
        {/* Main Headline */}
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
          Advertise Big,<br></br>Spend Small
        </h1>
        
        {/* Sub-text/Tagline */}
        <p className="text-xl md:text-2xl lg:text-3xl mb-12 font-medium leading-relaxed">
          Starting at just <span className="font-bold text-2xl md:text-3xl lg:text-4xl">₹7/ad</span>, Go <span className="font-bold italic text-3xl md:text-3xl lg:text-4xl">BIG</span> with LED billboard advertising!
        </p>
        
        {/* Get Started Button */}
        <div className="flex justify-center">
          <button 
            onClick={handleGetStarted}
            className="bg-white text-blue-900 px-12 py-6 rounded-full font-bold text-xl md:text-2xl transition-all duration-300 shadow-2xl hover:shadow-white/25 hover:scale-105 hover:bg-blue-50"
          >
            Get Started
          </button>
        </div>
      </div>
    </section>
  );
}
