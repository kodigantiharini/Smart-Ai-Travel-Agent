import React, { useState, useEffect } from 'react';
import { Search, MapPin, Navigation, Compass, Layers } from 'lucide-react';
import { MapView } from '../components/MapView';
import { PlaceCard } from '../components/PlaceCard';
import { Place } from '../types';
import { api } from '../services/api';

export const MapPage: React.FC = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const res = await api.searchPlaces(searchQuery);
        if (res.data) {
          setPlaces(res.data);
          if (res.data.length > 0 && !selectedPlace) {
            setSelectedPlace(res.data[0]);
          }
        }
      } catch (err) {
        console.warn('Failed to load places for map:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-navy-900 dark:text-white">
            Interactive Global Map
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Explore live markers, view attraction details, and discover real-world coordinates.
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter map places..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[44px]"
          />
        </div>
      </div>

      {/* Main Map + Card Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Map Panel */}
        <div className="lg:col-span-8 h-[360px] sm:h-[480px] lg:h-[650px] relative rounded-3xl overflow-hidden shadow-lg">
          <MapView
            places={places}
            selectedPlace={selectedPlace}
            onSelectPlace={(place) => setSelectedPlace(place)}
            className="h-full w-full"
          />
        </div>

        {/* Selected Place Preview / Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel p-4 rounded-3xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">
              Selected Attraction
            </h3>
            {selectedPlace ? (
              <PlaceCard place={selectedPlace} />
            ) : (
              <div className="text-center py-12 text-slate-400">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Click any map pin to inspect attraction details.</p>
              </div>
            )}
          </div>

          {/* Quick List of Other Markers */}
          <div className="glass-panel p-4 rounded-3xl border border-slate-200 dark:border-slate-800 max-h-[300px] overflow-y-auto space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 mb-2">
              All Markers on Map ({places.length})
            </p>
            {places.map((p) => (
              <button
                key={p.id || p.placeId}
                onClick={() => setSelectedPlace(p)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-colors ${
                  selectedPlace?.id === p.id
                    ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <MapPin className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                  <span className="truncate">{p.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 ml-2">★ {p.rating}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
