import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Compass,
  MapPin,
  Sparkles,
  Calendar,
  Wallet,
  Bookmark,
  Sun,
  Moon,
  Menu,
  X,
  User as UserIcon,
  Bell,
  LogOut,
  Map as MapIcon,
  Bot,
  Film,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Explore', path: '/explore', icon: Compass },
    { label: 'Map', path: '/map', icon: MapIcon },
    { label: 'AI Planner', path: '/planner', icon: Sparkles, badge: 'AI' },
    { label: 'AI Guide', path: '/assistant', icon: Bot },
    { label: 'My Trips', path: '/trips', icon: Calendar },
    { label: 'Budget', path: '/budget', icon: Wallet },
    { label: 'Saved', path: '/saved', icon: Bookmark },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-brand flex items-center justify-center text-white shadow-glow-teal group-hover:scale-105 transition-transform duration-300">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-display font-extrabold tracking-tight text-navy-900 dark:text-white">
                  TripWise
                </span>
                <span className="text-2xl font-display font-extrabold text-teal-600 dark:text-teal-400">
                  AI
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-600 dark:text-slate-300 -mt-1">
                Luxury Smart Travel
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-teal-600 dark:text-teal-400' : ''}`} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-gradient-brand text-white shadow-xs">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Dark Mode"
              className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>

            {/* Notifications Icon */}
            {user && (
              <Link
                to="/notifications"
                className="relative p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-teal-500 ring-2 ring-white dark:ring-navy-900" />
              </Link>
            )}

            {/* User Profile / Auth State */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all border border-slate-200 dark:border-slate-700"
                >
                  <img
                    src={user.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-teal-500/30"
                  />
                  <span className="hidden md:inline-block text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div
                    onClick={() => setUserMenuOpen(false)}
                    className="absolute right-0 mt-3 w-56 rounded-2xl glass-panel p-2 shadow-2xl z-50 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-600 rounded-xl transition-colors mt-1"
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/settings"
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-600 rounded-xl transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Preferences & Settings</span>
                    </Link>

                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent('tripwise:replay-intro'))}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-xl transition-colors text-left"
                    >
                      <Film className="w-4 h-4" />
                      <span>Cinematic Intro</span>
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5 shrink-0">
                <Link
                  to="/login"
                  className="whitespace-nowrap px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-600 transition-colors inline-block"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="whitespace-nowrap px-4 py-2 text-sm font-semibold text-white bg-gradient-brand hover:opacity-95 rounded-xl shadow-md transition-all shadow-glow-teal hover:scale-[1.02] inline-block"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Open Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-200 dark:border-slate-800 animate-in fade-in duration-200">
            <div className="flex flex-col gap-1.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium ${
                      active
                        ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span>{link.label}</span>
                    </div>
                    {link.badge && (
                      <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-teal-500 text-white">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              {!user && (
                <div className="flex items-center gap-3 pt-3 mt-2 border-t border-slate-200 dark:border-slate-800">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 glass-panel rounded-xl whitespace-nowrap"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2.5 text-sm font-semibold text-white bg-gradient-brand rounded-xl whitespace-nowrap"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
