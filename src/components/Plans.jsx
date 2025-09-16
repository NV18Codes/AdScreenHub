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
    <section className="px-8 py-24 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-20">Our Plans</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <div key={i} className="bg-blue-900 text-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
              <h3 className="text-2xl md:text-3xl font-bold text-center mb-8 text-white">{plan.name}</h3>
              <div className="text-center mb-8">
                <p className="text-white text-xl font-semibold">{plan.duration}</p>
              </div>
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="text-white text-center text-lg">
                    • {feature}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
