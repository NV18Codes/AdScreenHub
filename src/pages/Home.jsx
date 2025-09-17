import React, { useEffect } from 'react';
import Hero from '../components/Hero';
import Steps from '../components/Steps';
import About from '../components/About';
import Plans from '../components/Plans';
import Showcase from '../components/Showcase';

export default function Home() {
  useEffect(() => {
    // Handle hash navigation
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash) {
        const element = document.getElementById(hash);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }
    };

    // Check for hash on mount
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return (
    <div>
      <Hero />
      <div id="how-it-works">
        <Steps />
      </div>
      <div id="showcase">
        <Showcase />
      </div>
      <div id="about">
        <About />
      </div>
      <div id="pricing">
        <Plans />
      </div>
    </div>
  );
}
