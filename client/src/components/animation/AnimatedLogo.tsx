import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Compass, Sparkles } from 'lucide-react';

interface AnimatedLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({
  size = 'lg',
  showBadge = true,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24',
  }[size];

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  }[size];

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Outer ambient glow ring */}
      <motion.div
        animate={
          shouldReduceMotion
            ? { opacity: 0.6 }
            : {
                scale: [1, 1.15, 1],
                opacity: [0.4, 0.75, 0.4],
              }
        }
        transition={{
          duration: 2.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 -m-3 rounded-3xl bg-teal-500/25 blur-xl pointer-events-none"
      />

      {/* Main Gradient Badge */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 0 } : { scale: 0.7, opacity: 0, rotate: -15 }}
        animate={shouldReduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`${sizeClasses} rounded-3xl bg-gradient-brand flex items-center justify-center text-white shadow-2xl shadow-teal-500/40 relative z-10 border border-teal-300/30`}
      >
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  rotate: [0, 8, -8, 0],
                }
          }
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Compass className={iconSizes} />
        </motion.div>

        {showBadge && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 400, damping: 15 }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-navy-950 flex items-center justify-center shadow-md ring-2 ring-navy-900"
          >
            <Sparkles className="w-3 h-3 fill-navy-950" />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
