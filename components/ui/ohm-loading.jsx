import React, { useState, useEffect } from 'react';

const OhmLoadingAnimation = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    "Thinking...",
    "Processing...",
    "Almost there..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center gap-3 bg-black rounded-full px-4 py-2">
      <style>{`
        @keyframes draw-ohm {
          0% {
            stroke-dashoffset: 200;
            opacity: 0;
          }
          40% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
          60% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
          100% {
            stroke-dashoffset: -200;
            opacity: 0;
          }
        }
        
        .draw-animation {
          stroke-dasharray: 200;
          animation: draw-ohm 2.5s ease-in-out infinite;
        }
      `}</style>

      {/* Ohm SVG with drawing animation */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize="20"
          fontWeight="bold"
          stroke="#ffffff"
          strokeWidth="0.5"
          fill="none"
          className="draw-animation"
        >
          Ω
        </text>
      </svg>

      {/* Text pill */}
      <span className="text-sm text-white font-medium">
        {messages[messageIndex]}
      </span>
    </div>
  );
};

export default OhmLoadingAnimation;