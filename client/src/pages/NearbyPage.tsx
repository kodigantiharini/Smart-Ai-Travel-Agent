import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navigation, MapPin, Sliders, RefreshCw, Compass } from 'lucide-react';
import { PlaceCard } from '../components/PlaceCard';
import { MapView } from '../components/MapView';
import { CATEGORIES } from '../components/SearchBar';
import { Place } from '../types';
import { api } from '../services/api';

export const NearbyPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');

  const [lat, setLat] = useState<number>(latParam ? parseFloat(latParam) : 10.0889); // Default Munnar
  const [lng, setLng] = useState<number>(lngParam ? parseFloat(lngParam) : 77.0595);
  const [radius, setRadius] = useState<number>(25000); // 25 km
  const [category, setCategory] = useState<string>('all');
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const fetchNearby = async (targetLat: number, targetLng: number, targetRadius: number, cat: string) => {
    setLoading(true);
    try {
      const res = await api.getNearby(targetLat, targetLng, targetRadius, cat);
      if (res.data) {
        setPlaces(res.data);
        if (res.data.length > 0) setSelectedPlace(res.data[0]);
      }
    } catch (err) {
      console.warn('Failed to load nearby places:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearby(lat, lng, radius, category);
  }, [lat, lng, radius, category]);

  const requestGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDetectingGps(false);
        const { latitude, longitude } = pos.coords;
        setLat(latitude);
        setLng(longitude);
        setSearchParams({ lat: latitude.toString(), lng: longitude.toString() });
      },
      (err) => {
        setDetectingGps(false);
        alert(`Location permission denied or unavailable (${err.message}). Using current coordinates.`);
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-wider">
            <Navigation className="w-4 h-4" /> Real-time Proximity Discovery
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-navy-900 dark:text-white mt-1">
            Nearby Tourist Attractions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Explore sights within your custom radius calculated with authentic geographic coordinates.
          </p>
        </div>

        <button
          onClick={requestGps}
          disabled={detectingGps}
          className="w-full md:w-auto px-5 py-3 rounded-2xl text-xs font-bold text-white bg-gradient-brand hover:opacity-95 shadow-md shadow-glow-teal flex items-center justify-center gap-2 transition-all min-h-[44px]"
        >
          <Navigation className={`w-4 h-4 ${detectingGps ? 'animate-spin' : ''}`} />
          <span>{detectingGps ? 'Detecting GPS...' : 'Update Current Location'}</span>
        </button>
      </div>

      {/* Control Panel: Radius & Category */}
      <div className="glass-panel p-4 sm:p-5 rounded-3xl space-y-4 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-1">
              Search Radius:
            </span>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {[5000, 15000, 25000, 50000].map((rad) => (
                <button
                  key={rad}
                  onClick={() => setRadius(rad)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all min-h-[36px] ${
                    radius === rad
                      ? 'bg-teal-600 text-white dark:bg-teal-500 dark:text-navy-950 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {rad / 1000} km
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs font-semibold text-slate-500">
            Coordinates: {lat.toFixed(4)}, {lng.toFixed(4)}
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                category === cat.id
                  ? 'bg-navy-900 text-white dark:bg-teal-500 dark:text-navy-950'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map & Results Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Nearby Cards List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Found {places.length} places within {radius / 1000} km</span>
            <span>Sorted by closest proximity</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-72 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : places.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-3xl space-y-3">
              <Compass className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-navy-900 dark:text-white">
                No spots within {radius / 1000} km
              </p>
              <p className="text-xs text-slate-500">
                Try expanding your search radius to 50 km or switching categories.
              </p>
              <button
                onClick={() => setRadius(50000)}
                className="px-4 py-2 text-xs font-bold text-white bg-teal-600 rounded-xl"
              >
                Expand Radius to 50 km
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {places.map((place) => (
                <div
                  key={place.id || place.placeId}
                  onClick={() => setSelectedPlace(place)}
                  className={`cursor-pointer rounded-3xl transition-all ${
                    selectedPlace?.id === place.id ? 'ring-2 ring-teal-500' : ''
                  }`}
                >
                  <PlaceCard place={place} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Proximity Map */}
        <div className="lg:col-span-5 lg:sticky lg:top-28 h-[360px] sm:h-[450px] lg:h-[600px] rounded-3xl overflow-hidden shadow-glass">
          <MapView
            places={places}
            selectedPlace={selectedPlace}
            center={[lat, lng]}
            zoom={12}
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
};
