import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, ArrowRight, Sparkles, Globe } from 'lucide-react';

interface CinematicIntroProps {
  onComplete: () => void;
  isReplay?: boolean;
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete, isReplay = false }) => {
  const [isDismissing, setIsDismissing] = useState(false);

  const handleEnter = () => {
    if (isDismissing) return;
    setIsDismissing(true);
    setTimeout(() => {
      onComplete();
    }, 400);
  };

  // Automatically transition comfortably after a gentle, short moment
  useEffect(() => {
    const timer = setTimeout(() => {
      handleEnter();
    }, 1800);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        handleEnter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isDismissing && (
        <motion.div
          id="cinematic-intro-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35, ease: 'easeOut' } }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-slate-950 text-white select-none overflow-hidden"
          style={{
            background: 'radial-gradient(ellipse at 50% 40%, #0f172a 0%, #020617 75%, #000000 100%)',
          }}
        >
          {/* Subtle Soothing Ambient Glow */}
          <div className="absolute w-[460px] h-[460px] rounded-full bg-teal-500/10 blur-[100px] pointer-events-none top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2" />

          {/* Top Bar with Clean Spacious Skip Button */}
          <div className="w-full max-w-5xl flex items-center justify-between relative z-10 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-slate-400">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>TRIPWISE AI • GLOBAL TRAVEL</span>
            </div>

            <button
              id="skip-intro-btn"
              onClick={handleEnter}
              className="px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white border border-slate-700/60 transition-all flex items-center gap-2 active:scale-95"
            >
              <span>Skip Intro</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Center Brand Identity - Gentle, Calm, and Luxurious */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center relative z-10 max-w-lg space-y-6"
          >
            {/* Emblem */}
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-teal-500 via-sky-500 to-amber-400 p-[2px] shadow-2xl shadow-teal-500/20">
              <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center">
                <Compass className="w-10 h-10 text-teal-400" />
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                <span className="text-white">TripWise</span>{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-amber-300">
                  AI
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 font-normal">
                Discover places. Create memories. Travel smarter.
              </p>
            </div>

            {/* Clean, Spacious Action Button */}
            <div className="pt-2">
              <button
                id="intro-explore-btn"
                onClick={handleEnter}
                className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-sky-600 hover:from-teal-400 hover:to-sky-500 text-white font-semibold text-sm shadow-xl shadow-teal-500/25 flex items-center gap-3 transition-all duration-200 hover:scale-[1.02] active:scale-98"
              >
                <Globe className="w-4 h-4" />
                <span>Explore the World</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Bottom Clean Status Note */}
          <div className="text-center relative z-10 pb-2">
            <p className="text-xs text-slate-500 font-mono">
              Over 100+ destinations worldwide • AI-powered concierge
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
