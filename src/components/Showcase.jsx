export default function Showcase() {
  const circularContent = [
    "Awareness",
    "Promotion/Sale", 
    "Celebration/Occasion",
    "Recognition"
  ];

  const rectangularContent = [
    "Birthday",
    "Product/Store Launch",
    "Event"
  ];

  return (
    <section className="px-8 py-20 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="/Banner.png" 
          alt="Showcase Background" 
          className="w-full h-full object-cover opacity-5"
          onError={(e) => {
            console.error('Failed to load Banner.png');
            e.target.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-white bg-opacity-95"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <h2 className="section-heading mb-16">
          Every message deserves a spotlight.
        </h2>
        
        <div className="relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 transform rotate-12 scale-150"></div>
          </div>
          
          {/* Creative Diagonal Layout */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 relative z-10">
            {circularContent.map((content, index) => (
              <div 
                key={index} 
                className={`relative transform ${
                  index === 0 ? 'rotate-12 translate-y-6 -translate-x-2' : 
                  index === 1 ? '-rotate-12 -translate-y-6 translate-x-2' : 
                  index === 2 ? 'rotate-6 translate-y-3 -translate-x-1' : 
                  '-rotate-6 -translate-y-3 translate-x-1'
                } transition-all duration-500 hover:scale-110 hover:rotate-0 hover:translate-y-0 hover:translate-x-0`}
              >
                <div className="w-32 h-32 md:w-44 md:h-44 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                  <div className="text-center text-white font-bold text-sm md:text-base px-2 relative z-10 group-hover:scale-110 transition-transform duration-300">
                    {content}
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-white/30 group-hover:border-white/60 transition-colors duration-300"></div>
                </div>
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white rounded-full shadow-xl border-2 border-gray-200"></div>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
            ))}
          </div>

          {/* Enhanced Diagonal Connector Lines */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent transform -rotate-12 scale-110"></div>
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-400/30 to-transparent transform rotate-12 scale-110"></div>
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-pink-400/20 to-transparent transform rotate-6 scale-105"></div>

          {/* Rectangular Content in Enhanced Diagonal Pattern */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {rectangularContent.map((content, index) => (
              <div 
                key={index} 
                className={`transform ${
                  index === 0 ? 'rotate-6 translate-y-4 -translate-x-2' : 
                  index === 1 ? '-rotate-3 -translate-y-2 translate-x-1' : 
                  'rotate-2 translate-y-6 -translate-x-1'
                } transition-all duration-500 hover:scale-105 hover:rotate-0 hover:translate-y-0 hover:translate-x-0`}
              >
                <div className="h-28 md:h-36 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-xl border-3 border-white relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                  <div className="text-center text-white font-bold text-lg md:text-xl px-4 relative z-10 group-hover:scale-105 transition-transform duration-300">
                    {content}
                  </div>
                  <div className="absolute inset-0 rounded-2xl border-2 border-white/30 group-hover:border-white/60 transition-colors duration-300"></div>
                </div>
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-white rounded-full shadow-lg border-2 border-gray-200"></div>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
              </div>
            ))}
          </div>

          {/* Enhanced Floating Elements */}
          <div className="absolute top-8 right-12 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full opacity-70 animate-pulse shadow-lg"></div>
          <div className="absolute bottom-24 left-20 w-6 h-6 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full opacity-70 animate-pulse delay-1000 shadow-lg"></div>
          <div className="absolute top-1/3 left-12 w-4 h-4 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full opacity-70 animate-pulse delay-500 shadow-lg"></div>
          <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full opacity-60 animate-pulse delay-700 shadow-md"></div>
          <div className="absolute bottom-1/3 right-8 w-5 h-5 bg-gradient-to-br from-purple-400 to-violet-400 rounded-full opacity-60 animate-pulse delay-300 shadow-lg"></div>
        </div>
      </div>
    </section>
  );
}
