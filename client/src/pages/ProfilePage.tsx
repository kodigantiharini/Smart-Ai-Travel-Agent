import React, { useState, useEffect } from 'react';
import { User, Mail, Globe, MapPin, Calendar, Compass, Shield, Save, Users, Heart, MessageCircle, Sparkles, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { UserStats, TravelStory } from '../types';
import { Link } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [travelStyle, setTravelStyle] = useState<any>(user?.preferences?.travelStyle || 'comfort');
  const [stats, setStats] = useState<UserStats | null>(null);
  const [myStories, setMyStories] = useState<TravelStory[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'stories'>('profile');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setProfileImage(user.profileImage || '');
      setTravelStyle(user.preferences?.travelStyle || 'comfort');

      // Fetch stats
      api.getUserStats().then((r) => {
        if (r.data) setStats(r.data);
      }).catch(console.warn);

      // Fetch my stories
      api.getStories().then((r) => {
        if (r.data) {
          const myId = user.id || (user as any)._id;
          setMyStories(r.data.filter((s) => s.authorId === myId));
        }
      }).catch(console.warn);
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
          className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-500/30 shadow-xl"
        />

        <div className="text-center sm:text-left space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h2 className="text-2xl font-bold font-display text-navy-900 dark:text-white">{name}</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 uppercase border border-blue-200 dark:border-blue-800">
              MiVoyage Explorer
            </span>
          </div>
          <p className="text-xs text-slate-500">{user?.email}</p>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium pt-1">
            Preferred Style: <span className="capitalize font-bold text-blue-600">{travelStyle}</span>
          </p>
        </div>
      </div>

      {/* MiVoyage Lifetime Passport Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 text-center">
          <Calendar className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
          <p className="text-2xl sm:text-3xl font-extrabold font-display text-navy-900 dark:text-white">
            {stats?.tripsCount || 0}
          </p>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            Trips Planned
          </p>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 text-center">
          <Globe className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
          <p className="text-2xl sm:text-3xl font-extrabold font-display text-navy-900 dark:text-white">
            {stats?.destinationsCount || 0}
          </p>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            Destinations
          </p>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 text-center">
          <Users className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
          <p className="text-2xl sm:text-3xl font-extrabold font-display text-navy-900 dark:text-white">
            {stats?.companionsCount || 0}
          </p>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            Travel Companions
          </p>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 text-center">
          <Sparkles className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
          <p className="text-2xl sm:text-3xl font-extrabold font-display text-navy-900 dark:text-white">
            {stats?.storiesSharedCount || myStories.length}
          </p>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            Stories Shared
          </p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          Edit Profile Information
        </button>
        <button
          onClick={() => setActiveTab('stories')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'stories'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          My Travel Stories ({myStories.length})
        </button>
      </div>

      {/* Tab 1: Edit Profile */}
      {activeTab === 'profile' && (
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
              className="ml-auto px-6 py-2.5 rounded-2xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: My Travel Stories */}
      {activeTab === 'stories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Moments Shared with the MiVoyage Community
            </h3>
            <Link
              to="/community"
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <Plus size={13} />
              <span>New Story</span>
            </Link>
          </div>

          {myStories.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
              <Sparkles size={32} className="mx-auto text-blue-500 opacity-60" />
              <p className="text-sm font-bold text-slate-800 dark:text-white">No stories shared yet</p>
              <p className="text-xs text-slate-500">Share your favorite travel memories, tips, and photos with the community!</p>
              <Link
                to="/community"
                className="inline-block mt-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                Go to Community Feed
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myStories.map((story) => (
                <div
                  key={story._id || story.id}
                  className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden p-4 space-y-2 shadow-xs"
                >
                  <img
                    src={story.photos?.[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80'}
                    alt={story.title}
                    className="w-full h-36 rounded-2xl object-cover"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="capitalize font-bold text-blue-600">{story.category}</span>
                    <span>{story.destination}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{story.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1"><Heart size={12} className="text-rose-500 fill-rose-500" /> {story.likes?.length || 0}</span>
                    <span className="flex items-center gap-1"><MessageCircle size={12} /> {story.comments?.length || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
