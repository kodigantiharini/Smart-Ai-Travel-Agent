import React, { useState, useEffect } from 'react';
import { User, Mail, Globe, MapPin, Calendar, Compass, Shield, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [travelStyle, setTravelStyle] = useState<any>(user?.preferences?.travelStyle || 'comfort');
  const [tripsCount, setTripsCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setProfileImage(user.profileImage || '');
      setTravelStyle(user.preferences?.travelStyle || 'comfort');

      // Fetch counts
      api.getTrips().then((r) => setTripsCount(r.data?.length || 0)).catch(() => {});
      api.getFavorites().then((r) => setSavedCount(r.data?.length || 0)).catch(() => {});
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUser({
        name,
        profileImage,
        preferences: {
          currency: user?.preferences?.currency || 'USD',
          units: user?.preferences?.units || 'metric',
          travelStyle,
          interests: user?.preferences?.interests || ['scenic', 'nature'],
        },
      });
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    } catch (err) {
      console.error('Update profile failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-display font-extrabold text-navy-900 dark:text-white">
          Traveler Profile
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal identity, travel passport stats, and exploration preferences.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="glass-card p-8 rounded-4xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-6">
        <img
          src={
            profileImage ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
          }
          alt={name}
          className="w-24 h-24 rounded-full object-cover ring-4 ring-teal-500/30 shadow-xl"
        />

        <div className="text-center sm:text-left space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h2 className="text-2xl font-bold font-display text-navy-900 dark:text-white">{name}</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-600 uppercase">
              Verified Explorer
            </span>
          </div>
          <p className="text-xs text-slate-500">{user?.email}</p>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium pt-1">
            Preferred Style: <span className="capitalize font-bold text-teal-600">{travelStyle}</span>
          </p>
        </div>
      </div>

      {/* Lifetime Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 text-center">
          <Calendar className="w-6 h-6 text-teal-600 mx-auto mb-2" />
          <p className="text-3xl font-extrabold font-display text-navy-900 dark:text-white">
            {tripsCount}
          </p>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
            Trips Created
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 text-center">
          <Compass className="w-6 h-6 text-teal-600 mx-auto mb-2" />
          <p className="text-3xl font-extrabold font-display text-navy-900 dark:text-white">
            {savedCount}
          </p>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
            Saved Places
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 text-center">
          <Globe className="w-6 h-6 text-teal-600 mx-auto mb-2" />
          <p className="text-3xl font-extrabold font-display text-navy-900 dark:text-white">
            100%
          </p>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
            Grounded Places
          </p>
        </div>
      </div>

      {/* Edit Profile Form */}
      <form
        onSubmit={handleSubmit}
        className="glass-panel p-8 rounded-4xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6"
      >
        <h3 className="text-lg font-bold font-display text-navy-900 dark:text-white">
          Edit Profile Information
        </h3>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-slate-500">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-slate-500">Profile Avatar URL</label>
          <input
            type="url"
            value={profileImage}
            onChange={(e) => setProfileImage(e.target.value)}
            placeholder="https://..."
            className="w-full p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-slate-500">Travel Style</label>
          <select
            value={travelStyle}
            onChange={(e: any) => setTravelStyle(e.target.value)}
            className="w-full p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none"
          >
            <option value="budget">Budget Explorer</option>
            <option value="comfort">Comfort & Convenience</option>
            <option value="luxury">Luxury & Premium</option>
            <option value="adventure">Outdoor Adventure & Treks</option>
            <option value="cultural">Art & Cultural Heritage</option>
          </select>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          {savedNotice && (
            <span className="text-xs font-bold text-emerald-600 animate-in fade-in">
              Profile changes saved successfully!
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="ml-auto px-6 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-brand hover:opacity-95 shadow-md shadow-glow-teal flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
