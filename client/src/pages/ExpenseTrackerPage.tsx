import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Receipt,
  Plus,
  Trash2,
  Download,
  Calendar,
  ArrowLeft,
  DollarSign,
  Tag,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { Expense, Trip } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ExpenseTrackerPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTripId = searchParams.get('tripId') || '';

  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>(initialTripId);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Expense Form Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [category, setCategory] = useState<any>('food');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(25);
  const [currency, setCurrency] = useState('USD');
  const [status, setStatus] = useState<'planned' | 'actual'>('actual');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

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
        console.warn('Failed to load trips for expenses:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) loadTrips();
    else setLoading(false);
  }, [user]);

  const fetchExpenses = async () => {
    if (!selectedTripId) return;
    setLoading(true);
    try {
      const res = await api.getExpenses(selectedTripId);
      if (res.data) setExpenses(res.data);
    } catch (err) {
      console.warn('Failed to load expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedTripId]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTripId || !description || !amount) return;

    setSaving(true);
    try {
      await api.addExpense(selectedTripId, {
        category,
        description,
        amount: Number(amount),
        currency,
        status,
        expenseDate,
      });

      setShowAddModal(false);
      setDescription('');
      setAmount(25);
      await fetchExpenses();
    } catch (err: any) {
      alert(`Failed to add expense: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Are you sure you want to remove this expense?')) return;
    try {
      await api.deleteExpense(selectedTripId, expenseId);
      await fetchExpenses();
    } catch (err) {
      console.error('Delete expense failed:', err);
    }
  };

  const handleExportCSV = () => {
    if (expenses.length === 0) return;

    const headers = ['Date', 'Category', 'Description', 'Amount', 'Currency', 'Status'];
    const rows = expenses.map((e) => [
      e.expenseDate,
      e.category,
      `"${e.description.replace(/"/g, '""')}"`,
      e.amount,
      e.currency,
      e.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Trip_Expenses_${selectedTripId}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-navy-900 dark:text-white">
            Expense Tracker
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Log receipts, compare planned vs actual spend, and export financial reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {trips.length > 0 && (
            <select
              value={selectedTripId}
              onChange={(e) => {
                setSelectedTripId(e.target.value);
                setSearchParams({ tripId: e.target.value });
              }}
              className="flex-1 sm:flex-initial py-2.5 px-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-base sm:text-xs font-bold focus:outline-none min-h-[44px]"
            >
              {trips.map((t) => (
                <option key={t._id || t.id} value={t._id || t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleExportCSV}
            disabled={expenses.length === 0}
            className="p-2.5 rounded-2xl glass-panel text-slate-600 dark:text-slate-300 hover:text-teal-600 disabled:opacity-40 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-brand hover:opacity-95 shadow-md shadow-glow-teal flex items-center justify-center gap-1.5 transition-all min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Expenses Table / Cards */}
      {loading ? (
        <div className="h-64 rounded-4xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
      ) : expenses.length === 0 ? (
        <div className="glass-panel p-8 sm:p-16 text-center rounded-3xl sm:rounded-4xl max-w-lg mx-auto space-y-4">
          <Receipt className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-xl font-bold font-display text-navy-900 dark:text-white">
            No Expenses Logged
          </h3>
          <p className="text-xs text-slate-500">
            Keep track of food, accommodation, transit, and ticket costs as you explore.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-brand min-h-[44px]"
          >
            Log First Expense
          </button>
        </div>
      ) : (
        <>
          {/* Mobile Cards (sm:hidden) */}
          <div className="block sm:hidden space-y-3">
            {expenses.map((exp) => (
              <div
                key={exp._id || exp.id}
                className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-[10px] text-teal-700 dark:text-teal-300">
                      {exp.category}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        exp.status === 'actual'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {exp.status === 'actual' ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      <span>{exp.status}</span>
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteExpense(exp._id || exp.id || '')}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-500 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-bold text-navy-900 dark:text-white text-sm break-words">
                      {exp.description}
                    </h4>
                    <span className="text-[11px] font-semibold text-slate-400 block mt-0.5">
                      {exp.expenseDate}
                    </span>
                  </div>
                  <div className="font-display font-extrabold text-navy-900 dark:text-white text-base shrink-0">
                    {exp.currency} {exp.amount.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table (hidden sm:block) */}
          <div className="hidden sm:block glass-panel rounded-4xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/60 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Description</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Amount</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {expenses.map((exp) => (
                    <tr
                      key={exp._id || exp.id}
                      className="hover:bg-teal-50/40 dark:hover:bg-teal-950/20 transition-colors"
                    >
                      <td className="py-4 px-6 font-semibold text-slate-500">{exp.expenseDate}</td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-[10px] text-teal-700 dark:text-teal-300">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-navy-900 dark:text-white text-sm">
                        {exp.description}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            exp.status === 'actual'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {exp.status === 'actual' ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          <span>{exp.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-display font-extrabold text-navy-900 dark:text-white text-base">
                        {exp.currency} {exp.amount.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleDeleteExpense(exp._id || exp.id || '')}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-500 transition-colors min-h-[36px] min-w-[36px] inline-flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleAddExpense}
            className="glass-panel w-full max-w-md p-5 sm:p-8 rounded-3xl sm:rounded-4xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90dvh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold font-display text-navy-900 dark:text-white">
              Log Travel Expense
            </h2>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-500">Category</label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-base sm:text-sm font-semibold focus:outline-none min-h-[44px]"
              >
                <option value="food">🍽️ Food & Dining</option>
                <option value="accommodation">🏨 Accommodation</option>
                <option value="transportation">✈️ Transportation</option>
                <option value="tickets">🎟️ Entry Tickets</option>
                <option value="activities">🧗 Activities & Tours</option>
                <option value="shopping">🛍️ Shopping</option>
                <option value="miscellaneous">📦 Miscellaneous</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-500">Description</label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Traditional dinner, Museum entry..."
                className="w-full p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-base sm:text-sm focus:outline-none min-h-[44px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-500">Amount</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  required
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-3 sm:p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-base sm:text-sm font-bold focus:outline-none min-h-[44px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-500">Status</label>
                <select
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="w-full p-3 sm:p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-base sm:text-sm font-semibold focus:outline-none min-h-[44px]"
                >
                  <option value="actual">Actual (Paid)</option>
                  <option value="planned">Planned (Estimate)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-500">Date</label>
              <input
                type="date"
                required
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full p-3 sm:p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-base sm:text-xs focus:outline-none min-h-[44px]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-brand shadow-md shadow-glow-teal min-h-[44px] flex items-center justify-center"
              >
                {saving ? 'Saving...' : 'Add Expense'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
