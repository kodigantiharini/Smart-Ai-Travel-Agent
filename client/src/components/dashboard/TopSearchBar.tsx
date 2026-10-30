import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Calendar,
  Users,
  Bell,
  User as UserIcon,
  MapPin,
  X,
  Menu,
  ChevronDown,
  Sparkles,
  Plane,
  Building,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface TopSearchBarProps {
  onToggleMobileSidebar?: () => void;
  onSearchSubmit?: (params: {
    destination: string;
    startDate: string;
    endDate: string;
    travelers: number;
  }) => void;
  defaultDestination?: string;
}

export const TopSearchBar: React.FC<TopSearchBarProps> = ({
  onToggleMobileSidebar,
  onSearchSubmit,
  defaultDestination = '',
}) => {
  const navigate = useNavigate();
  const { user, logout, loginAsDemo } = useAuth();

  // Search form state
  const [destination, setDestination] = useState(defaultDestination);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 12);
    return d.toISOString().split('T')[0];
  });
  const [travelers, setTravelers] = useState<number>(2);

  // UI state
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showTravelerDropdown, setShowTravelerDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(3);
  const [mobileFiltersExpanded, setMobileFiltersExpanded] = useState<boolean>(false);

  const autocompleteRef = useRef<HTMLDivElement>(null);
  const travelerRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Debounced Geoapify Autocomplete
  useEffect(() => {
    if (!destination || destination.trim().length < 2) {
      setSuggestions([]);
      setIsSuggesting(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.autocomplete(destination);
        if (res.data && res.data.length > 0) {
          setSuggestions(res.data);
          setIsSuggesting(true);
        } else {
          setSuggestions([]);
          setIsSuggesting(false);
        }
      } catch (err) {
        console.warn('Geoapify autocomplete error:', err);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [destination]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (autocompleteRef.current && !autocompleteRef.current.contains(target)) {
        setIsSuggesting(false);
      }
      if (travelerRef.current && !travelerRef.current.contains(target)) {
        setShowTravelerDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (sug: any) => {
    const name = sug.text || sug.mainText || sug.formatted;
    setDestination(name);
    setIsSuggesting(false);
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSuggesting(false);

    if (onSearchSubmit && destination.trim()) {
      onSearchSubmit({
        destination: destination.trim(),
        startDate,
        endDate,
        travelers,
      });
      return;
    }

    if (destination.trim()) {
      navigate(
        `/planner?destination=${encodeURIComponent(destination.trim())}&startDate=${startDate}&endDate=${endDate}&travelers=${travelers}`
      );
    } else {
      navigate('/explore');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Mobile Sidebar Hamburger */}
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            <Menu size={20} />
          </button>
        )}

        {/* Unified Search Bar Pill */}
        <form
          onSubmit={handleSearch}
          className="flex-1 max-w-4xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-1.5 shadow-sm transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500"
        >
          {/* Main Search Row */}
          <div className="flex items-center gap-1.5 w-full">
            {/* Destination Autocomplete Input */}
            <div ref={autocompleteRef} className="relative flex-1 min-w-0">
              <div className="flex items-center gap-2 px-2.5 py-1.5">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  onFocus={() => destination.length >= 2 && setIsSuggesting(true)}
                  placeholder="Where to? (e.g. Kyoto, Paris, Kerala)"
                  className="w-full bg-transparent text-sm text-slate-800 dark:text-white placeholder:text-slate-400 font-medium focus:outline-none truncate"
                />
                {destination && (
                  <button
                    type="button"
                    onClick={() => setDestination('')}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0"
                    aria-label="Clear destination"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Geoapify Suggestions Dropdown */}
              {isSuggesting && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 max-w-[calc(100vw-2rem)]">
                  <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Verified Destinations
                    </span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                      Real-Time GPS
                    </span>
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50">
                    {suggestions.map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectSuggestion(sug)}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200 transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <div className="truncate">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {sug.text || sug.mainText}
                          </span>
                          {sug.country && (
                            <span className="text-slate-400 ml-1.5 text-[11px]">
                              • {sug.country}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Divider */}
            <div className="hidden md:block w-px h-6 bg-slate-200 dark:bg-slate-700 shrink-0" />

            {/* Desktop Dates Selector */}
            <div className="hidden md:flex items-center gap-1.5 px-2 py-1 text-xs text-slate-600 dark:text-slate-300 shrink-0">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
              <input
                type="date"
                value={startDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                title="Departure Date"
              />
              <span className="text-slate-400 font-bold">→</span>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                title="Return Date"
              />
            </div>

            {/* Desktop Divider */}
            <div className="hidden md:block w-px h-6 bg-slate-200 dark:bg-slate-700 shrink-0" />

            {/* Desktop Traveler Counter Selector */}
            <div ref={travelerRef} className="hidden md:block relative shrink-0">
              <button
                type="button"
                onClick={() => setShowTravelerDropdown(!showTravelerDropdown)}
                className="flex items-center justify-between gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700/60 rounded-xl transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>{travelers} {travelers === 1 ? 'Guest' : 'Guests'}</span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {showTravelerDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in duration-150">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                    Number of Travelers
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">People</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setTravelers(Math.max(1, travelers - 1))}
                        className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 touch-target"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold text-slate-800 dark:text-white">
                        {travelers}
                      </span>
                      <button
                        type="button"
                        onClick={() => setTravelers(Math.min(12, travelers + 1))}
                        className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 touch-target"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileFiltersExpanded(!mobileFiltersExpanded)}
              className="md:hidden p-2 rounded-xl text-slate-500 hover:text-blue-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors shrink-0"
              title="Toggle Dates & Travelers"
              aria-label="Toggle Dates and Travelers filter"
            >
              <Calendar size={16} />
            </button>

            {/* Blue Search Action Button */}
            <button
              type="submit"
              className="px-3.5 sm:px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-1.5 shrink-0"
              aria-label="Execute Search"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>

          {/* Mobile Expanded Filter Accordion */}
          {mobileFiltersExpanded && (
            <div className="md:hidden pt-2.5 mt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 px-1">
                <span className="font-semibold text-[11px] text-slate-400 uppercase tracking-wider">Dates</span>
                <div className="flex items-center gap-1">
                  <input
                    type="date"
                    value={startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
                  />
                  <span className="text-slate-400 font-bold">→</span>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 px-1 pt-1">
                <span className="font-semibold text-[11px] text-slate-400 uppercase tracking-wider">Travelers</span>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setTravelers(Math.max(1, travelers - 1))}
                    className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold text-slate-800 dark:text-white min-w-[20px] text-center">
                    {travelers}
                  </span>
                  <button
                    type="button"
                    onClick={() => setTravelers(Math.min(12, travelers + 1))}
                    className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Right Nav Utilities: Notifications & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Notifications */}
          <Link
            to="/notifications"
            className="relative p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 transition-all shadow-sm touch-target flex items-center justify-center"
            title="Trip Alerts & Notifications"
            aria-label="View notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900" />
            )}
          </Link>

          {/* User Profile Menu */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:pl-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm touch-target"
              aria-label="User Account Menu"
              aria-expanded={showProfileDropdown}
            >
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm shrink-0">
                {user?.name ? user.name[0] : 'U'}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[100px] truncate">
                {user?.name || 'Explorer'}
              </span>
              <ChevronDown size={14} className="text-slate-400 shrink-0" />
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-52 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in duration-150">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                  <div className="text-xs font-bold text-slate-800 dark:text-white truncate">
                    {user?.name || 'Guest Traveler'}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {user?.email || 'guest@tripwise.ai'}
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setShowProfileDropdown(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <UserIcon size={14} className="text-blue-500" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/trips"
                    onClick={() => setShowProfileDropdown(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <Calendar size={14} className="text-teal-500" />
                    <span>My Trips</span>
                  </Link>
                  <Link
                    to="/bookings"
                    onClick={() => setShowProfileDropdown(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <Plane size={14} className="text-indigo-500" />
                    <span>Bookings</span>
                  </Link>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-700 pt-1">
                  {user ? (
                    <button
                      onClick={() => {
                        logout();
                        setShowProfileDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      Sign Out
                    </button>
                  ) : (
                    <div className="space-y-1">
                      <button
                        onClick={async () => {
                          setShowProfileDropdown(false);
                          try {
                            await loginAsDemo();
                          } catch {
                            navigate('/login');
                          }
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-teal-600 dark:text-teal-400 font-bold hover:bg-teal-50 dark:hover:bg-teal-950/30 flex items-center gap-1.5"
                      >
                        <Sparkles size={13} />
                        <span>1-Click Demo Login</span>
                      </button>
                      <Link
                        to="/login"
                        onClick={() => setShowProfileDropdown(false)}
                        className="block px-4 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      >
                        Sign In / Register
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
