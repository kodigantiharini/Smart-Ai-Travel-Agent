import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="glass-panel w-full max-w-md p-8 sm:p-10 rounded-4xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
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
            Reset Password
          </h1>
          <p className="text-xs text-slate-500">
            Enter your email address to receive password reset instructions.
          </p>
        </div>

        {submitted ? (
          <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
              Reset Instructions Dispatched
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              If an account is associated with <strong>{email}</strong>, a recovery link has been sent to your inbox.
            </p>
            <Link
              to="/login"
              className="inline-block px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 mt-2"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-500">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@tripwise.ai"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl text-xs font-bold text-white bg-gradient-brand hover:opacity-95 shadow-md shadow-glow-teal flex items-center justify-center gap-2 transition-all mt-2"
            >
              <span>Send Reset Link</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-600"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
