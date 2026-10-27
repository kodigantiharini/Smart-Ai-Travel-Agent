import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Map as MapIcon, LayoutGrid, FolderPlus, Compass, Trash2 } from 'lucide-react';
import { Favorite, Place } from '../types';
import { api } from '../services/api';
import { PlaceCard } from '../components/PlaceCard';
import { MapView } from '../components/MapView';
import { useAuth } from '../context/AuthContext';

export const SavedPlacesPage: React.FC = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [collections, setCollections] = useState<string[]>(['All Favorites']);
  const [selectedCollection, setSelectedCollection] = useState('All Favorites');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const [favRes, colRes] = await Promise.all([
        api.getFavorites(selectedCollection),
        api.getCollections(),
      ]);

      if (favRes.data) setFavorites(favRes.data);
      if (colRes.data) setCollections(colRes.data);
    } catch (err) {
      console.warn('Failed to load favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [user, selectedCollection]);

  const handleRemove = async (favId: string) => {
    try {
      await api.deleteFavorite(favId);
      setFavorites((prev) => prev.filter((f) => f._id !== favId && f.id !== favId && f.placeId !== favId));
    } catch (err) {
      console.error('Delete favorite failed:', err);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <Bookmark className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-2xl font-bold font-display text-navy-900 dark:text-white">
          Sign In to Access Saved Places
        </h2>
        <p className="text-sm text-slate-500">
          Curate custom collections of places you want to visit around the world.
        </p>
        <Link
          to="/login"
          className="inline-block px-6 py-3 rounded-2xl text-sm font-bold text-white bg-gradient-brand shadow-md"
        >
          Sign In
        </Link>
      </div>
    );
  }

  // Convert favorites to Place format for MapView
  const mapPlaces: Place[] = favorites.map((f) => ({
    id: f.placeId || f._id || '',
    placeId: f.placeId,
    name: f.name,
    city: '',
    country: '',
    category: f.category,
    description: f.notes || f.address,
    coordinates: f.coordinates,
    address: f.address,
    rating: f.rating || 4.8,
    ratingCount: f.ratingCount || 100,
    photos: f.photo ? [f.photo] : [],
    tags: [f.category],
    suggestedDurationMinutes: 90,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-navy-900 dark:text-white">
            Saved Places & Favorites
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Access your curated bucket list and explore them on an interactive map.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
          <Link
            to="/collections"
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-semibold glass-panel hover:text-teal-600 flex items-center justify-center gap-1.5 transition-colors min-h-[44px]"
          >
            <FolderPlus className="w-4 h-4 text-teal-500" />
            <span>Manage Collections</span>
          </Link>

          <div className="flex items-center gap-1 p-1 rounded-xl glass-panel border border-slate-200 dark:border-slate-800 min-h-[44px]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-lg text-xs font-semibold min-h-[36px] min-w-[36px] flex items-center justify-center ${
                viewMode === 'grid' ? 'bg-teal-500 text-white' : 'text-slate-500'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2.5 rounded-lg text-xs font-semibold min-h-[36px] min-w-[36px] flex items-center justify-center ${
                viewMode === 'map' ? 'bg-teal-500 text-white' : 'text-slate-500'
              }`}
            >
              <MapIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Collection Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-slate-200 dark:border-slate-800">
        {collections.map((col) => (
          <button
            key={col}
            onClick={() => setSelectedCollection(col)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedCollection === col
                ? 'bg-navy-900 text-white dark:bg-teal-500 dark:text-navy-950 font-bold'
                : 'text-slate-500 hover:text-navy-900 dark:hover:text-white'
            }`}
          >
            {col}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="glass-panel p-16 text-center rounded-4xl max-w-lg mx-auto space-y-4">
          <Bookmark className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-xl font-bold font-display text-navy-900 dark:text-white">
            No Saved Places Yet
          </h3>
          <p className="text-xs text-slate-500">
            Click the heart icon on any destination card to bookmark it for your upcoming adventures.
          </p>
          <Link
            to="/explore"
            className="inline-block px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-brand shadow-md"
          >
            Explore Destinations
          </Link>
        </div>
      ) : viewMode === 'map' ? (
        <div className="h-[360px] sm:h-[480px] lg:h-[650px] rounded-3xl sm:rounded-4xl overflow-hidden shadow-glass">
          <MapView places={mapPlaces} className="h-full w-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mapPlaces.map((place) => (
            <PlaceCard
              key={place.id || place.placeId}
              place={place}
              isSaved={true}
              onFavoriteChange={() => fetchFavorites()}
            />
          ))}
        </div>
      )}
    </div>
  );
};
