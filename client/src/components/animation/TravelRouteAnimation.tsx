import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export const TravelRouteAnimation: React.FC<{ className?: string }> = ({
  className = 'w-72 sm:w-96 h-20',
}) => {
  const shouldReduceMotion = useReducedMotion();

  // SVG curved path representing travel trajectory
  const pathD = 'M 20 50 Q 120 15, 200 45 T 380 30';

  if (shouldReduceMotion) {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <div className="w-full h-0.5 border-t-2 border-dashed border-teal-400/50" />
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 400 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        {/* Background track line */}
        <path
          d={pathD}
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="4 6"
        />

        {/* Animated glowing dotted route line */}
        <motion.path
          d={pathD}
          stroke="url(#routeGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="6 8"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.6, delay: 0.3, ease: 'easeInOut' }}
        />

        {/* Origin Pin Marker */}
        <circle cx="20" cy="50" r="4" fill="#14B8A6" className="shadow-lg" />
        <circle cx="20" cy="50" r="8" stroke="#14B8A6" strokeWidth="1.5" opacity="0.5" />

        {/* Destination Target Marker with Pulse */}
        <circle cx="380" cy="30" r="5" fill="#F59E0B" />
        <motion.circle
          cx="380"
          cy="30"
          r="10"
          stroke="#F59E0B"
          strokeWidth="1.5"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [1, 1.8, 1], opacity: [0.8, 0, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 1.4 }}
        />

        {/* Moving Travel Airplane / Pin Icon along path */}
        <motion.g
          initial={{ offsetDistance: '0%', opacity: 0 }}
          animate={{ offsetDistance: '100%', opacity: [0, 1, 1, 1] }}
          transition={{
            duration: 1.8,
            delay: 0.3,
            ease: 'easeInOut',
          }}
          style={{
            offsetPath: `path("${pathD}")`,
            offsetRotate: 'auto',
          }}
        >
          {/* Plane / Pointer icon */}
          <g transform="translate(-10, -10)">
            <circle cx="10" cy="10" r="9" fill="#0D9488" />
            <path
              d="M 6 10 L 14 10 M 11 7 L 14 10 L 11 13"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </motion.g>

        {/* Gradient Definition */}
        <defs>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#14B8A6" />
            <stop offset="50%" stopColor="#2DD4BF" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
