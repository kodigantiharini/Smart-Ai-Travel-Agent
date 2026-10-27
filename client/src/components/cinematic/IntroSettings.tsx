import React, { useState, useEffect } from 'react';
import { Film, Play, RotateCcw, Volume2, Sparkles, Sliders } from 'lucide-react';

export const IntroSettings: React.FC = () => {
  const [autoPlayIntro, setAutoPlayIntro] = useState<boolean>(() => {
    return localStorage.getItem('tripwise_intro_auto_play') === 'true';
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('tripwise_sound_enabled') === 'true';
  });

  const handleToggleAutoPlay = () => {
    const nextVal = !autoPlayIntro;
    setAutoPlayIntro(nextVal);
    localStorage.setItem('tripwise_intro_auto_play', nextVal ? 'true' : 'false');
  };

  const handleToggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    localStorage.setItem('tripwise_sound_enabled', nextVal ? 'true' : 'false');
  };

  const handleReplayIntro = () => {
    // Dispatch custom event to trigger cinematic intro from App.tsx without full reload
    window.dispatchEvent(new CustomEvent('tripwise:replay-intro'));
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-4xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-amber-400 flex items-center justify-center text-white shadow-md">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display text-navy-900 dark:text-white flex items-center gap-2">
              Cinematic Intro Experience
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase font-semibold">
                3D & Sound
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hollywood-grade 3D Earth, AI neural activation, and high-altitude travel montage.
            </p>
          </div>
        </div>

        {/* Instant Replay Button */}
        <button
          type="button"
          id="replay-intro-btn"
          onClick={handleReplayIntro}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 shadow-md shadow-sky-500/20 active:scale-95 transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Replay Intro</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
        {/* Auto-play Intro toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80">
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Play on Every Launch</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Show the 3D cinematic opening when opening the app</p>
          </div>
          <button
            type="button"
            onClick={handleToggleAutoPlay}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              autoPlayIntro ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                autoPlayIntro ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Ambient Procedural Soundscape toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <Volume2 className="w-4 h-4 text-emerald-500" />
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Soundscape Enabled</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Web Audio procedural synth chimes and drones</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleSound}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              soundEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                soundEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
