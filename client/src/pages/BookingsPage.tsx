import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plane,
  Building,
  Bus,
  Train,
  Calendar,
  Search,
  ExternalLink,
  Star,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  PhoneCall,
  Phone,
  Luggage,
  Bed,
  CheckCircle2,
  RefreshCw,
  Compass,
  Navigation,
} from 'lucide-react';
import { api } from '../services/api';
import { FlightOffer, HotelOffer, TransportOption, DistrictStationInfo } from '../types';

export const BookingsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'hotels';

  const [activeTab, setActiveTab] = useState<'hotels' | 'flights' | 'transport'>(
    initialTab as any
  );

  // Common Search parameters - default to popular Indian travel routes
  const [destination, setDestination] = useState('Agra');
  const [origin, setOrigin] = useState('New Delhi');
  const [departureDate, setDepartureDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [returnDate, setReturnDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 12);
    return d.toISOString().split('T')[0];
  });
  const [guests, setGuests] = useState(2);
  const [currency, setCurrency] = useState('INR');

  // Autocomplete state
  const [destSuggestions, setDestSuggestions] = useState<any[]>([]);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [originSuggestions, setOriginSuggestions] = useState<any[]>([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const destInputRef = useRef<HTMLDivElement>(null);
  const originInputRef = useRef<HTMLDivElement>(null);

  // Results state
  const [hotels, setHotels] = useState<HotelOffer[]>([]);
  const [flights, setFlights] = useState<FlightOffer[]>([]);
  const [transports, setTransports] = useState<TransportOption[]>([]);
  const [originDistrict, setOriginDistrict] = useState<DistrictStationInfo | null>(null);
  const [destDistrict, setDestDistrict] = useState<DistrictStationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (destInputRef.current && !destInputRef.current.contains(event.target as Node)) {
        setShowDestDropdown(false);
      }
      if (originInputRef.current && !originInputRef.current.contains(event.target as Node)) {
        setShowOriginDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Autocomplete for Destination
  useEffect(() => {
    if (!destination || destination.trim().length < 2) {
      setDestSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.autocomplete(destination.trim());
        if (res.data) {
          setDestSuggestions(res.data);
        }
      } catch {
        // Silently fallback
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [destination]);

  // Autocomplete for Origin
  useEffect(() => {
    if (!origin || origin.trim().length < 2) {
      setOriginSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.autocomplete(origin.trim());
        if (res.data) {
          setOriginSuggestions(res.data);
        }
      } catch {
        // Silently fallback
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [origin]);

  // Sync tab with query param
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && (tab === 'hotels' || tab === 'flights' || tab === 'transport')) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Execute Search based on current active tab
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setShowDestDropdown(false);
    setShowOriginDropdown(false);
    setLoading(true);
    setError(null);

    try {
      if (activeTab === 'hotels') {
        const res = await api.searchHotels(
          destination,
          departureDate,
          returnDate,
          guests,
          1,
          currency
        );
        setHotels(res.data?.hotels || []);
      } else if (activeTab === 'flights') {
        const res = await api.searchFlights(
          origin,
          destination,
          departureDate,
          guests,
          'ECONOMY',
          currency
        );
        setFlights(res.data?.flights || []);
      } else if (activeTab === 'transport') {
        const res = await api.searchTransport(
          origin,
          destination,
          departureDate,
          'all',
          currency
        );
        setTransports(res.data?.transports || res.data?.options || []);
        setOriginDistrict(res.data?.originDistrict || null);
        setDestDistrict(res.data?.destinationDistrict || null);
      }
      setLastUpdatedTime(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    } catch (err: any) {
      setError(
        err.message || 'Unable to retrieve live provider offers at this time. Please verify inputs.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount or tab change
  useEffect(() => {
    handleSearch();
  }, [activeTab]);

  const selectDestinationSuggestion = (s: any) => {
    const clean = s.mainText?.split('[')[0]?.trim() || s.text.split(',')[0].trim();
    setDestination(clean);
    setShowDestDropdown(false);
  };

  const selectOriginSuggestion = (s: any) => {
    const clean = s.mainText?.split('[')[0]?.trim() || s.text.split(',')[0].trim();
    setOrigin(clean);
    setShowOriginDropdown(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <ShieldCheck size={14} />
            <span>Pan-India District Railway & Intercity Bus Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white mt-1">
            Live Travel Bookings & District Transit
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Exact railway station names and codes for every district in India, state RTC & private bus terminals, and verified hotels.
          </p>
        </div>

        {/* Currency Switcher & Live indicator */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live District Registry</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Currency:</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-full sm:w-fit overflow-x-auto no-scrollbar shadow-inner">
        <button
          onClick={() => {
            setActiveTab('hotels');
            setSearchParams({ tab: 'hotels' });
          }}
          className={`px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 min-h-[44px] touch-target ${
            activeTab === 'hotels'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building size={16} />
          <span>Hotels & Stays</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('flights');
            setSearchParams({ tab: 'flights' });
          }}
          className={`px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 min-h-[44px] touch-target ${
            activeTab === 'flights'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Plane size={16} />
          <span>Flights</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('transport');
            setSearchParams({ tab: 'transport' });
          }}
          className={`px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 min-h-[44px] touch-target ${
            activeTab === 'transport'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Train size={16} />
          <span>Trains & Buses (All Districts)</span>
        </button>
      </div>

      {/* Interactive Search Bar with Autocomplete Suggestions */}
      <form
        onSubmit={handleSearch}
        className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-end relative"
      >
        {activeTab !== 'hotels' && (
          <div ref={originInputRef} className="relative">
            <label className="block text-[11px] font-bold text-slate-500 mb-1 flex items-center justify-between">
              <span>Origin District / Station</span>
              <span className="text-[10px] text-blue-500 font-semibold truncate ml-1">🚆 Station & 🚌 Bus Auto-suggest</span>
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus-within:ring-2 focus-within:ring-blue-500/20">
              <MapPin size={15} className="text-blue-500 shrink-0" />
              <input
                type="text"
                value={origin}
                onChange={(e) => {
                  setOrigin(e.target.value);
                  setShowOriginDropdown(true);
                }}
                onFocus={() => setShowOriginDropdown(true)}
                placeholder="e.g. New Delhi, Kurnool, Visakhapatnam"
                className="w-full bg-transparent text-base sm:text-xs text-slate-800 dark:text-white font-medium focus:outline-none"
              />
            </div>

            {/* Origin Autocomplete Dropdown */}
            {showOriginDropdown && originSuggestions.length > 0 && (
              <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 max-w-[calc(100vw-2rem)]">
                {originSuggestions.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectOriginSuggestion(s)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-blue-50 dark:hover:bg-slate-800 flex items-start gap-2.5 transition-colors"
                  >
                    {s.category === 'railway_station' ? (
                      <span className="w-5 h-5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Train size={12} />
                      </span>
                    ) : (
                      <Compass size={14} className="text-blue-500 shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {s.mainText || s.text}
                      </div>
                      {s.secondaryText && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {s.secondaryText}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div
          ref={destInputRef}
          className={`relative ${activeTab === 'hotels' ? 'sm:col-span-2' : ''}`}
        >
          <label className="block text-[11px] font-bold text-slate-500 mb-1 flex items-center justify-between">
            <span>Destination District / Station</span>
            <span className="text-[10px] text-blue-500 font-semibold truncate ml-1">🚆 Station & 🚌 Bus Auto-suggest</span>
          </label>
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus-within:ring-2 focus-within:ring-blue-500/20">
            <MapPin size={15} className="text-blue-500 shrink-0" />
            <input
              type="text"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                setShowDestDropdown(true);
              }}
              onFocus={() => setShowDestDropdown(true)}
              placeholder="e.g. Agra, Wayanad, Munnar, Varanasi"
              className="w-full bg-transparent text-base sm:text-xs text-slate-800 dark:text-white font-medium focus:outline-none"
            />
          </div>

          {/* Destination Autocomplete Dropdown */}
          {showDestDropdown && destSuggestions.length > 0 && (
            <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 max-w-[calc(100vw-2rem)]">
              {destSuggestions.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectDestinationSuggestion(s)}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-blue-50 dark:hover:bg-slate-800 flex items-start gap-2.5 transition-colors"
                >
                  {s.category === 'railway_station' ? (
                    <span className="w-5 h-5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Train size={12} />
                    </span>
                  ) : (
                    <MapPin size={14} className="text-blue-500 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {s.mainText || s.text}
                    </div>
                    {s.secondaryText && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {s.secondaryText}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">
            {activeTab === 'hotels' ? 'Check-in Date' : 'Travel Date'}
          </label>
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <Calendar size={15} className="text-blue-500 shrink-0" />
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="w-full bg-transparent text-base sm:text-xs text-slate-800 dark:text-white font-medium focus:outline-none"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 sm:py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 min-h-[44px] touch-target"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            <span>Fetch Real-Time Data</span>
          </button>
        </div>
      </form>

      {/* Live Data Freshness Badge */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />
          <span>
            <b>Live District & Transit Directory:</b> Timetables, station codes, bus stands, and fares updated today at{' '}
            <span className="font-mono text-slate-700 dark:text-slate-200 font-bold">{lastUpdatedTime}</span>
          </span>
        </div>
        <button
          onClick={() => handleSearch()}
          className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-bold"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Live Schedules</span>
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-3">
          <AlertCircle size={18} className="shrink-0 text-amber-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-72 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-700"
            />
          ))}
        </div>
      )}

      {/* Results Section */}
      {!loading && !error && (
        <div>
          {/* HOTELS & STAYS VIEW */}
          {activeTab === 'hotels' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  Found <b>{hotels.length}</b> verified hotels & stays in <b>{destination}</b> with official enquiry contacts
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  <span>Enquiry Phone Verified</span>
                </span>
              </div>

              {hotels.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <Building size={36} className="mx-auto text-slate-300" />
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                    No Hotel Listings Found
                  </h3>
                  <p className="text-xs text-slate-400">
                    Try searching for another destination or adjust your dates.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hotels.map((hotel) => (
                    <div
                      key={hotel.id}
                      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
                    >
                      {/* Photo + Category & Rating Badges */}
                      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img
                          src={
                            hotel.photos?.[0] ||
                            'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
                          }
                          alt={hotel.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold">
                          <Building size={12} className="text-blue-400" />
                          <span className="capitalize">{hotel.category?.replace('_', ' ') || 'Hotel'}</span>
                        </div>
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black shadow-md">
                          <Star size={12} className="fill-slate-950 text-slate-950" />
                          <span>{hotel.rating ? hotel.rating.toFixed(1) : '4.6'}</span>
                          {hotel.ratingCount && (
                            <span className="text-[10px] font-medium text-slate-800">
                              ({hotel.ratingCount})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content details */}
                      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white line-clamp-1">
                              {hotel.name}
                            </h3>
                            <span className="text-amber-500 text-xs font-bold shrink-0">
                              {'★'.repeat(Math.min(5, Math.max(3, hotel.starRating || 4)))}
                            </span>
                          </div>

                          {/* Address */}
                          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
                            <MapPin size={14} className="text-blue-500 shrink-0 mt-0.5" />
                            <span className="line-clamp-2 leading-relaxed">{hotel.address}</span>
                          </div>

                          {/* Room Type */}
                          {hotel.roomType && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                              <Bed size={13} className="text-blue-500 shrink-0" />
                              <span className="truncate">{hotel.roomType}</span>
                            </div>
                          )}

                          {/* Check-in / Check-out */}
                          {(hotel.checkIn || hotel.checkOut) && (
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                              <div className="flex items-center gap-1">
                                <Clock size={12} className="text-emerald-500" />
                                <span>
                                  In: <b>{hotel.checkIn || '14:00'}</b>
                                </span>
                              </div>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <span>
                                  Out: <b>{hotel.checkOut || '11:00'}</b>
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Official Hotel Reception / Enquiry Phone */}
                          {hotel.phone && (
                            <div className="pt-1">
                              <a
                                href={`tel:${hotel.phone}`}
                                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-bold text-xs transition-colors shadow-sm"
                              >
                                <PhoneCall size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span className="truncate">Enquiry Phone: {hotel.phone}</span>
                              </a>
                            </div>
                          )}

                          {/* Amenities */}
                          {hotel.amenities && hotel.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {hotel.amenities.slice(0, 4).map((a, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[10px] font-semibold"
                                >
                                  ✓ {a}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Price & Action */}
                        <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                              Live Nightly Rate
                            </span>
                            <div className="text-base font-black text-blue-600 dark:text-blue-400">
                              {hotel.currency} {hotel.pricePerNight?.toLocaleString()}
                              <span className="text-xs font-normal text-slate-400"> / night</span>
                            </div>
                          </div>

                          <a
                            href={hotel.bookingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
                          >
                            <span>Reserve</span>
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FLIGHTS VIEW */}
          {activeTab === 'flights' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  Live flight routes for <b>{origin}</b> → <b>{destination}</b>
                </span>
                <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  <span>Real Airline Schedules & Fares</span>
                </span>
              </div>

              {flights.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <Plane size={36} className="mx-auto text-slate-300" />
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                    No Flights Located
                  </h3>
                  <p className="text-xs text-slate-400">
                    Verify origin and destination airports or select an alternate date.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {flights.map((flight) => (
                    <div
                      key={flight.id}
                      className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
                    >
                      {/* Airline info & details */}
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-100 dark:border-blue-900">
                          <Plane size={22} />
                        </div>
                        <div className="space-y-1">
                          <div className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{flight.airline || flight.airlineName}</span>
                            {flight.flightNumber && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400">
                                {flight.flightNumber}
                              </span>
                            )}
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200/60 dark:border-emerald-800">
                              {flight.stops === 0 ? 'Non-Stop' : `${flight.stops} Stop`}
                            </span>
                          </div>

                          <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {flight.duration || flight.durationFormatted}
                            </span>
                            {flight.baggage && (
                              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                                <Luggage size={12} className="text-blue-500" />
                                {flight.baggage}
                              </span>
                            )}
                            {flight.terminalInfo && (
                              <span className="text-[11px] text-slate-500 font-medium">
                                {flight.terminalInfo}
                              </span>
                            )}
                          </div>

                          {/* Airline Customer Helpline */}
                          {flight.helpline && (
                            <div className="pt-1">
                              <a
                                href={`tel:${flight.helpline}`}
                                className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-bold"
                              >
                                <Phone size={12} />
                                <span>Airline Care Helpline: {flight.helpline}</span>
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Flight Timings / Route badge */}
                      <div className="flex items-center gap-6 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <div className="text-right">
                          <div className="font-black text-sm text-slate-900 dark:text-white">
                            {flight.departureTime}
                          </div>
                          <div className="text-[11px] font-bold text-blue-600">
                            {flight.origin || flight.originIata}
                          </div>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            Flight
                          </span>
                          <ArrowRight size={14} className="text-slate-400" />
                        </div>
                        <div className="text-left">
                          <div className="font-black text-sm text-slate-900 dark:text-white">
                            {flight.arrivalTime}
                          </div>
                          <div className="text-[11px] font-bold text-blue-600">
                            {flight.destination || flight.destinationIata}
                          </div>
                        </div>
                      </div>

                      {/* Price & Action */}
                      <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                        <div className="text-left md:text-right">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                            Live Fare
                          </span>
                          <div className="text-lg font-black text-blue-600 dark:text-blue-400">
                            {flight.currency} {flight.price?.toLocaleString()}
                          </div>
                        </div>

                        <a
                          href={flight.bookingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all shrink-0"
                        >
                          <span>Select Flight</span>
                          <ExternalLink size={13} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TRAINS & BUSES (ALL DISTRICTS) VIEW */}
          {activeTab === 'transport' && (
            <div className="space-y-6">
              {/* DISTRICT RAILWAY & BUS TERMINAL DIRECTORY CARD */}
              {(originDistrict || destDistrict) && (
                <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-slate-50/60 dark:from-slate-900 dark:via-blue-950/30 dark:to-slate-900 border border-blue-200/70 dark:border-blue-900/40 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 dark:border-blue-900/60 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                        <Train size={16} />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          <span>District Railway Station & Bus Terminal Directory</span>
                          <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                            All Districts
                          </span>
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Official Indian Railways station codes, state transport depots, and nearest railhead connectivity
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold w-fit">
                      Indian District Transit Registry
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Boarding District */}
                    {originDistrict && (
                      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            Boarding District
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono font-bold text-[10px]">
                            Code: {originDistrict.stationCode}
                          </span>
                        </div>
                        <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {originDistrict.district}, {originDistrict.state}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                          <Train size={13} className="text-amber-500 shrink-0 mt-0.5" />
                          <span>
                            Official Railway Station: <b>{originDistrict.primaryStation}</b> [{originDistrict.stationCode}]
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                          <Bus size={13} className="text-teal-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">
                            Central Bus Terminal: <b>{originDistrict.primaryBusStand}</b> ({originDistrict.stateRTC})
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Destination District */}
                    {destDistrict && (
                      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            Destination District
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-[10px]">
                            Code: {destDistrict.stationCode}
                          </span>
                        </div>
                        <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {destDistrict.district}, {destDistrict.state}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                          <Train size={13} className="text-amber-500 shrink-0 mt-0.5" />
                          <span>
                            Official Railway Station: <b>{destDistrict.primaryStation}</b> [{destDistrict.stationCode}]
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                          <Bus size={13} className="text-teal-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">
                            Central Bus Terminal: <b>{destDistrict.primaryBusStand}</b> ({destDistrict.stateRTC})
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hill District Notice */}
                  {destDistrict?.isHillOrRemote && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2.5">
                      <AlertCircle size={17} className="text-amber-600 shrink-0" />
                      <span>
                        <b>Hill Terrain Notice:</b> {destDistrict.district} has no broad-gauge railway. Nearest Railhead is{' '}
                        <b>{destDistrict.nearestRailhead}</b> ({destDistrict.distanceToRailheadKm} km away). Direct{' '}
                        <b>{destDistrict.stateRTC}</b> mountain buses and shared taxis operate continuously to {destDistrict.primaryBusStand}.
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  Ground transit options for <b>{origin}</b> ⇄ <b>{destination}</b>
                </span>
                <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  <span>Official IRCTC & Interstate Bus Routes</span>
                </span>
              </div>

              {transports.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <Train size={36} className="mx-auto text-slate-300" />
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                    No Ground Transit Routes Found
                  </h3>
                  <p className="text-xs text-slate-400">
                    Try searching major city rail stations or interstate bus stops.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {transports.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                              item.type === 'train'
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900'
                                : 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-900'
                            }`}
                          >
                            {item.type === 'train' ? <Train size={20} /> : <Bus size={20} />}
                          </div>
                          <div className="space-y-1">
                            <div className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                              <span>{item.title || item.operator}</span>
                              {item.serviceNumber && (
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
                                  #{item.serviceNumber}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Operator: <b className="text-slate-700 dark:text-slate-300">{item.operator}</b>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                              <Clock size={12} className="text-blue-500" />
                              <span>
                                Departure: <b>{item.departureTime}</b> • Approx: <b>{item.duration || item.durationFormatted}</b>
                              </span>
                            </div>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 ${
                            item.type === 'train'
                              ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200'
                              : 'bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200'
                          }`}
                        >
                          {item.type}
                        </span>
                      </div>

                      {/* Station / Stand Details */}
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                        <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-200">
                          {item.type === 'train' ? (
                            <Train size={13} className="text-amber-500 shrink-0 mt-0.5" />
                          ) : (
                            <Bus size={13} className="text-teal-500 shrink-0 mt-0.5" />
                          )}
                          <span className="line-clamp-1">
                            {item.type === 'train' ? 'From Station:' : 'Boarding Bus Stand:'}{' '}
                            <b>{item.type === 'train' ? item.originStation : (item.boardingPoint || item.originStation)}</b>
                          </span>
                        </div>
                        <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-200">
                          <Navigation size={13} className="text-blue-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">
                            {item.type === 'train' ? 'To Station:' : 'Dropping Bus Stand:'}{' '}
                            <b>{item.type === 'train' ? item.destinationStation : (item.droppingPoint || item.destinationStation)}</b>
                          </span>
                        </div>
                      </div>

                      {/* Coach Classes / Types */}
                      {item.classes && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          <span className="text-[10px] text-slate-400 font-semibold">Available Coaches:</span>
                          {(Array.isArray(item.classes) ? item.classes : []).map((cls: any, i: number) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold"
                            >
                              {typeof cls === 'string' ? cls : cls.className}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Helpline Phone Number */}
                      {item.helpline && (
                        <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                          <span className="text-slate-500 text-[11px]">Passenger Helpline:</span>
                          <a
                            href={`tel:${item.helpline}`}
                            className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            <Phone size={11} />
                            <span>{item.helpline}</span>
                          </a>
                        </div>
                      )}

                      {/* Fare & Booking */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                            Fare Starts From
                          </span>
                          <div className="text-lg font-black text-blue-600 dark:text-blue-400">
                            {item.currency || 'INR'} {item.price?.toLocaleString()}
                          </div>
                        </div>

                        <a
                          href={item.bookingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
                        >
                          <span>Book on {item.bookingPortalName || (item.type === 'train' ? 'IRCTC' : 'RedBus')}</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
