import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, Clock, MapPin, ArrowRight, Plus } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Place } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface PlaceCardProps {
  place: Place;
  isSaved?: boolean;
  onFavoriteChange?: (saved: boolean) => void;
  onAddToTrip?: (place: Place) => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  isSaved = false,
  onFavoriteChange,
  onAddToTrip,
}) => {
  const { user } = useAuth();
  const [saved, setSaved] = useState(isSaved);
  const [saving, setSaving] = useState(false);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert('Please log in or click "Log In" to save favorites.');
      return;
    }

    setSaving(true);
    try {
      if (saved) {
        await api.deleteFavorite(place.placeId || place.id);
        setSaved(false);
        onFavoriteChange?.(false);
      } else {
        await api.addFavorite({
          placeId: place.placeId || place.id,
          name: place.name,
          category: place.category,
          address: place.address,
          coordinates: place.coordinates,
          rating: place.rating,
          ratingCount: place.ratingCount,
          photo: place.photos?.[0] || '',
          collectionName: 'All Favorites',
        });
        setSaved(true);
        onFavoriteChange?.(true);

        // Micro-animation confetti celebration
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#0D9488', '#10B981', '#F59E0B'],
        });
      }
    } catch (err: any) {
      console.error('Favorite action failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const formatCategory = (cat: string) => {
    return cat.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="group glass-card rounded-3xl overflow-hidden flex flex-col justify-between h-full transition-all duration-300">
      <div>
        {/* Cover Image Container */}
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-200 dark:bg-slate-800">
          <img
            src={place.photos?.[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'}
            alt={place.name}
            loading="lazy"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80') {
                target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';
              }
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-black/20 pointer-events-none" />

          {/* Category Pill */}
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-slate-900/80 backdrop-blur-md text-teal-300 border border-teal-500/30">
              {formatCategory(place.category || 'Attraction')}
            </span>
          </div>

          {/* Favorite Heart Button */}
          <button
            onClick={toggleFavorite}
            disabled={saving}
            aria-label={saved ? 'Remove from favorites' : 'Save to favorites'}
            className="absolute top-3 right-3 p-2.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md hover:scale-110 active:scale-95 transition-all text-slate-700 dark:text-slate-200 shadow-md"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                saved ? 'fill-rose-500 text-rose-500' : 'hover:text-rose-500'
              }`}
            />
          </button>

          {/* Distance Badge if available */}
          {place.distanceKm !== undefined && (
            <div className="absolute bottom-3 right-3">
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-800 dark:text-slate-200">
                {place.distanceKm} km away
              </span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-5">
          {/* Rating and Duration */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{place.rating ? place.rating.toFixed(1) : '4.5'}</span>
              <span className="text-[10px] font-normal text-slate-600 dark:text-slate-400">
                ({place.ratingCount || 100})
              </span>
            </div>

            {place.suggestedDurationMinutes && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>~{Math.round(place.suggestedDurationMinutes / 60)} hrs</span>
              </div>
            )}
          </div>

          {/* Place Title */}
          <Link to={`/places/${place.placeId || place.id}`}>
            <h3 className="text-lg font-bold font-display text-navy-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-1">
              {place.name}
            </h3>
          </Link>

          {/* Location Address */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3">
            <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="truncate">{place.address || `${place.city}, ${place.country}`}</span>
          </div>

          {/* Short Description */}
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-4">
            {place.description}
          </p>
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="p-5 pt-0 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800/80 mt-auto">
        <Link
          to={`/places/${place.placeId || place.id}`}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        {onAddToTrip && (
          <button
            onClick={() => onAddToTrip(place)}
            title="Add to Itinerary"
            className="p-2 rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
