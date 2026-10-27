import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, Sparkles, MapPin, ArrowRight } from 'lucide-react';

interface TripWiseLogoRevealProps {
  onExplore: () => void;
}

export const TripWiseLogoReveal: React.FC<TripWiseLogoRevealProps> = ({ onExplore }) => {
  const [pinProgress, setPinProgress] = useState(0);

  useEffect(() => {
    // Animate location pin traveling along the orbital path
    const interval = setInterval(() => {
      setPinProgress((prev) => (prev + 0.015) % 1);
    }, 16);
    return () => clearInterval(interval);
  }, []);

  // Parametric ellipse calculation for the orbiting pin
  // Center is (250, 150), rx = 160, ry = 65, rotated by -15 deg
  const angle = pinProgress * Math.PI * 2;
  const rx = 160;
  const ry = 62;
  const tilt = -12 * (Math.PI / 180);
  const rawX = rx * Math.cos(angle);
  const rawY = ry * Math.sin(angle);
  const pinX = 250 + (rawX * Math.cos(tilt) - rawY * Math.sin(tilt));
  const pinY = 150 + (rawX * Math.sin(tilt) + rawY * Math.cos(tilt));

  return (
    <div className="relative z-20 flex flex-col items-center justify-center min-h-[620px] px-4 select-none">
      {/* Volumetric Radial Light Burst behind Logo */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: [0, 1.4, 1.1],
          opacity: [0, 0.9, 0.45],
        }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute w-[480px] h-[480px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(14,165,233,0.35) 0%, rgba(217,119,6,0.2) 40%, rgba(99,102,241,0.1) 65%, transparent 75%)',
          filter: 'blur(36px)',
        }}
      />

      {/* Secondary Golden Flare Pulse */}
      <motion.div
        initial={{ opacity: 0, scale: 0.2 }}
        animate={{ opacity: [0, 0.7, 0.2], scale: [0.2, 1.2, 1] }}
        transition={{ duration: 2.2, ease: 'easeOut', delay: 0.3 }}
        className="absolute w-72 h-72 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(251,191,36,0.4) 0%, rgba(245,158,11,0.15) 50%, transparent 80%)',
          filter: 'blur(24px)',
        }}
      />

      {/* Orbiting Route Vector & Traveling Location Pin */}
      <div className="relative w-[500px] max-w-full h-[300px] flex items-center justify-center">
        <svg
          viewBox="0 0 500 300"
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
        >
          <defs>
            <linearGradient id="orbitalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.3" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Elliptical Travel Orbit Path */}
          <motion.ellipse
            cx="250"
            cy="150"
            rx="160"
            ry="62"
            transform="rotate(-12 250 150)"
            fill="none"
            stroke="url(#orbitalGrad)"
            strokeWidth="2.5"
            strokeDasharray="6 8"
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.6, ease: 'easeInOut' }}
          />

          {/* Traveling Flight Arc Waypoint Particles */}
          <circle cx="160" cy="130" r="2.5" fill="#38bdf8" opacity="0.6" />
          <circle cx="340" cy="170" r="2.5" fill="#f59e0b" opacity="0.6" />
          <circle cx="280" cy="100" r="2" fill="#a78bfa" opacity="0.6" />

          {/* Dynamic Traveling Location Pin Marker on Orbit */}
          <g transform={`translate(${pinX}, ${pinY})`}>
            <circle r="7" fill="#f59e0b" opacity="0.3" className="animate-ping" />
            <circle r="4" fill="#fbbf24" filter="url(#glow)" />
            <circle r="1.8" fill="#ffffff" />
          </g>
        </svg>

        {/* Central TripWise AI Core Emblem with Light Burst */}
        <motion.div
          initial={{ scale: 0.4, opacity: 0, rotate: -25 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{
            duration: 1.2,
            delay: 0.35,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-3xl p-[2px] shadow-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #38bdf8 0%, #f59e0b 50%, #818cf8 100%)',
            boxShadow: '0 0 50px rgba(56,189,248,0.45), 0 0 100px rgba(245,158,11,0.25)',
          }}
        >
          {/* Inner Glass Core */}
          <div className="w-full h-full rounded-[22px] bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center relative overflow-hidden group">
            {/* Shimmer light reflection across emblem */}
            <motion.div
              animate={{ x: ['-120%', '150%'] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none"
            />

            <Compass className="w-12 h-12 sm:w-14 sm:h-14 text-amber-400 drop-shadow-[0_0_18px_rgba(245,158,11,0.8)]" />

            <div className="absolute -bottom-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8]" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Brand Title & Cinematic Tagline */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.8, ease: 'easeOut' }}
        className="text-center mt-4 max-w-xl"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-300 text-xs font-medium tracking-widest uppercase mb-3 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
          The Future of Intelligent Exploration
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-100 to-amber-200 drop-shadow-[0_2px_12px_rgba(255,255,255,0.2)]">
            TripWise
          </span>{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.4)]">
            AI
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.2 }}
          className="mt-3 text-base sm:text-lg text-slate-300 font-light tracking-wide italic font-serif"
        >
          &ldquo;Discover places. Create memories. Travel smarter.&rdquo;
        </motion.p>
      </motion.div>

      {/* Grand CTA: "EXPLORE THE WORLD →" with Moving Light Highlight */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.6, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 flex flex-col sm:flex-row items-center gap-4"
      >
        <button
          id="intro-explore-btn"
          onClick={onExplore}
          className="relative group px-8 py-4 rounded-2xl overflow-hidden font-semibold text-white tracking-widest uppercase text-xs sm:text-sm shadow-2xl transition-all duration-300 transform active:scale-95 hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 40%, #d97706 100%)',
            boxShadow: '0 0 35px rgba(14,165,233,0.4), 0 0 70px rgba(245,158,11,0.25)',
          }}
        >
          {/* Moving Light Highlight Sweep Animation */}
          <motion.div
            animate={{
              x: ['-140%', '220%'],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: 'easeInOut',
              repeatDelay: 0.6,
            }}
            className="absolute inset-0 w-2/3 bg-gradient-to-r from-transparent via-white/35 to-transparent skew-x-12 pointer-events-none"
          />

          {/* Golden Glow Border Hover Effect */}
          <span className="absolute inset-0 rounded-2xl border border-white/30 group-hover:border-amber-300/80 transition-colors pointer-events-none" />

          <div className="relative flex items-center gap-3">
            <Compass className="w-5 h-5 text-amber-300 group-hover:rotate-45 transition-transform duration-500" />
            <span>Explore the World</span>
            <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1.5 transition-transform duration-300" />
          </div>
        </button>
      </motion.div>

      {/* Floating Network Route Accent */}
      <div className="mt-6 flex items-center gap-2 text-xs text-slate-500 font-mono tracking-wider">
        <MapPin className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
        <span>PARIS • BALI • TOKYO • EVEREST • NEW YORK</span>
      </div>
    </div>
  );
};
