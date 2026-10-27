import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { AnimatedLogo } from './AnimatedLogo';
import { TravelRouteAnimation } from './TravelRouteAnimation';

interface SplashScreenProps {
  onComplete: () => void;
  minDurationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  minDurationMs = 2100,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [bgLoaded, setBgLoaded] = useState(false);

  // High-resolution atmospheric mountain sunrise landscape
  const scenicBgUrl =
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=80';

  useEffect(() => {
    // Preload image in memory
    const img = new Image();
    img.src = scenicBgUrl;
    img.onload = () => setBgLoaded(true);
    img.onerror = () => setBgLoaded(true); // Graceful fallback to dark gradient

    // Timer to automatically transition into the application
    const timer = setTimeout(() => {
      onComplete();
    }, minDurationMs);

    return () => clearTimeout(timer);
  }, [minDurationMs, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-navy-950 text-white select-none"
    >
      {/* Background Scenic Image with Cinematic Zoom */}
      <motion.div
        initial={shouldReduceMotion ? { scale: 1, opacity: 0.7 } : { scale: 1, opacity: 0.3 }}
        animate={
          shouldReduceMotion
            ? { opacity: 0.7 }
            : {
                scale: 1.08,
                opacity: 0.6,
              }
        }
        transition={{ duration: 7, ease: 'easeOut' }}
        className="absolute inset-0 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage: `url(${scenicBgUrl})`,
        }}
      />

      {/* Atmospheric Vignette & Deep Navy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950/85 via-navy-950/75 to-navy-950/95 pointer-events-none" />

      {/* Subtle Aurora Ambient Light */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-teal-500/15 blur-[120px] rounded-full pointer-events-none" />

      {/* Skip Button for Instant Navigation */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        whileHover={{ opacity: 1 }}
        onClick={onComplete}
        className="absolute top-6 right-6 px-4 py-1.5 rounded-full glass-panel text-xs font-semibold tracking-wider uppercase text-slate-300 hover:text-white transition-all z-20 flex items-center gap-1.5"
      >
        <span>Skip</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </motion.button>

      {/* Center Animated Brand Showcase */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-lg space-y-5">
        {/* Animated Compass Logo */}
        <AnimatedLogo size="xl" />

        {/* Brand Name with Staggered Reveal */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}
          className="space-y-1"
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl sm:text-5xl font-display font-black tracking-tight text-white drop-shadow-md">
              TripWise
            </span>
            <span className="text-4xl sm:text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400 drop-shadow-md">
              AI
            </span>
          </div>

          <motion.p
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
            className="text-sm sm:text-base font-medium tracking-wide text-slate-300 italic"
          >
            "Your journey. Your story."
          </motion.p>
        </motion.div>

        {/* Animated Flight / Route Path */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="w-full flex justify-center py-2"
        >
          <TravelRouteAnimation className="w-64 sm:w-80 h-16" />
        </motion.div>

        {/* Micro Loading Progress Line */}
        <div className="w-44 h-1 bg-white/10 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: (minDurationMs - 300) / 1000, ease: 'easeInOut' }}
            className="h-full bg-gradient-to-r from-teal-400 via-emerald-400 to-amber-400 rounded-full"
          />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.7 }}
          className="text-[11px] font-semibold uppercase tracking-widest text-slate-400"
        >
          Preparing verified destinations...
        </motion.p>
      </div>

      {/* Bottom Footer Attribution */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-6 text-[10px] tracking-wider uppercase text-slate-500 font-semibold"
      >
        Intelligent Luxury Travel
      </motion.div>
    </motion.div>
  );
};
