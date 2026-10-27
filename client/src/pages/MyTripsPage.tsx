import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Plus,
  MapPin,
  Clock,
  Copy,
  Trash2,
  Archive,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Trip } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const MyTripsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Trip form state
  const [newTripName, setNewTripName] = useState('');
  const [newTripDestination, setNewTripDestination] = useState('');
  const [newTripStart, setNewTripStart] = useState('2026-12-01');
  const [newTripEnd, setNewTripEnd] = useState('2026-12-05');
  const [newTripTravelers, setNewTripTravelers] = useState(2);
  const [newTripBudget, setNewTripBudget] = useState(1000);
  const [newTripCurrency, setNewTripCurrency] = useState('USD');
  const [creating, setCreating] = useState(false);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await api.getTrips();
      if (res.data) setTrips(res.data);
    } catch (err) {
      console.warn('Failed to load trips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTrips();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTripName || !newTripDestination) {
      alert('Please enter a trip name and destination.');
      return;
    }

    setCreating(true);
    try {
      const res = await api.createTrip({
        name: newTripName,
        destination: newTripDestination,
        startDate: newTripStart,
        endDate: newTripEnd,
        travelers: newTripTravelers,
        budget: newTripBudget,
        currency: newTripCurrency,
      });

      setShowCreateModal(false);
      await fetchTrips();
      if (res.data?._id || res.data?.id) {
        navigate(`/trips/${res.data._id || res.data.id}/itinerary`);
      }
    } catch (err: any) {
      alert(`Trip creation failed: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  const handleDuplicate = async (tripId: string) => {
    try {
      await api.duplicateTrip(tripId);
      await fetchTrips();
    } catch (err) {
      console.error('Duplicate failed:', err);
    }
  };

  const handleDelete = async (tripId: string) => {
    if (!confirm('Are you sure you want to permanently delete this trip?')) return;
    try {
      await api.deleteTrip(tripId);
      await fetchTrips();
    } catch (err) {
      console.error('Delete trip failed:', err);
    }
  };

  const handleArchive = async (tripId: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'archived' ? 'planning' : 'archived';
      await api.updateTrip(tripId, { status: nextStatus as any });
      await fetchTrips();
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const filteredTrips = trips.filter((t) => {
    if (statusFilter === 'all') return t.status !== 'archived';
    return t.status === statusFilter;
  });

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center mx-auto">
          <Calendar className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-display text-navy-900 dark:text-white">
          Sign In to Manage Your Trips
        </h2>
        <p className="text-sm text-slate-500">
          Save persistent itineraries, track budgets, and sync travel notes across devices.
        </p>
        <Link
          to="/login"
          className="inline-block px-6 py-3 rounded-2xl text-sm font-bold text-white bg-gradient-brand shadow-md"
        >
          Sign In or Create Account
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-navy-900 dark:text-white">
            My Travel Itineraries
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your past, current, and upcoming adventures with live synchronized plans.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
          <Link
            to="/planner"
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 glass-panel hover:text-teal-600 flex items-center justify-center gap-1.5 transition-colors min-h-[44px]"
          >
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span>AI Trip Generator</span>
          </Link>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-brand hover:opacity-95 shadow-md shadow-glow-teal flex items-center justify-center gap-1.5 transition-all min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Trip</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'all', label: 'Active Trips' },
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'planning', label: 'In Planning' },
          { id: 'completed', label: 'Completed' },
          { id: 'archived', label: 'Archived' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs font-semibold transition-all min-h-[40px] flex items-center ${
              statusFilter === tab.id
                ? 'bg-navy-900 text-white dark:bg-teal-500 dark:text-navy-950 font-bold'
                : 'text-slate-500 hover:text-navy-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Trips Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 rounded-4xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="glass-panel p-16 text-center rounded-4xl max-w-lg mx-auto space-y-4">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-xl font-bold font-display text-navy-900 dark:text-white">
            No Trips Found
          </h3>
          <p className="text-xs text-slate-500">
            You don't have any trips matching this filter. Start planning your next trip!
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-brand shadow-md"
          >
            Create Your First Trip
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => {
            const tripId = trip._id || trip.id || '';
            return (
              <div
                key={tripId}
                className="group glass-card rounded-4xl overflow-hidden flex flex-col justify-between transition-all duration-300"
              >
                <div>
                  <div className="relative aspect-[16/9] overflow-hidden bg-slate-900">
                    <img
                      src={
                        trip.coverImage ||
                        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={trip.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900/80 backdrop-blur-md text-teal-300">
                        {trip.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-2">
                    <h3 className="text-xl font-bold font-display text-navy-900 dark:text-white group-hover:text-teal-600 transition-colors">
                      {trip.name}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-teal-600" />
                      <span>{trip.destination}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {trip.startDate} - {trip.endDate} ({trip.travelers} traveler
                        {trip.travelers > 1 ? 's' : ''})
                      </span>
                    </div>

                    <div className="pt-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                      Budget: {trip.currency} {trip.budget?.toLocaleString() || '0'}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 mt-4">
                  <Link
                    to={`/trips/${tripId}/itinerary`}
                    className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 text-center transition-colors"
                  >
                    View Itinerary &rarr;
                  </Link>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDuplicate(tripId)}
                      title="Duplicate Trip"
                      className="p-2 rounded-xl text-slate-400 hover:text-navy-900 dark:hover:text-white transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleArchive(tripId, trip.status)}
                      title={trip.status === 'archived' ? 'Restore' : 'Archive'}
                      className="p-2 rounded-xl text-slate-400 hover:text-navy-900 dark:hover:text-white transition-colors"
                    >
                      <Archive className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(tripId)}
                      title="Delete Trip"
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Trip Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleCreateTrip}
            className="glass-panel w-full max-w-lg p-5 sm:p-8 rounded-3xl sm:rounded-4xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90dvh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold font-display text-navy-900 dark:text-white">
              Create New Travel Itinerary
            </h2>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-500">Trip Name</label>
              <input
                type="text"
                required
                value={newTripName}
                onChange={(e) => setNewTripName(e.target.value)}
                placeholder="e.g. Munnar Winter Getaway"
                className="w-full p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[44px]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-500">Destination</label>
              <input
                type="text"
                required
                value={newTripDestination}
                onChange={(e) => setNewTripDestination(e.target.value)}
                placeholder="e.g. Munnar, Kerala, India"
                className="w-full p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[44px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-500">Start Date</label>
                <input
                  type="date"
                  value={newTripStart}
                  onChange={(e) => setNewTripStart(e.target.value)}
                  className="w-full p-3 sm:p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-base sm:text-xs min-h-[44px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-500">End Date</label>
                <input
                  type="date"
                  value={newTripEnd}
                  onChange={(e) => setNewTripEnd(e.target.value)}
                  className="w-full p-3 sm:p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-base sm:text-xs min-h-[44px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-500">Travelers</label>
                <input
                  type="number"
                  min={1}
                  value={newTripTravelers}
                  onChange={(e) => setNewTripTravelers(parseInt(e.target.value) || 1)}
                  className="w-full p-3 sm:p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-base sm:text-xs min-h-[44px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-500">Budget</label>
                <input
                  type="number"
                  min={0}
                  value={newTripBudget}
                  onChange={(e) => setNewTripBudget(parseFloat(e.target.value) || 0)}
                  className="w-full p-3 sm:p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-base sm:text-xs min-h-[44px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-500">Currency</label>
                <select
                  value={newTripCurrency}
                  onChange={(e) => setNewTripCurrency(e.target.value)}
                  className="w-full p-3 sm:p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-base sm:text-xs min-h-[44px]"
                >
                  <option value="USD">USD ($)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-brand shadow-md shadow-glow-teal min-h-[44px] flex items-center justify-center"
              >
                {creating ? 'Creating...' : 'Create Itinerary'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
