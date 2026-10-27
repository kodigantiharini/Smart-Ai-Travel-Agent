import React from 'react';
import { motion } from 'framer-motion';

interface IntroTransitionProps {
  isActive: boolean;
  onAnimationComplete?: () => void;
  children?: React.ReactNode;
}

export const IntroTransition: React.FC<IntroTransitionProps> = ({
  isActive,
  onAnimationComplete,
  children,
}) => {
  if (!isActive) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0.85 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onAnimationComplete={onAnimationComplete}
      className="w-full min-h-screen"
    >
      {children}
    </motion.div>
  );
};
