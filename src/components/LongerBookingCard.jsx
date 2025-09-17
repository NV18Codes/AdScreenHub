export default function LongerBookingCard({ className = "", variant = "default" }) {
  const handleContactClick = () => {
    // Navigate to contact form
    window.location.href = '/contact';
  };

  if (variant === "footer") {
    return (
      <div className="bg-white bg-opacity-10 rounded-lg p-4 w-full max-w-sm">
        <h4 className="text-white font-semibold mb-2">Looking for a longer booking?</h4>
        <p className="text-white text-opacity-80 text-sm mb-3">
          Want to run a long-term campaign? Our team can create a solution just for you.
        </p>
        <button 
          onClick={handleContactClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full"
        >
          CONTACT US
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-slate-700 rounded-2xl p-6 shadow-xl ${className}`}>
      <h3 className="text-white text-xl font-semibold mb-3">Looking for a longer booking?</h3>
      <p className="text-slate-300 text-sm mb-4">
        Want to run a long-term campaign? Our team can create a solution just for you.
      </p>
      <button 
        onClick={handleContactClick}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
      >
        CONTACT US
      </button>
    </div>
  );
}
