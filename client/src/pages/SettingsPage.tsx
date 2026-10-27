import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sliders, Sun, Moon, Trash2, ShieldAlert, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { IntroSettings } from '../components/cinematic/IntroSettings';

export const SettingsPage: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [currency, setCurrency] = useState(user?.preferences?.currency || 'USD');
  const [units, setUnits] = useState<'metric' | 'imperial'>(user?.preferences?.units || 'metric');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUser({
        preferences: {
          currency,
          units,
          travelStyle: user?.preferences?.travelStyle || 'comfort',
          interests: user?.preferences?.interests || ['scenic'],
        },
      });
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2000);
    } catch (err) {
      console.error('Failed to update settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') {
      alert('Please type DELETE to confirm account removal.');
      return;
    }

    try {
      await api.deleteAccount();
      logout();
      navigate('/');
      alert('Your account and all associated itineraries have been permanently deleted.');
    } catch (err: any) {
      alert(`Account deletion failed: ${err.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-display font-extrabold text-navy-900 dark:text-white">
          Preferences & Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Customize currency symbols, distance measurement units, and security settings.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="glass-panel p-6 sm:p-8 rounded-4xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-xl"
      >
        <h3 className="text-lg font-bold font-display text-navy-900 dark:text-white">
          Regional & Display Settings
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-500">Default Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold focus:outline-none"
            >
              <option value="USD">USD ($) - US Dollar</option>
              <option value="INR">INR (₹) - Indian Rupee</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="GBP">GBP (£) - British Pound</option>
              <option value="JPY">JPY (¥) - Japanese Yen</option>
              <option value="AUD">AUD (A$) - Australian Dollar</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-500">Distance Units</label>
            <select
              value={units}
              onChange={(e: any) => setUnits(e.target.value)}
              className="w-full p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold focus:outline-none"
            >
              <option value="metric">Kilometers (Metric)</option>
              <option value="imperial">Miles (Imperial)</option>
            </select>
          </div>
        </div>

        {/* Theme Preference */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold uppercase text-slate-500">Theme Appearance</label>
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                theme === 'light'
                  ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Light Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                theme === 'dark'
                  ? 'border-teal-500 bg-teal-950/60 text-teal-300 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
            >
              <Moon className="w-4 h-4 text-teal-400" />
              <span>Dark Mode</span>
            </button>
          </div>
        </div>

        {/* Replay Onboarding Guide */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">Welcome Tour</p>
              <p className="text-xs text-slate-400">Replay the 3-screen animated intro onboarding tour</p>
            </div>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('tripwise_onboarded');
                window.location.reload();
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-teal-600 glass-panel hover:bg-teal-50 dark:hover:bg-teal-950/40"
            >
              Replay Tour & Splash
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          {savedNotice && (
            <span className="text-xs font-bold text-emerald-600">Preferences updated!</span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="ml-auto px-6 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-brand hover:opacity-95 shadow-md shadow-glow-teal"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* Cinematic Intro Experience Settings & Replay */}
      <IntroSettings />

      {/* Danger Zone */}
      <div className="glass-panel p-6 sm:p-8 rounded-4xl border border-rose-200 dark:border-rose-950/40 bg-rose-50/20 dark:bg-rose-950/10 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-rose-700 dark:text-rose-400">
              Danger Zone: Delete Account
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Permanently remove your account, saved itineraries, collections, and expenses.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-all"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md p-6 sm:p-8 rounded-4xl shadow-2xl border border-rose-300 dark:border-rose-900 space-y-4">
            <h3 className="text-lg font-bold font-display text-rose-600">
              Permanently Delete Account?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              This action cannot be undone. All your trips, stops, saved favorites, and financial expenses will be permanently wiped.
            </p>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Type <span className="text-rose-600 font-mono">DELETE</span> below to confirm:
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-mono focus:outline-none"
            />
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={confirmText !== 'DELETE'}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-40"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
