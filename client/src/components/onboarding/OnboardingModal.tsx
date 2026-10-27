import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Sparkles,
  MapPin,
  ArrowRight,
  ArrowLeft,
  X,
  Calendar,
  Wallet,
  Globe2,
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Discover places worth exploring.',
      tag: 'DISCOVER DESTINATIONS',
      description:
        'Search verified global tourist spots, ancient temples, misty mountain tea estates, and hidden waterfalls with authentic coordinates and traveler ratings.',
      icon: Compass,
      image:
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
      badge: 'Real Places Only',
    },
    {
      title: 'Turn your ideas into unforgettable trips.',
      tag: 'GROUNDED AI TRIP PLANNER',
      description:
        'Generate intelligent day-by-day itineraries tailored to your travel style, pace, and budget. Audit expenses with automatic per-person cost calculations.',
      icon: Sparkles,
      image:
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80',
      badge: 'Powered by Gemini',
    },
    {
      title: 'Explore more. Worry less.',
      tag: 'INTERACTIVE NAVIGATION',
      description:
        'Navigate interactive map markers, preview travel transit times between stops, and uncover nearby attractions wherever your journey takes you.',
      icon: Globe2,
      image:
        'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1000&q=80',
      badge: 'Interactive Maps',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('tripwise_onboarded', 'true');
    onClose();
  };

  if (!isOpen) return null;

  const current = steps[currentStep];
  const StepIcon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass-panel w-full max-w-2xl rounded-3xl sm:rounded-4xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-100 relative max-h-[90dvh] overflow-y-auto">
        {/* Skip button */}
        <button
          onClick={handleComplete}
          className="absolute top-4 right-4 z-20 p-2 rounded-full glass-panel text-slate-400 hover:text-navy-900 dark:hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Skip Onboarding"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Image Showcase */}
        <div className="relative h-44 sm:h-72 overflow-hidden bg-slate-900">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentStep}
              src={current.image}
              alt={current.title}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>

          <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-black/30 pointer-events-none" />

          {/* Badge */}
          <div className="absolute bottom-4 left-6">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-teal-500 text-navy-950 shadow-md">
              {current.badge}
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-8 space-y-5 sm:space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-wider">
                <StepIcon className="w-4 h-4" />
                <span>{current.tag}</span>
              </div>

              <h2 className="text-xl sm:text-3xl font-display font-extrabold text-navy-900 dark:text-white">
                {current.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                {current.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Step Indicator & Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            {/* Step Dots */}
            <div className="flex items-center gap-1.5">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentStep === idx
                      ? 'w-7 bg-teal-500'
                      : 'w-2 bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-300 glass-panel hover:bg-slate-100 transition-colors flex items-center gap-1 min-h-[44px]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-brand hover:opacity-95 shadow-md shadow-glow-teal flex items-center justify-center gap-1.5 transition-all min-h-[44px]"
              >
                <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Next'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
