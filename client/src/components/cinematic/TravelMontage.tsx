import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Mountain, Waves, Building2, MapPin } from 'lucide-react';

interface MontageScene {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  image: string;
  icon: any;
  accent: string;
}

const SCENES: MontageScene[] = [
  {
    id: 'mountains',
    title: 'Into the Mountains',
    subtitle: 'Golden sunrise mist over Himalayan ridges',
    location: 'Himalayas & Western Ghats',
    image:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80',
    icon: Mountain,
    accent: '#F59E0B',
  },
  {
    id: 'ocean',
    title: 'Across the Ocean',
    subtitle: 'Turquoise waters and secluded island sanctuaries',
    location: 'Tropical Atolls & Bali Coast',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80',
    icon: Waves,
    accent: '#14B8A6',
  },
  {
    id: 'city',
    title: 'Into the City',
    subtitle: 'Illuminated boulevards and blue-hour monuments',
    location: 'Paris & Tokyo Metropolises',
    image:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=2000&q=80',
    icon: Building2,
    accent: '#A855F7',
  },
];

export const TravelMontage: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [sceneIndex, setSceneIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    // Each scene displays for ~1.7s
    const timer = setInterval(() => {
      setSceneIndex((prev) => {
        if (prev < SCENES.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          onComplete?.();
          return prev;
        }
      });
    }, 1800);

    return () => clearInterval(timer);
  }, [onComplete]);

  const current = SCENES[sceneIndex];
  const Icon = current.icon;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center overflow-hidden bg-navy-950">
      {/* Cinematic Film Letterbox Bars */}
      <div className="absolute top-0 left-0 right-0 h-10 sm:h-14 bg-black z-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-10 sm:h-14 bg-black z-40 pointer-events-none" />

      {/* Cross-fading Scene Images with Ken Burns Parallax Zoom */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.65, ease: 'easeInOut' }}
          className="absolute inset-0 overflow-hidden"
        >
          <motion.div
            initial={shouldReduceMotion ? { scale: 1 } : { scale: 1.02 }}
            animate={shouldReduceMotion ? { scale: 1 } : { scale: 1.12 }}
            transition={{ duration: 2.2, ease: 'easeOut' }}
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${current.image})` }}
          />

          {/* Vignette & Contrast Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/30 to-black/60 pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      {/* Scene Caption Overlay */}
      <div className="relative z-30 max-w-2xl text-center px-6 space-y-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5 }}
            className="space-y-2"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-widest text-slate-200">
              <Icon className="w-4 h-4" style={{ color: current.accent }} />
              <span>{current.location}</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight drop-shadow-xl">
              {current.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-md mx-auto drop-shadow-md">
              {current.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Scene Timeline Indicators */}
      <div className="absolute bottom-16 sm:bottom-20 z-40 flex items-center gap-2">
        {SCENES.map((s, idx) => (
          <div
            key={s.id}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              sceneIndex === idx ? 'w-8 bg-teal-400' : 'w-2 bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
