import React, { useRef, useEffect, useState } from 'react';

// Using inline SVG icons for better customization
const MapPinIcon = () => (
  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);

const PlanIcon = () => (
  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
  </svg>
);

const UploadIcon = () => (
  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
  </svg>
);

const ApproveIcon = () => (
  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

const ScreenIcon = () => (
  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
    <path d="M4 6h16v10H4V6zm2 2v6h12V8H6zm6 8l2 2H10l2-2z"/>
  </svg>
);

const steps = [
  { 
    icon: MapPinIcon, 
    text: "SELECT DATE & LOCATION",
    description: "Choose when and where you want your ad to appear"
  },
  { 
    icon: PlanIcon, 
    text: "CHOOSE EXPOSURE PLAN",
    description: "Select the right plan for your campaign goals"
  },
  { 
    icon: UploadIcon, 
    text: "UPLOAD YOUR DESIGN",
    description: "Upload your creative content in the required format"
  },
  { 
    icon: ApproveIcon, 
    text: "GET YOUR DESIGN APPROVED",
    description: "Our team reviews and approves your content"
  },
  { 
    icon: ScreenIcon, 
    text: "MAKE YOURSELF KNOWN",
    description: "Your ad goes live on our LED screens"
  },
];

export default function Steps() {
  const videoRef = useRef(null);
  const [videoError, setVideoError] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (videoRef.current) {
            if (entry.isIntersecting) {
              // Video is visible - don't autoplay, let user control
            } else {
              // Video is not visible - pause it
              videoRef.current.pause();
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);

  return (
    <section className="px-8 py-16 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Steps */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12 text-center lg:text-left">How to get started</h2>
            <div className="space-y-8">
              {steps.map((step, i) => (
                <div key={i} className="flex items-start space-x-6">
                  <div className="flex-shrink-0 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white">
                    <step.icon />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-blue-900 text-xl">{step.text}</h3>
                    <p className="text-gray-600 mt-2 text-lg">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Video */}
          <div className="lg:pl-8 flex flex-col justify-center h-full">
            <p className="text-gray-700 text-xl mb-10 font-medium italic text-center lg:text-left">
              AS EASY AS ADDING A PRODUCT TO CART — RENT OUR LED SCREENS IN MINUTES.
            </p>
            <div className="relative rounded-xl overflow-hidden shadow-2xl" style={{ minHeight: '500px' }}>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                controls
                playsInline
                preload="metadata"
                poster="/Banner.png"
                style={{ minHeight: '500px' }}
                muted={false}
                autoPlay={false}
                onLoadStart={() => {
                  console.log('Video loading started');
                  setVideoLoading(true);
                  setVideoError(false);
                }}
                onLoadedData={() => {
                  console.log('Video data loaded');
                  setVideoLoading(false);
                }}
                onCanPlay={() => {
                  console.log('Video can play');
                  setVideoLoading(false);
                }}
                onCanPlayThrough={() => {
                  console.log('Video can play through');
                  setVideoLoading(false);
                }}
                onPlay={() => console.log('Video started playing')}
                onPause={() => console.log('Video paused')}
                onProgress={() => console.log('Video loading progress')}
                onError={(e) => {
                  console.error('Video error:', e);
                  console.error('Video src:', e.target.src);
                  console.error('Video error details:', e.target.error);
                  console.error('Video network state:', e.target.networkState);
                  console.error('Video ready state:', e.target.readyState);
                  setVideoError(true);
                  setVideoLoading(false);
                }}
              >
                <source src="/About AdScreenHub.mp4" type="video/mp4; codecs=avc1.42E01E,mp4a.40.2" />
                <source src="./About AdScreenHub.mp4" type="video/mp4" />
                <div style={{ 
                  padding: '2rem', 
                  textAlign: 'center', 
                  background: '#f3f4f6',
                  color: '#6b7280',
                  minHeight: '500px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}>
                  {videoLoading && (
                    <>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                      <p>Loading video...</p>
                    </>
                  )}
                  {videoError && (
                    <>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
                      <p>Video failed to load</p>
                      <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Please try refreshing the page</p>
                    </>
                  )}
                  {!videoLoading && !videoError && (
                    <>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎥</div>
                      <p>About AdScreenHub Video</p>
                      <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Click play to watch</p>
                    </>
                  )}
                </div>
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
