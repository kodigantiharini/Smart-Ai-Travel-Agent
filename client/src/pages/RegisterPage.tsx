import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/trips');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] min-h-[85dvh] flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="glass-panel w-full max-w-md p-5 sm:p-10 rounded-3xl sm:rounded-4xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-brand flex items-center justify-center text-white shadow-glow-teal">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-2xl font-display font-extrabold text-navy-900 dark:text-white">
              TripWise<span className="text-teal-600 dark:text-teal-400">AI</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold font-display text-navy-900 dark:text-white">
            Create Traveler Account
          </h1>
          <p className="text-xs text-slate-500">
            Join the smart travel platform with verified places and AI trip generation.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-500">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivera"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[44px]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-500">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[44px]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-500">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[44px]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl text-xs font-bold text-white bg-gradient-brand hover:opacity-95 shadow-md shadow-glow-teal flex items-center justify-center gap-2 transition-all mt-2 min-h-[44px]"
          >
            <span>{loading ? 'Creating Account...' : 'Get Started Free'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-teal-600 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
