import React from 'react';
import { motion } from 'framer-motion';
import { Compass, RefreshCw, AlertCircle } from 'lucide-react';

interface AppLoadingScreenProps {
  error?: string | null;
  onRetry?: () => void;
}

export const AppLoadingScreen: React.FC<AppLoadingScreenProps> = ({ error, onRetry }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 dark:bg-navy-950 p-6 text-center">
      {error ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md glass-panel p-8 rounded-4xl border border-rose-300 dark:border-rose-900 space-y-4 shadow-2xl"
        >
          <div className="w-14 h-14 rounded-3xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold font-display text-navy-900 dark:text-white">
            Connection Interrupted
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-brand shadow-md flex items-center gap-2 mx-auto mt-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-brand flex items-center justify-center text-white shadow-xl mx-auto animate-pulse">
            <Compass className="w-8 h-8 animate-spin" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-teal-600">
            Initializing TripWise AI...
          </p>
        </div>
      )}
    </div>
  );
};
