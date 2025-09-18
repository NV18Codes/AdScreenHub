import { useRef, useEffect, useState } from "react";

export default function Showcase() {
  const adExamples = [
    { image: "/Ad examples-selected/Awareness Campaign.png", title: "Awareness Campaign" },
    { image: "/Ad examples-selected/Birthday.png", title: "Birthday" },
    { image: "/Ad examples-selected/Discount Promotions.png", title: "Discount Promotions" },
    { image: "/Ad examples-selected/Event.png", title: "Event" },
    { image: "/Ad examples-selected/Limited-Time Promotion.png", title: "Limited-Time Promotion" },
    { image: "/Ad examples-selected/Marketing.png", title: "Marketing" },
    { image: "/Ad examples-selected/Proposal.png", title: "Proposal" },
    { image: "/Ad examples-selected/Recognition.png", title: "Recognition" },
    { image: "/Ad examples-selected/Rememberance.png", title: "Remembrance" }
  ];

  const containerRef = useRef(null);
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const boxes = Array.from(containerRef.current.querySelectorAll(".collage-item"));
    const newPositions = boxes.map((box) => {
      const rect = box.getBoundingClientRect();
      const parentRect = containerRef.current.getBoundingClientRect();
      return {
        x: rect.left - parentRect.left + rect.width / 2,
        y: rect.top - parentRect.top + rect.height / 2,
      };
    });
    setPositions(newPositions);
  }, []);

  return (
    <section className="px-4 sm:px-6 py-16 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-8">
          Every message deserves a spotlight.
        </h2>
        
        {/* Collage container */}
         <div
           ref={containerRef}
           className="relative w-full max-w-5xl mx-auto h-[600px] sm:h-[700px] md:h-[800px] overflow-hidden px-4"
         >
          {/* SVG Connecting Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {positions.map((pos, i) =>
              positions.map((pos2, j) =>
                i < j ? (
                  <line
                    key={`${i}-${j}`}
                    x1={pos.x}
                    y1={pos.y}
                    x2={pos2.x}
                    y2={pos2.y}
                    stroke="url(#grad)"
                    strokeWidth="1.5"
                    strokeOpacity="0.3"
                  />
                ) : null
              )
            )}
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>

           {/* Collage Images */}
           {adExamples.map((ad, i) => (
             <div
               key={i}
               className="collage-item absolute aspect-square w-[100px] sm:w-[140px] md:w-[180px] group transition-transform duration-500 hover:scale-110"
               style={{
                 top: `${(i * 13) % 60 + 15}%`,
                 left: `${(i * 19) % 60 + 15}%`,
                 transform: `rotate(${i % 2 === 0 ? -6 : 6}deg)`,
                 zIndex: i % 3,
               }}
             >
              <div className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 p-1 rounded-2xl shadow-xl">
                <div className="w-full h-full bg-white rounded-xl overflow-hidden relative">
                  <img
                    src={ad.image}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error("Failed to load image:", ad.image);
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-semibold text-sm sm:text-base transition-opacity">
                    {ad.title}
                  </div>
                </div>
              </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
