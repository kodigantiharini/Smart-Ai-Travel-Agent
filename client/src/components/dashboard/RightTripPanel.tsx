import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  MapPin,
  Clock,
  Navigation,
  ChevronDown,
  ChevronUp,
  Trash2,
  MoveUp,
  MoveDown,
  ExternalLink,
  Sparkles,
  Plane,
  Building,
  Compass,
  AlertTriangle,
  CloudSun,
  CloudRain,
  Sun,
  Edit3,
  Plus,
} from 'lucide-react';
import { Trip, ItineraryDay, ItineraryStop } from '../../types';
import { api } from '../../services/api';

interface RightTripPanelProps {
  activeTrip?: Trip | null;
  onTripUpdated?: () => void;
  onSelectDay?: (dayNumber: number, stops: ItineraryStop[]) => void;
  onFocusStop?: (lat: number, lng: number) => void;
}

export const RightTripPanel: React.FC<RightTripPanelProps> = ({
  activeTrip: propActiveTrip,
  onTripUpdated,
  onSelectDay,
  onFocusStop,
}) => {
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(propActiveTrip || null);
  const [itineraryDays, setItineraryDays] = useState<ItineraryDay[]>([]);
  const [expandedDay, setExpandedDay] = useState<number>(1);
  const [loadingTrip, setLoadingTrip] = useState<boolean>(!propActiveTrip);
  const [savingItinerary, setSavingItinerary] = useState<boolean>(false);

  // Weather state
  const [weatherData, setWeatherData] = useState<{
    temp: number;
    description: string;
    conditionCode: number;
    rainProb?: number;
    timestamp: string;
    hasAlert?: boolean;
    alertMessage?: string;
  } | null>(null);

  // Load trip and itinerary if not provided via props
  useEffect(() => {
    if (propActiveTrip) {
      setTrip(propActiveTrip);
      loadItinerary(propActiveTrip._id || propActiveTrip.id);
      loadWeather(propActiveTrip.destination);
      return;
    }

    const fetchLatestTrip = async () => {
      try {
        setLoadingTrip(true);
        const token = localStorage.getItem('tripwise_token');
        if (token) {
          const res = await api.getTrips();
          if (res.data && res.data.length > 0) {
            const latest = res.data[0];
            setTrip(latest);
            await loadItinerary(latest._id || latest.id);
            await loadWeather(latest.destination);
            return;
          }
        }
        setTrip(null);
      } catch (err) {
        console.warn('Failed to fetch user trips:', err);
        setTrip(null);
      } finally {
        setLoadingTrip(false);
      }
    };

    fetchLatestTrip();
  }, [propActiveTrip]);

  const loadItinerary = async (tripId: string) => {
    try {
      const res = await api.getTripItinerary(tripId);
      if (res.data && res.data.length > 0) {
        setItineraryDays(res.data);
        if (onSelectDay) {
          const firstDay = res.data[0];
          onSelectDay(firstDay.day, firstDay.stops);
        }
      } else {
        setItineraryDays([]);
      }
    } catch (err) {
      console.warn('Itinerary load failed:', err);
    }
  };

  const loadWeather = async (destinationName: string) => {
    try {
      const res = await api.getWeather(undefined, undefined, destinationName);
      if (res.data?.current) {
        const cur = res.data.current;
        const rainProb = cur.precipitationProbability ?? (cur.weatherCode >= 51 ? 80 : 10);
        setWeatherData({
          temp: Math.round(cur.temperature),
          description: cur.weatherDescription || 'Fair Skies',
          conditionCode: cur.weatherCode || 0,
          rainProb,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          hasAlert: rainProb > 50 || res.data.alerts?.length > 0,
          alertMessage:
            rainProb > 50
              ? 'High probability of rain. Recommend indoor attractions or packing rainwear.'
              : undefined,
        });
      }
    } catch (err) {
      console.warn('Failed to fetch weather for panel:', err);
    }
  };

  // Activity reordering and deletion with persistent database sync
  const handleRemoveActivity = async (dayNumber: number, stopIndex: number) => {
    if (!trip) return;
    const updated = itineraryDays.map((d) => {
      if (d.day === dayNumber) {
        const newStops = [...d.stops];
        newStops.splice(stopIndex, 1);
        return { ...d, stops: newStops };
      }
      return d;
    });

    setItineraryDays(updated);
    await syncItinerary(updated);
  };

  const handleMoveActivity = async (dayNumber: number, stopIndex: number, direction: 'up' | 'down') => {
    if (!trip) return;
    const updated = itineraryDays.map((d) => {
      if (d.day === dayNumber) {
        const newStops = [...d.stops];
        const targetIndex = direction === 'up' ? stopIndex - 1 : stopIndex + 1;
        if (targetIndex < 0 || targetIndex >= newStops.length) return d;
        const temp = newStops[stopIndex];
        newStops[stopIndex] = newStops[targetIndex];
        newStops[targetIndex] = temp;
        return { ...d, stops: newStops };
      }
      return d;
    });

    setItineraryDays(updated);
    await syncItinerary(updated);
  };

  const syncItinerary = async (days: ItineraryDay[]) => {
    if (!trip) return;
    try {
      setSavingItinerary(true);
      await api.updateTripItinerary(trip._id || trip.id, days);
      if (onTripUpdated) onTripUpdated();
    } catch (err) {
      console.error('Failed to sync updated itinerary to DB:', err);
    } finally {
      setSavingItinerary(false);
    }
  };

  const getWeatherIcon = (code: number) => {
    if (code >= 51 && code <= 67) return <CloudRain className="w-5 h-5 text-sky-500" />;
    if (code >= 1 && code <= 3) return <CloudSun className="w-5 h-5 text-amber-500" />;
    return <Sun className="w-5 h-5 text-amber-500" />;
  };

  return (
    <div className="w-full space-y-4">
      {/* 1. Trip Summary Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <h3 className="font-display font-extrabold text-sm text-slate-900 dark:text-white">
              Trip Overview
            </h3>
          </div>
          {trip && (
            <button
              onClick={() => navigate(`/planner?destination=${encodeURIComponent(trip.destination)}`)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Edit Trip in Planner"
            >
              <Edit3 size={15} />
            </button>
          )}
        </div>

        {loadingTrip ? (
          <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
            Loading your active trip...
          </div>
        ) : !trip ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <Compass size={24} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                No Active Trip Saved
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Start planning your personalized getaway with AI
              </p>
            </div>
            <button
              onClick={() => navigate('/planner')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all inline-flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>Start Planning</span>
            </button>
          </div>
        ) : (
          <div className="pt-3.5 space-y-3 text-xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Destination
                </span>
                <div className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                  <MapPin size={15} className="text-blue-600 shrink-0" />
                  <span className="truncate">{trip.destination}</span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[10px] font-bold capitalize border border-blue-100 dark:border-blue-900">
                {trip.status || 'Active'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
              <div>
                <span className="text-slate-400 flex items-center gap-1">
                  <Calendar size={12} className="text-blue-500" />
                  <span>Dates</span>
                </span>
                <div className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5">
                  {trip.startDate ? new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Flexible'}
                  {trip.endDate && ` - ${new Date(trip.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
                </div>
              </div>

              <div>
                <span className="text-slate-400 flex items-center gap-1">
                  <Users size={12} className="text-teal-500" />
                  <span>Travelers</span>
                </span>
                <div className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5">
                  {trip.travelers || 2} {trip.travelers === 1 ? 'Guest' : 'Guests'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Weather Forecast Card */}
      {weatherData && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Live Weather • Open-Meteo
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {weatherData.timestamp}
            </span>
          </div>

          <div className="pt-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                {getWeatherIcon(weatherData.conditionCode)}
              </div>
              <div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {weatherData.temp}°C
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {weatherData.description}
                </div>
              </div>
            </div>

            {weatherData.rainProb !== undefined && (
              <div className="text-right">
                <span className="text-[10px] text-slate-400">Precipitation</span>
                <div className="text-xs font-bold text-sky-600 dark:text-sky-400">
                  {weatherData.rainProb}% rain
                </div>
              </div>
            )}
          </div>

          {/* Weather Alert / Advisory */}
          {weatherData.hasAlert && weatherData.alertMessage && (
            <div className="mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px] flex items-start gap-2">
              <AlertTriangle size={14} className="shrink-0 mt-0.5 text-amber-600" />
              <span>{weatherData.alertMessage}</span>
            </div>
          )}
        </div>
      )}

      {/* 3. Day-by-Day Expandable Itinerary */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-display font-extrabold text-sm text-slate-900 dark:text-white">
              Day-by-Day Itinerary
            </h3>
            <p className="text-[10px] text-slate-400">
              Verified Geoapify stops & OSRM driving times
            </p>
          </div>
          {savingItinerary && (
            <span className="text-[10px] text-blue-600 animate-pulse font-medium">
              Saving changes...
            </span>
          )}
        </div>

        {itineraryDays.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No stops added yet. Ask the AI assistant or generate a full schedule.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {itineraryDays.map((day) => {
              const isExpanded = expandedDay === day.day;
              return (
                <div
                  key={day.day}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 overflow-hidden transition-all"
                >
                  {/* Day Header Accordion Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      setExpandedDay(isExpanded ? 0 : day.day);
                      if (onSelectDay && !isExpanded) {
                        onSelectDay(day.day, day.stops);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                        {day.day}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-white">
                        Day {day.day}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        • {day.stops?.length || 0} stops
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {/* Stops List */}
                  {isExpanded && day.stops && day.stops.length > 0 && (
                    <div className="p-3 pt-1 space-y-2.5 border-t border-slate-200/50 dark:border-slate-800">
                      {day.stops.map((stop, sIdx) => {
                        const coords = stop.place?.coordinates || stop.coordinates;
                        return (
                          <div
                            key={stop._id || sIdx}
                            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 text-xs space-y-1.5 shadow-2xs group hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2">
                                <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                                  {sIdx + 1}
                                </span>
                                <div>
                                  <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                                    {stop.place?.name || stop.name || 'Tourist Attraction'}
                                  </div>
                                  <div className="text-[10px] text-slate-400 line-clamp-1">
                                    {stop.place?.address || stop.address || 'Verified Destination'}
                                  </div>
                                </div>
                              </div>

                              {/* Stop Action Buttons (Move up/down, remove) */}
                              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                {sIdx > 0 && (
                                  <button
                                    onClick={() => handleMoveActivity(day.day, sIdx, 'up')}
                                    className="p-1 hover:text-blue-600 text-slate-400"
                                    title="Move earlier"
                                  >
                                    <MoveUp size={11} />
                                  </button>
                                )}
                                {sIdx < day.stops.length - 1 && (
                                  <button
                                    onClick={() => handleMoveActivity(day.day, sIdx, 'down')}
                                    className="p-1 hover:text-blue-600 text-slate-400"
                                    title="Move later"
                                  >
                                    <MoveDown size={11} />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleRemoveActivity(day.day, sIdx)}
                                  className="p-1 hover:text-red-600 text-slate-400"
                                  title="Remove stop"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </div>

                            {/* Duration, Route Transit & Map Link */}
                            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700/50">
                              <span className="flex items-center gap-1">
                                <Clock size={10} className="text-blue-500" />
                                <span>{stop.duration || 90} mins visit</span>
                              </span>

                              {coords && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onFocusStop) {
                                      onFocusStop(coords.lat, coords.lng);
                                    }
                                  }}
                                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
                                >
                                  <Navigation size={10} />
                                  <span>Focus on Map</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Quick Actions Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
          Quick Travel Workflows
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Link
            to="/explore"
            className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/40 border border-slate-200/70 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-all flex flex-col gap-1.5"
          >
            <Compass size={18} className="text-blue-500" />
            <span className="font-bold text-xs">Explore Places</span>
            <span className="text-[10px] text-slate-400">Geoapify search</span>
          </Link>

          <Link
            to="/bookings?tab=hotels"
            className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/40 border border-slate-200/70 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-all flex flex-col gap-1.5"
          >
            <Building size={18} className="text-teal-500" />
            <span className="font-bold text-xs">Find Hotels</span>
            <span className="text-[10px] text-slate-400">Real room offers</span>
          </Link>

          <Link
            to="/bookings?tab=flights"
            className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/40 border border-slate-200/70 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-all flex flex-col gap-1.5"
          >
            <Plane size={18} className="text-indigo-500" />
            <span className="font-bold text-xs">Search Flights</span>
            <span className="text-[10px] text-slate-400">Live air routes</span>
          </Link>

          <Link
            to="/planner"
            className="p-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all flex flex-col gap-1.5"
          >
            <Sparkles size={18} className="text-blue-200" />
            <span className="font-bold text-xs">Plan with AI</span>
            <span className="text-[10px] text-blue-100">Grounded agent</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
