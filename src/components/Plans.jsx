
const plans = [
  {
    name: "SPARK",
    price: "₹4,999",
    duration: "1 day",
    features: ["700 ad slots (10 sec/slot)", "1 day power play", "Quick visibility", "Occasion Focussed", "Moment Centric"],
  },
  {
    name: "IMPACT",
    price: "₹13,999",
    duration: "3 days",
    features: ["2100 ad slots (10 sec/slot)", "3 day rapid reach", "Awareness Booster", "Momentum Gainer", "Weekend Blitz"],
  },
  {
    name: "THRIVE",
    price: "₹22,999",
    duration: "5 days",
    features: ["3500 ad slots (10 sec/slot)", "5 day peak push", "Increased Exposure", "Lasting Recall", "Brand Amplification"],
  },
];

export default function Plans() {
  return (
    <section className="px-8 py-16 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-12">Our Plans</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <div key={i} className="relative overflow-hidden rounded-xl transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
              {/* Banner.png Background */}
              <div className="absolute inset-0">
                <img 
                  src="/Banner.png" 
                  alt="Plan Background" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Failed to load Banner.png');
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              
              {/* Content */}
              <div className="relative z-10 text-white p-8 text-center">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">{plan.name}</h3>
                
                {/* Pricing Section */}
                <div className="mb-6">
                  <div className="text-blue-200 text-sm font-medium mb-1">Starting @</div>
                  <div className="text-4xl md:text-5xl font-bold mb-1">{plan.price}</div>
                  <div className="text-blue-200 text-sm font-medium">+GST</div>
                </div>
                
                {/* Features */}
                <div className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="text-white text-sm">
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
