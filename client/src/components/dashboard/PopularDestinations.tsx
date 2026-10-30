import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Star,
  ArrowRight,
  Sparkles,
  Compass,
  Navigation,
} from 'lucide-react';
import { Place } from '../../types';
import { api } from '../../services/api';

const VERIFIED_POPULAR_PLACES: Place[] = [
  {
    id: 'taj-mahal-agra',
    placeId: 'taj-mahal-agra',
    name: 'The Taj Mahal & Yamuna Gardens',
    city: 'Agra',
    country: 'India',
    category: 'historical_monument',
    description: 'An immense ivory-white marble mausoleum on the south bank of the Yamuna River, commissioned in 1632 by Mughal Emperor Shah Jahan. A UNESCO World Heritage Site.',
    coordinates: { lat: 27.1751, lng: 78.0421 },
    address: 'Dharmapuri, Forest Colony, Tajganj, Agra, Uttar Pradesh 282001, India',
    rating: 4.9,
    ratingCount: 465000,
    photos: [
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
    ],
    openingHours: ['Sunrise to Sunset (Closed Fridays)'],
    suggestedDurationMinutes: 180,
    tags: ['historical_monument', 'unesco', 'heritage'],
  },
  {
    id: 'eravikulam-munnar',
    placeId: 'eravikulam-munnar',
    name: 'Eravikulam National Park & Anamudi Peak',
    city: 'Munnar',
    country: 'India',
    category: 'mountain',
    description: 'Kerala premier national park in the Western Ghats, home to the endangered Nilgiri Tahr and South India highest summit, Anamudi Peak. Rolling tea plantations and blooming Neelakurinji hills.',
    coordinates: { lat: 10.1518, lng: 77.0601 },
    address: 'Wildlife Warden, Munnar PO, Idukki, Kerala 685612, India',
    rating: 4.8,
    ratingCount: 142000,
    photos: [
      'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1200&q=80',
    ],
    openingHours: ['7:00 AM - 4:00 PM Daily'],
    suggestedDurationMinutes: 240,
    tags: ['mountain', 'nature', 'wildlife', 'tea_plantations'],
  },
  {
    id: 'fushimi-inari-kyoto',
    placeId: 'fushimi-inari-kyoto',
    name: 'Fushimi Inari-taisha & Senbon Torii',
    city: 'Kyoto',
    country: 'Japan',
    category: 'religious_site',
    description: 'The head shrine of the kami Inari, famed for its corridor of over 10,000 vibrant vermilion Torii gates winding up the sacred Mount Inari.',
    coordinates: { lat: 34.9671, lng: 135.7727 },
    address: '68 Fukakusa Yabunouchicho, Fushimi Ward, Kyoto, 612-0882, Japan',
    rating: 4.8,
    ratingCount: 228000,
    photos: [
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    ],
    openingHours: ['Open 24 hours daily'],
    suggestedDurationMinutes: 180,
    tags: ['religious_site', 'culture', 'torii_gates'],
  },
  {
    id: 'calangute-baga-goa',
    placeId: 'calangute-baga-goa',
    name: 'Calangute & Baga Golden Beaches',
    city: 'Goa',
    country: 'India',
    category: 'beach',
    description: 'North Goa celebrated Arabian Sea coastline featuring miles of soft golden sand, beach shacks serving fresh seafood, parasailing, and vibrant sunset strolls.',
    coordinates: { lat: 15.5439, lng: 73.7553 },
    address: 'Baga Beach, Calangute, North Goa 403516, India',
    rating: 4.7,
    ratingCount: 185000,
    photos: [
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    ],
    openingHours: ['Open 24 hours daily'],
    suggestedDurationMinutes: 180,
    tags: ['beach', 'watersports', 'sunset'],
  },
  {
    id: 'eiffel-tower-paris',
    placeId: 'eiffel-tower-paris',
    name: 'Eiffel Tower & Champ de Mars',
    city: 'Paris',
    country: 'France',
    category: 'viewpoint',
    description: 'The world most recognized architectural icon, designed by Gustave Eiffel for the 1889 Exposition Universelle, offering panoramic views of Paris.',
    coordinates: { lat: 48.8584, lng: 2.2945 },
    address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France',
    rating: 4.7,
    ratingCount: 410000,
    photos: [
      'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80',
    ],
    openingHours: ['9:00 AM - 11:45 PM Daily'],
    suggestedDurationMinutes: 150,
    tags: ['viewpoint', 'landmark', 'paris'],
  },
  {
    id: 'colosseum-rome',
    placeId: 'colosseum-rome',
    name: 'Colosseum & Roman Forum',
    city: 'Rome',
    country: 'Italy',
    category: 'historical_monument',
    description: 'The legendary amphitheater of Imperial Rome, an architectural marvel of ancient travertine limestone and concrete completed in 80 AD.',
    coordinates: { lat: 41.8902, lng: 12.4922 },
    address: 'Piazza del Colosseo, 1, 00184 Roma RM, Italy',
    rating: 4.8,
    ratingCount: 395000,
    photos: [
      'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
    ],
    openingHours: ['8:30 AM - 7:00 PM Daily'],
    suggestedDurationMinutes: 180,
    tags: ['historical_monument', 'unesco', 'ancient_rome'],
  },
];

interface PopularDestinationsProps {
  onSelectDestination?: (place: Place) => void;
}

export const PopularDestinations: React.FC<PopularDestinationsProps> = ({
  onSelectDestination,
}) => {
  const [places, setPlaces] = useState<Place[]>(VERIFIED_POPULAR_PLACES);
  const [loading, setLoading] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchPopular = async () => {
      try {
        const res = await api.searchPlaces('');
        if (isMounted && res.data && res.data.length > 0) {
          setPlaces(res.data);
        }
      } catch (err: any) {
        console.warn('Destinations live sync fallback:', err?.message);
        if (isMounted) {
          setPlaces(VERIFIED_POPULAR_PLACES);
        }
      }
    };

    fetchPopular();
    return () => {
      isMounted = false;
    };
  }, []);

  const categories = [
    { id: 'all', label: 'All Destinations' },
    { id: 'nature', label: 'Nature & Parks' },
    { id: 'culture', label: 'Culture & Heritage' },
    { id: 'beach', label: 'Beaches & Coast' },
  ];

  const filteredPlaces = places.filter((p) => {
    if (filter === 'all') return true;
    if (filter === 'nature') {
      return (
        p.category === 'mountain' ||
        p.category === 'waterfall' ||
        p.category === 'park' ||
        p.category === 'nature'
      );
    }
    if (filter === 'culture') {
      return (
        p.category === 'historical_monument' ||
        p.category === 'museum' ||
        p.category === 'religious_site'
      );
    }
    if (filter === 'beach') {
      return p.category === 'beach' || p.category === 'viewpoint';
    }
    return true;
  });

  return (
    <section className="space-y-4">
      {/* Header and Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-display font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Popular Destinations</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold border border-blue-200/50 dark:border-blue-800">
              Verified
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real tourist attractions with accurate coordinates and routing support
          </p>
        </div>

        {/* Filter Pills & Explore All Link */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filter === cat.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
          <Link
            to="/explore"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 shrink-0 ml-1"
          >
            <span>View All</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-700/60"
            />
          ))}
        </div>
      )}

      {/* Cards Grid */}
      {!loading && filteredPlaces.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredPlaces.slice(0, 4).map((place) => {
            const hasRealRating = place.rating && place.rating > 0;
            return (
              <div
                key={place._id || place.id}
                className="group relative bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 overflow-hidden shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col justify-between"
              >
                {/* Photo Header */}
                <div className="relative h-40 overflow-hidden bg-slate-200 dark:bg-slate-700">
                  <img
                    src={place.image || place.images?.[0] || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Rating / Category Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-[10px] font-bold text-slate-800 dark:text-slate-100 shadow-sm capitalize">
                      {place.category?.replace('_', ' ') || 'Attraction'}
                    </span>

                    {hasRealRating ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/90 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                        <Star size={11} className="fill-white" />
                        <span>{place.rating?.toFixed(1)}</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-blue-600/90 text-white text-[10px] font-bold shadow-sm">
                        Verified
                      </span>
                    )}
                  </div>

                  {/* Coordinates indicator at bottom of image */}
                  <div className="absolute bottom-2 left-2.5 text-[10px] text-white/90 font-mono font-medium flex items-center gap-1 drop-shadow">
                    <Navigation size={10} className="text-blue-400" />
                    <span>
                      {place.coordinates?.lat?.toFixed(2)}°, {place.coordinates?.lng?.toFixed(2)}°
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-3.5 flex flex-col justify-between flex-1">
                  <div>
                    <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 mb-0.5">
                      <MapPin size={12} />
                      <span className="truncate">{place.country || place.city || 'Global Destination'}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {place.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                      {place.description || 'Discover historic landscapes, iconic architecture, and vibrant local sights.'}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectDestination) {
                          onSelectDestination(place);
                        } else {
                          navigate(`/planner?destination=${encodeURIComponent(place.name)}`);
                        }
                      }}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Sparkles size={12} />
                      <span>Plan Trip</span>
                    </button>

                    <Link
                      to={`/places/${place._id || place.id}`}
                      className="py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1"
                      title="View Details"
                    >
                      <span>Explore</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
