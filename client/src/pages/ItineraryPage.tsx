import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  Trash2,
  ChevronUp,
  ChevronDown,
  Navigation,
  Download,
  Share2,
  Plus,
  Compass,
  AlertTriangle,
  Car,
  ShieldCheck,
  DollarSign,
  CloudSun,
} from 'lucide-react';
import { Trip, ItineraryDay, ItineraryStop, WeatherReport } from '../types';
import { api } from '../services/api';
import { MapView } from '../components/MapView';
import { WeatherWidget } from '../components/WeatherWidget';

export const ItineraryPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [days, setDays] = useState<ItineraryDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  // Weather & Live Routes
  const [weatherData, setWeatherData] = useState<WeatherReport | null>(null);
  const [routePolyline, setRoutePolyline] = useState<[number, number][]>([]);
  const [routeMetrics, setRouteMetrics] = useState<{ distanceKm: number; durationMinutes: number; travelMode?: string } | undefined>(undefined);

  // Currency conversion
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [exchangeRate, setExchangeRate] = useState(1);
  const [convertingFx, setConvertingFx] = useState(false);

  useEffect(() => {
    if (!tripId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [tripRes, itinRes] = await Promise.all([
          api.getTrip(tripId),
          api.getTripItinerary(tripId),
        ]);

        if (tripRes.data) {
          setTrip(tripRes.data);
          setSelectedCurrency(tripRes.data.currency || 'USD');
          // Fetch live weather for destination
          api.getWeather(undefined, undefined, tripRes.data.destination).then((wRes) => {
            if (wRes.data) setWeatherData(wRes.data);
          }).catch(console.warn);
        }
        if (itinRes.data) {
          setDays(itinRes.data);
        }
      } catch (err) {
        console.error('Failed to load itinerary:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [tripId]);

  // Recalculate route polyline when active day changes
  useEffect(() => {
    const activeDay = days[activeDayIndex] || days[0];
    const stops = activeDay?.stops || [];

    if (stops.length >= 2) {
      const orig = stops[0].coordinates;
      const dest = stops[stops.length - 1].coordinates;
      if (orig?.lat && dest?.lat) {
        api.getRoutes(orig, dest, 'DRIVE').then((rRes) => {
          if (rRes.data?.coordinates) {
            setRoutePolyline(rRes.data.coordinates);
            setRouteMetrics({
              distanceKm: rRes.data.distanceKm,
              durationMinutes: rRes.data.durationMinutes,
              travelMode: 'drive',
            });
          }
        }).catch(() => {
          setRoutePolyline(stops.map((s) => [s.coordinates.lat, s.coordinates.lng]));
        });
      }
    } else if (stops.length === 1 && stops[0].coordinates?.lat) {
      setRoutePolyline([[stops[0].coordinates.lat, stops[0].coordinates.lng]]);
      setRouteMetrics(undefined);
    } else {
      setRoutePolyline([]);
      setRouteMetrics(undefined);
    }
  }, [days, activeDayIndex]);

  // Handle currency conversion
  const handleCurrencyChange = async (newCurr: string) => {
    if (!trip || newCurr === selectedCurrency) return;
    setConvertingFx(true);
    try {
      const res = await api.convertCurrency(1, trip.currency || 'USD', newCurr);
      if (res.data?.exchangeRate) {
        setExchangeRate(res.data.exchangeRate);
        setSelectedCurrency(newCurr);
      }
    } catch (err) {
      console.warn('Currency convert error:', err);
    } finally {
      setConvertingFx(false);
    }
  };

  const handleMoveStop = async (dayIdx: number, stopIdx: number, direction: 'up' | 'down') => {
    const newDays = [...days];
    const currentStops = [...newDays[dayIdx].stops];
    const targetIdx = direction === 'up' ? stopIdx - 1 : stopIdx + 1;

    if (targetIdx < 0 || targetIdx >= currentStops.length) return;

    // Swap
    const temp = currentStops[stopIdx];
    currentStops[stopIdx] = currentStops[targetIdx];
    currentStops[targetIdx] = temp;

    // Update order indexes
    currentStops.forEach((s, i) => (s.order = i));
    newDays[dayIdx].stops = currentStops;

    setDays(newDays);
    await saveItinerary(newDays);
  };

  const handleDeleteStop = async (dayIdx: number, stopIdx: number) => {
    if (!confirm('Are you sure you want to remove this stop from your itinerary?')) return;
    const newDays = [...days];
    newDays[dayIdx].stops.splice(stopIdx, 1);
    newDays[dayIdx].stops.forEach((s, i) => (s.order = i));

    setDays(newDays);
    await saveItinerary(newDays);
  };

  const saveItinerary = async (updatedDays: ItineraryDay[]) => {
    if (!tripId) return;
    setSaving(true);
    try {
      await api.updateTripItinerary(tripId, updatedDays);
    } catch (err) {
      console.error('Failed to save itinerary changes:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const textContent = `TRIPWISE AI GROUNDED ITINERARY: ${trip?.name}
Destination: ${trip?.destination}
Dates: ${trip?.startDate} to ${trip?.endDate}
Budget: ${selectedCurrency} ${Math.round((trip?.budget || 0) * exchangeRate)}
Data Source: Geoapify Verified Places & Open-Meteo Meteorology

${days
  .map(
    (d) => `--- ${d.title} (${d.date}) ---
Weather Forecast: ${d.weather?.condition || 'Mild'} (${d.weather?.tempMax || 24}°C) • Rain: ${d.weather?.rainProbability || 0}%
${d.weather?.advisory ? `Advisory: ${d.weather.advisory}\n` : ''}
${d.stops
  .map(
    (s, i) =>
      `${i + 1}. ${s.name} [${s.arrivalTime} - ${s.departureTime}]
   Category: ${s.category.replace('_', ' ')}
   Address: ${s.address}
   Estimated Duration: ${s.visitDurationMinutes} mins | Cost: ${selectedCurrency} ${Math.round((s.estimatedCost || 0) * exchangeRate)}
   ${s.travelTimeMinutes ? `Driving time from previous stop: ~${s.travelTimeMinutes} mins (${s.distanceFromPrevKm || 5} km)` : ''}
   ${s.notes ? `Note: ${s.notes}` : ''}`
  )
  .join('\n\n')}`
  )
  .join('\n\n')}
`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${trip?.name || 'TripWise'}_Itinerary.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-3">
        <h2 className="text-xl font-bold">Trip not found</h2>
        <Link to="/trips" className="text-teal-600 font-bold hover:underline">
          Return to My Trips
        </Link>
      </div>
    );
  }

  const activeDay = days[activeDayIndex] || days[0];
  const activeStops = activeDay?.stops || [];
  const mapPlaces = activeStops.map((s) => ({
    id: s.placeId || s.id || '',
    placeId: s.placeId,
    name: s.name,
    city: trip.destination,
    country: '',
    category: s.category,
    description: s.notes || '',
    coordinates: s.coordinates,
    address: s.address,
    rating: 4.8,
    ratingCount: 100,
    photos: s.photo ? [s.photo] : [],
    tags: [s.category],
    suggestedDurationMinutes: s.visitDurationMinutes,
  }));

  const activeDayWeather = activeDay?.weather;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/trips')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-600 mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> All Trips
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-display font-extrabold text-navy-900 dark:text-white">
              {trip.name}
            </h1>
            <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-full border border-teal-500/20">
              Geoapify & Weather Grounded
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {trip.destination} • {trip.startDate} to {trip.endDate} • {trip.travelers} traveler(s)
          </p>
        </div>

        {/* Currency Selector & Export Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 self-start md:self-auto w-full md:w-auto">
          {/* Currency Toggle */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs min-h-[44px]">
            <DollarSign size={14} className="text-teal-500 ml-1.5" />
            {(['USD', 'INR', 'EUR', 'GBP', 'AED'] as const).map((cur) => (
              <button
                key={cur}
                onClick={() => handleCurrencyChange(cur)}
                className={`px-2.5 py-1.5 rounded-xl font-bold transition-all min-h-[36px] ${
                  selectedCurrency === cur
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-teal-600'
                }`}
              >
                {cur}
              </button>
            ))}
          </div>

          <Link
            to={`/budget?tripId=${tripId}`}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl text-xs font-semibold glass-panel hover:text-teal-600 transition-colors min-h-[44px] flex items-center justify-center"
          >
            Budget Planner
          </Link>

          <button
            onClick={handleExport}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 glass-panel hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-all shadow-xs min-h-[44px]"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Weather Header Widget */}
      {weatherData && (
        <div>
          <WeatherWidget weather={weatherData} />
        </div>
      )}

      {/* Day Tabs */}
      {days.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-slate-200 dark:border-slate-800">
          {days.map((d, idx) => (
            <button
              key={d._id || idx}
              onClick={() => setActiveDayIndex(idx)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeDayIndex === idx
                  ? 'bg-navy-900 text-white dark:bg-teal-500 dark:text-navy-950 shadow-md shadow-glow-teal'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-navy-900'
              }`}
            >
              <span>Day {d.dayNumber}: {d.title || d.date}</span>
              {d.weather && (
                <span className="text-[10px] opacity-80">
                  • {d.weather.tempMax}°C {d.weather.rainProbability > 30 ? '💧' : '☀️'}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Day Advisory Alert if Weather Impact */}
      {activeDayWeather?.advisory && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs">
          <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Weather Context for Day {activeDay?.dayNumber}: </span>
            <span>{activeDayWeather.advisory}</span>
          </div>
        </div>
      )}

      {/* Stops Schedule + Interactive Day Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Stops List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>{activeStops.length} Chronological Stops</span>
            {saving && <span className="text-teal-600 animate-pulse font-bold">Saving changes...</span>}
          </div>

          {activeStops.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-3xl space-y-3">
              <Compass className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-navy-900 dark:text-white">
                No stops scheduled for this day
              </p>
              <p className="text-xs text-slate-500">
                Browse destinations to add attractions to your daily plan.
              </p>
              <Link
                to={`/explore?q=${encodeURIComponent(trip.destination)}`}
                className="inline-block px-4 py-2 text-xs font-bold text-white bg-teal-600 rounded-xl"
              >
                Browse {trip.destination} Places
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {activeStops.map((stop, sIdx) => (
                <div key={stop.id || sIdx} className="space-y-2">
                  {/* Driving Route Metric Indicator between stops */}
                  {sIdx > 0 && (
                    <div className="flex items-center gap-2 pl-6 py-1 text-slate-400 text-xs">
                      <div className="w-0.5 h-6 bg-teal-500/40 ml-2" />
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300">
                        <Car size={12} className="text-teal-500" />
                        <span>~{stop.travelTimeMinutes || 20} mins drive ({stop.distanceFromPrevKm || 6.5} km)</span>
                      </div>
                    </div>
                  )}

                  <div className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-9 h-9 rounded-2xl bg-teal-600 text-white font-display font-extrabold flex items-center justify-center shrink-0 shadow-sm">
                          {sIdx + 1}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md">
                              {stop.category.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs text-slate-400">
                              {stop.arrivalTime} - {stop.departureTime}
                            </span>
                          </div>

                          <h3 className="text-base font-bold font-display text-navy-900 dark:text-white">
                            {stop.name}
                          </h3>

                          <p className="text-xs text-slate-500 truncate max-w-sm">
                            {stop.address}
                          </p>
                        </div>
                      </div>

                      {/* Reorder and Delete Controls */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleMoveStop(activeDayIndex, sIdx, 'up')}
                          disabled={sIdx === 0}
                          title="Move Up in Schedule"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-navy-900 disabled:opacity-30"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleMoveStop(activeDayIndex, sIdx, 'down')}
                          disabled={sIdx === activeStops.length - 1}
                          title="Move Down in Schedule"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-navy-900 disabled:opacity-30"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteStop(activeDayIndex, sIdx)}
                          title="Remove Stop"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {stop.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl">
                        "{stop.notes}"
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                      <span>Visit Duration: ~{stop.visitDurationMinutes} mins</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        Est. Cost: {selectedCurrency} {Math.round((stop.estimatedCost || 0) * exchangeRate)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Day Map Route View */}
        <div className="lg:col-span-5 lg:sticky lg:top-28 h-[360px] sm:h-[450px] lg:h-[550px] rounded-3xl overflow-hidden shadow-glass">
          <MapView
            places={mapPlaces}
            routeCoordinates={routePolyline}
            routeMetrics={routeMetrics}
            showStopNumbers={true}
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
};
