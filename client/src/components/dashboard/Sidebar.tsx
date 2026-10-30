import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  Bot,
  MapPin,
  Calendar,
  Wallet,
  Bookmark,
  Plane,
  Building,
  User as UserIcon,
  Settings,
  LogOut,
  X,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, loginAsDemo } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { label: 'Home', path: '/', icon: Compass },
    { label: 'AI Assistant', path: '/assistant', icon: Bot, badge: 'LIVE' },
    { label: 'AI Planner', path: '/planner', icon: Sparkles, badge: 'AI' },
    { label: 'Explore', path: '/explore', icon: MapPin },
    { label: 'My Trips', path: '/trips', icon: Calendar },
    { label: 'Bookings', path: '/bookings', icon: Plane },
    { label: 'Saved Places', path: '/saved', icon: Bookmark },
    { label: 'Budget Planner', path: '/budget', icon: Wallet },
    { label: 'Profile', path: '/profile', icon: UserIcon },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-full h-full bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between select-none overflow-y-auto">
      {/* Brand Header */}
      <div>
        <div className="p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60">
          <Link to="/" onClick={onCloseMobile} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30 group-hover:scale-105 transition-transform shrink-0">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1 font-display font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                <span>TripWise</span>
                <span className="text-blue-600">AI</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                Intelligent Travel Concierge
              </p>
            </div>
          </Link>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden touch-target flex items-center justify-center"
              aria-label="Close Sidebar"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all min-h-[44px] ${
                  active
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold border-r-4 border-blue-600'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 uppercase">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Discovery Banner & Profile Strip */}
      <div className="p-4 space-y-3">
        {/* Destination Discovery Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 flex items-center gap-1">
              <Sparkles size={11} /> Explore Hidden Gems
            </span>
            <p className="text-xs font-bold leading-tight">
              Discover verified off-beat spots curated by AI.
            </p>
            <button
              onClick={() => {
                navigate('/explore');
                onCloseMobile?.();
              }}
              className="w-full mt-1 py-2 px-3 rounded-xl bg-white text-blue-700 font-bold text-xs hover:bg-blue-50 transition-colors shadow-xs flex items-center justify-center gap-1 min-h-[40px]"
            >
              <span>Explore Now</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* User Strip */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="font-bold text-slate-800 dark:text-slate-100 truncate text-[11px]">
                {user?.name || 'Guest Traveler'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {user ? (
                  user.email
                ) : (
                  <button
                    onClick={async () => {
                      try {
                        await loginAsDemo();
                      } catch {
                        navigate('/login');
                      }
                    }}
                    className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                  >
                    1-Click Demo Login
                  </button>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={toggleTheme}
              title="Toggle Theme"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 touch-target flex items-center justify-center"
              aria-label="Toggle Color Theme"
            >
              {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
            </button>

            {user && (
              <button
                onClick={logout}
                title="Log Out"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-500 touch-target flex items-center justify-center"
                aria-label="Log Out"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
