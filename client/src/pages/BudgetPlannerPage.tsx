import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Wallet, Plus, ArrowRight, ArrowLeft, Receipt, DollarSign, Calendar } from 'lucide-react';
import { BudgetSummary, Trip } from '../types';
import { api } from '../services/api';
import { BudgetChart } from '../components/BudgetChart';
import { useAuth } from '../context/AuthContext';

export const BudgetPlannerPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTripId = searchParams.get('tripId') || '';

  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>(initialTripId);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrips = async () => {
      try {
        const res = await api.getTrips();
        if (res.data && res.data.length > 0) {
          setTrips(res.data);
          if (!selectedTripId) {
            setSelectedTripId(res.data[0]._id || res.data[0].id || '');
          }
        }
      } catch (err) {
        console.warn('Failed to load trips for budget:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) loadTrips();
    else setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!selectedTripId) return;

    const loadBudget = async () => {
      setLoading(true);
      try {
        const res = await api.getBudgetSummary(selectedTripId);
        if (res.data) setSummary(res.data);
      } catch (err) {
        console.warn('Failed to load budget summary:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBudget();
  }, [selectedTripId]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <Wallet className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-2xl font-bold font-display text-navy-900 dark:text-white">
          Sign In for Budget Planning
        </h2>
        <p className="text-sm text-slate-500">
          Track travel expenses, visualize category allocations, and avoid budget overruns.
        </p>
        <Link
          to="/login"
          className="inline-block px-6 py-3 rounded-2xl text-sm font-bold text-white bg-gradient-brand shadow-md"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const currentTrip = trips.find((t) => t._id === selectedTripId || t.id === selectedTripId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header and Trip Select */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-navy-900 dark:text-white">
            Travel Budget Planner
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Audit planned vs actual expenses, per-person costs, and spending breakdowns.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
          {trips.length > 0 && (
            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
              <span className="text-xs font-bold uppercase text-slate-400 hidden sm:inline">Select Trip:</span>
              <select
                value={selectedTripId}
                onChange={(e) => {
                  setSelectedTripId(e.target.value);
                  setSearchParams({ tripId: e.target.value });
                }}
                className="w-full sm:w-auto py-2.5 px-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-base sm:text-xs font-bold focus:outline-none min-h-[44px]"
              >
                {trips.map((t) => (
                  <option key={t._id || t.id} value={t._id || t.id}>
                    {t.name} ({t.destination})
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedTripId && (
            <Link
              to={`/expenses?tripId=${selectedTripId}`}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-brand hover:opacity-95 shadow-md shadow-glow-teal flex items-center justify-center gap-1.5 transition-all min-h-[44px] shrink-0"
            >
              <Receipt className="w-4 h-4" />
              <span>Log Expenses</span>
            </Link>
          )}
        </div>
      </div>

      {/* Main Budget Visualizer */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      ) : summary ? (
        <BudgetChart summary={summary} />
      ) : (
        <div className="glass-panel p-16 text-center rounded-4xl max-w-lg mx-auto space-y-4">
          <Wallet className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-xl font-bold font-display text-navy-900 dark:text-white">
            No Budget Data Found
          </h3>
          <p className="text-xs text-slate-500">
            Create a trip with a defined budget to unlock automatic tracking and visual charts.
          </p>
          <Link
            to="/trips"
            className="inline-block px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-brand"
          >
            Go to My Trips
          </Link>
        </div>
      )}
    </div>
  );
};
