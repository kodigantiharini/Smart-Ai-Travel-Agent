import React from 'react';
import { BudgetSummary } from '../types';
import { Wallet, TrendingUp, Users, AlertCircle, CheckCircle2 } from 'lucide-react';

interface BudgetChartProps {
  summary: BudgetSummary;
}

export const BudgetChart: React.FC<BudgetChartProps> = ({ summary }) => {
  const {
    totalBudget,
    currency,
    travelers,
    plannedTotal,
    actualTotal,
    remainingBalance,
    perPersonBudget,
    perPersonActual,
    categoryBreakdown,
  } = summary;

  const percentSpent = totalBudget > 0 ? Math.min(100, Math.round((actualTotal / totalBudget) * 100)) : 0;
  const isOverBudget = remainingBalance < 0;

  const categoryIcons: Record<string, string> = {
    transportation: '✈️ Transportation',
    accommodation: '🏨 Accommodation',
    food: '🍽️ Food & Dining',
    tickets: '🎟️ Entry Tickets',
    activities: '🧗 Tours & Activities',
    shopping: '🛍️ Shopping',
    miscellaneous: '📦 Miscellaneous',
  };

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
            Total Budget
          </p>
          <p className="text-2xl font-bold font-display text-navy-900 dark:text-white mt-1">
            {currency} {totalBudget.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {currency} {perPersonBudget.toLocaleString()} / person
          </p>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
            Actual Spent
          </p>
          <p className="text-2xl font-bold font-display text-teal-600 dark:text-teal-400 mt-1">
            {currency} {actualTotal.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {percentSpent}% of total budget used
          </p>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
            Planned Expenses
          </p>
          <p className="text-2xl font-bold font-display text-slate-700 dark:text-slate-200 mt-1">
            {currency} {plannedTotal.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Estimated uncommitted stops
          </p>
        </div>

        <div className={`glass-card p-5 rounded-3xl border ${
          isOverBudget
            ? 'border-rose-300 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20'
            : 'border-emerald-300 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20'
        }`}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              {isOverBudget ? 'Budget Exceeded' : 'Remaining Balance'}
            </p>
            {isOverBudget ? (
              <AlertCircle className="w-4 h-4 text-rose-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            )}
          </div>
          <p className={`text-2xl font-bold font-display mt-1 ${
            isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
          }`}>
            {currency} {Math.abs(remainingBalance).toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {travelers} traveler{travelers > 1 ? 's' : ''} on this trip
          </p>
        </div>
      </div>

      {/* Main Budget Progress Bar */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between text-sm font-semibold mb-2">
          <span className="text-slate-700 dark:text-slate-300">Overall Spending Velocity</span>
          <span className="text-teal-600 dark:text-teal-400">{percentSpent}% used</span>
        </div>
        <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOverBudget
                ? 'bg-rose-500'
                : percentSpent > 80
                ? 'bg-amber-500'
                : 'bg-gradient-brand'
            }`}
            style={{ width: `${Math.min(100, percentSpent)}%` }}
          />
        </div>
      </div>

      {/* Category Breakdown Bars */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
        <h3 className="text-base font-bold font-display text-navy-900 dark:text-white mb-4">
          Expenses by Category
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(categoryBreakdown).map(([catKey, val]) => {
            const catTotal = val.actual + val.planned;
            const catPercent = totalBudget > 0 ? Math.round((val.actual / totalBudget) * 100) : 0;
            return (
              <div
                key={catKey}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center justify-between text-sm font-semibold mb-1">
                  <span className="text-slate-800 dark:text-slate-200">
                    {categoryIcons[catKey] || catKey}
                  </span>
                  <span className="font-bold text-navy-900 dark:text-white">
                    {currency} {val.actual.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 mb-2">
                  <span>Planned: {currency} {val.planned.toLocaleString()}</span>
                  <span>{catPercent}% of budget</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full"
                    style={{ width: `${Math.min(100, catPercent * 2)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
