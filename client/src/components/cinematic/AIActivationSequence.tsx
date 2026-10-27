import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Compass, Sparkles, Cpu, Globe } from 'lucide-react';

export const AIActivationSequence: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
      {/* Outer Cyan Futuristic Holographic Energy Ring */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: [0.75, 1.05, 0.98], opacity: [0, 0.8, 0.6] }}
        transition={{ duration: 1.8, ease: 'easeOut' }}
        className="absolute w-[440px] h-[440px] sm:w-[540px] sm:h-[540px] rounded-full border border-teal-400/40 border-dashed"
      />

      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[470px] h-[470px] sm:w-[580px] sm:h-[580px] rounded-full border border-teal-500/20"
      >
        {/* Radar Scanner Sweep Line */}
        <div className="absolute top-0 left-1/2 w-0.5 h-1/2 bg-gradient-to-t from-transparent via-teal-400/60 to-teal-300 origin-bottom transform -translate-x-1/2" />
      </motion.div>

      {/* Center Neural AI Particle Condensation Badge */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 0 } : { scale: 0.2, opacity: 0 }}
        animate={shouldReduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4, type: 'spring', stiffness: 220, damping: 20 }}
        className="relative mb-6"
      >
        <div className="w-20 h-20 rounded-3xl bg-gradient-brand flex items-center justify-center text-white shadow-[0_0_50px_rgba(20,184,166,0.6)] border border-teal-200/50">
          <Compass className="w-10 h-10 animate-pulse text-white" />
        </div>

        {/* Ambient Ring Glow */}
        <motion.div
          animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0.2, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -inset-3 rounded-full border-2 border-teal-400/40"
        />
      </motion.div>

      {/* Cinematic Headline & AI Awakening Tagline */}
      <div className="text-center space-y-2 px-4 max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-950/70 border border-teal-500/40 text-teal-300 text-xs font-bold uppercase tracking-widest backdrop-blur-md shadow-lg"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Global Neural Travel Mesh Active</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.8 }}
          className="text-4xl sm:text-6xl font-display font-black tracking-tight drop-shadow-2xl"
        >
          <span className="text-white">TRIPWISE </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-amber-300">
            AI
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="text-sm sm:text-lg font-medium text-slate-300 italic tracking-wide"
        >
          "Intelligence meets adventure."
        </motion.p>
      </div>
    </div>
  );
};
