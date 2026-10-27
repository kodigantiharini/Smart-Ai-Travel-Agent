import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Compass,
  LayoutGrid,
  Map as MapIcon,
  Star,
  ArrowUpDown,
  Search,
  Building,
  UtensilsCrossed,
  Plane,
  Train,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Users,
} from 'lucide-react';
import { PlaceCard } from '../components/PlaceCard';
import { MapView } from '../components/MapView';
import { CATEGORIES } from '../components/SearchBar';
import { Place, HotelOffer, RestaurantItem, FlightOffer, TransportOption } from '../types';
import { api } from '../services/api';

type ExploreTab = 'places' | 'hotels' | 'restaurants' | 'flights';

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || 'Munnar';
  const initialCategory = searchParams.get('category') || 'all';

  const [activeTab, setActiveTab] = useState<ExploreTab>('places');
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);

  // Places Data
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'split'>('grid');
  const [sortBy, setSortBy] = useState<'rating' | 'name' | 'duration'>('rating');
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // Hotels Data
  const [hotels, setHotels] = useState<HotelOffer[]>([]);
  const [loadingHotels, setLoadingHotels] = useState(false);

  // Restaurants Data
  const [restaurants, setRestaurants] = useState<RestaurantItem[]>([]);
  const [dietaryFilter, setDietaryFilter] = useState<string>('all');
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);

  // Flights & Transit Data
  const [flightOrigin, setFlightOrigin] = useState('DEL');
  const [flightDest, setFlightDest] = useState('COK');
  const [flights, setFlights] = useState<FlightOffer[]>([]);
  const [transitOptions, setTransitOptions] = useState<TransportOption[]>([]);
  const [loadingFlights, setLoadingFlights] = useState(false);

  // Sync state with URL params
  useEffect(() => {
    if (searchParams.get('q')) setQuery(searchParams.get('q')!);
    if (searchParams.get('category')) setCategory(searchParams.get('category')!);
  }, [searchParams]);

  // Fetch places
  useEffect(() => {
    if (activeTab !== 'places') return;
    const fetchPlaces = async () => {
      setLoading(true);
      try {
        const res = await api.searchPlaces(query, category);
        if (res.data) {
          setPlaces(res.data);
          if (res.data.length > 0) setSelectedPlace(res.data[0]);
        }
      } catch (err) {
        console.warn('Failed to load places:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, [query, category, activeTab]);

  // Fetch hotels
  useEffect(() => {
    if (activeTab !== 'hotels') return;
    setLoadingHotels(true);
    api.searchHotels(query || 'Munnar')
      .then((res) => {
        if (res.data?.hotels) setHotels(res.data.hotels);
      })
      .catch(console.warn)
      .finally(() => setLoadingHotels(false));
  }, [query, activeTab]);

  // Fetch restaurants
  useEffect(() => {
    if (activeTab !== 'restaurants') return;
    setLoadingRestaurants(true);
    api.searchRestaurants(query || 'Munnar', undefined, dietaryFilter !== 'all' ? dietaryFilter : undefined)
      .then((res) => {
        if (res.data?.restaurants) setRestaurants(res.data.restaurants);
      })
      .catch(console.warn)
      .finally(() => setLoadingRestaurants(false));
  }, [query, dietaryFilter, activeTab]);

  // Fetch flights & transit
  useEffect(() => {
    if (activeTab !== 'flights') return;
    setLoadingFlights(true);
    Promise.all([
      api.searchFlights(flightOrigin, flightDest),
      api.searchTransport(query || 'Cochin', 'Munnar'),
    ])
      .then(([fRes, tRes]) => {
        if (fRes.data?.offers) setFlights(fRes.data.offers);
        if (tRes.data?.options) setTransitOptions(tRes.data.options);
      })
      .catch(console.warn)
      .finally(() => setLoadingFlights(false));
  }, [flightOrigin, flightDest, query, activeTab]);

  const updateFilters = (newQ: string, newCat: string) => {
    setQuery(newQ);
    setCategory(newCat);
    const params: Record<string, string> = {};
    if (newQ) params.q = newQ;
    if (newCat && newCat !== 'all') params.category = newCat;
    setSearchParams(params);
  };

  const filteredPlaces = places
    .filter((p) => (minRating > 0 ? p.rating >= minRating : true))
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'duration') return (a.suggestedDurationMinutes || 0) - (b.suggestedDurationMinutes || 0);
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header and Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-navy-900 dark:text-white">
            Explore & Bookings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time verified attractions, accommodations, restaurants, flights, and transit networks.
          </p>
        </div>

        {/* View Mode Switcher for Places */}
        {activeTab === 'places' && (
          <div className="flex items-center gap-1.5 p-1 rounded-2xl glass-panel self-start md:self-auto border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-teal-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-navy-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>

            <button
              onClick={() => setViewMode('split')}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'split'
                  ? 'bg-teal-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-navy-900'
              }`}
            >
              <MapIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Map & List</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Feature Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'places', label: 'Attractions & Sights', icon: Compass },
          { id: 'hotels', label: 'Hotels & Resorts', icon: Building },
          { id: 'restaurants', label: 'Restaurants & Cafes', icon: UtensilsCrossed },
          { id: 'flights', label: 'Flights & Transit', icon: Plane },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ExploreTab)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SEARCH BAR (Common to Places, Hotels, Restaurants) */}
      {activeTab !== 'flights' && (
        <div className="glass-panel p-4 rounded-3xl space-y-3.5 border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row gap-2.5 sm:gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => updateFilters(e.target.value, category)}
                placeholder="Search destination (e.g., Munnar, Paris, Kyoto, Goa)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {activeTab === 'places' && (
              <div className="flex items-center gap-2">
                <div className="flex-1 sm:flex-initial flex items-center gap-1.5">
                  <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
                  <select
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="w-full sm:w-auto py-2.5 px-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="rating">Top Rated</option>
                    <option value="name">Alphabetical</option>
                    <option value="duration">Visit Duration</option>
                  </select>
                </div>

                <div className="flex-1 sm:flex-initial flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 shrink-0" />
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    className="w-full sm:w-auto py-2.5 px-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
                  >
                    <option value={0}>All Ratings</option>
                    <option value={4.5}>★ 4.5 & up</option>
                    <option value={4.0}>★ 4.0 & up</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'restaurants' && (
              <div className="flex items-center gap-2">
                <select
                  value={dietaryFilter}
                  onChange={(e) => setDietaryFilter(e.target.value)}
                  className="w-full sm:w-auto py-2.5 px-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
                >
                  <option value="all">All Dietary Preferences</option>
                  <option value="vegetarian">🥬 Pure Vegetarian</option>
                  <option value="vegan">🌱 Vegan</option>
                  <option value="halal">🍗 Halal Friendly</option>
                  <option value="family-friendly">👨‍👩‍👦 Family Friendly</option>
                </select>
              </div>
            )}
          </div>

          {activeTab === 'places' && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100 dark:border-slate-800/80 pb-1">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => updateFilters(query, cat.id)}
                    className={`whitespace-nowrap px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all shrink-0 ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-200/60 dark:border-slate-700/60'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 1. PLACES TAB */}
      {activeTab === 'places' && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : filteredPlaces.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-3xl p-8 max-w-lg mx-auto">
              <Compass className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-navy-900 dark:text-white">No destinations found</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">Try adjusting your search terms.</p>
              <button
                onClick={() => updateFilters('', 'all')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700"
              >
                Reset Filters
              </button>
            </div>
          ) : viewMode === 'split' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-6 space-y-4 max-h-[750px] overflow-y-auto pr-2">
                <div className="text-xs font-semibold text-slate-500 mb-2">Showing {filteredPlaces.length} places</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredPlaces.map((place) => (
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
              </div>

              <div className="lg:col-span-6 lg:sticky lg:top-28">
                <MapView
                  places={filteredPlaces}
                  selectedPlace={selectedPlace}
                  onSelectPlace={(p) => setSelectedPlace(p)}
                  className="h-[350px] sm:h-[480px] lg:h-[650px] w-full"
                />
              </div>
            </div>
          ) : (
            <div>
              <div className="text-xs font-semibold text-slate-500 mb-4">
                Showing {filteredPlaces.length} verified destinations
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlaces.map((place) => (
                  <PlaceCard key={place.id || place.placeId} place={place} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* 2. HOTELS TAB */}
      {activeTab === 'hotels' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Accommodations & Resorts in {query}
            </h2>
            <span className="text-xs text-slate-500">Verified Pricing & Real Coordinates</span>
          </div>

          {loadingHotels ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="glass-card rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-glass flex flex-col justify-between"
                >
                  <img
                    src={hotel.photos[0]}
                    alt={hotel.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span className="capitalize font-semibold text-teal-600">{hotel.category.replace('_', ' ')}</span>
                        <span className="font-bold text-amber-500">★ {hotel.rating} ({hotel.ratingCount})</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{hotel.name}</h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{hotel.address}</p>

                      <div className="flex flex-wrap gap-1 mt-3">
                        {hotel.amenities.slice(0, 4).map((am, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {am}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-base font-extrabold text-teal-600 dark:text-teal-400">
                          {hotel.currency} {hotel.pricePerNight.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 block">/ night (indicative)</span>
                      </div>

                      <a
                        href={hotel.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <span>Check Offer</span>
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

      {/* 3. RESTAURANTS TAB */}
      {activeTab === 'restaurants' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Dining & Culinary Gems in {query}
            </h2>
            <span className="text-xs text-slate-500">Curated Local Flavors & Dietary Tags</span>
          </div>

          {loadingRestaurants ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-56 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((rst) => (
                <div
                  key={rst.id}
                  className="glass-card rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-glass p-5 space-y-3"
                >
                  <img
                    src={rst.photos[0]}
                    alt={rst.name}
                    className="w-full h-40 object-cover rounded-2xl"
                  />
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span className="text-amber-500 font-bold">★ {rst.rating} ({rst.ratingCount})</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{rst.priceIndicator}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{rst.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{rst.address}</p>
                    <p className="text-[11px] text-teal-600 dark:text-teal-400 mt-1 font-medium">{rst.openingHoursStatus}</p>

                    <div className="flex flex-wrap gap-1 mt-3">
                      {rst.dietaryTags.map((tag, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold uppercase">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-600 dark:text-slate-300">
                      <span className="font-bold">Must-try: </span>
                      <span>{rst.mustTryDishes.join(', ')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. FLIGHTS & TRANSIT TAB */}
      {activeTab === 'flights' && (
        <div className="space-y-8">
          {/* Flight Search Selector */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-teal-600 flex items-center gap-1.5">
              <Plane size={16} /> Flight Route Search
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Origin City/Airport</label>
                <input
                  type="text"
                  value={flightOrigin}
                  onChange={(e) => setFlightOrigin(e.target.value)}
                  placeholder="e.g. DEL (Delhi), BOM (Mumbai)"
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Destination Airport</label>
                <input
                  type="text"
                  value={flightDest}
                  onChange={(e) => setFlightDest(e.target.value)}
                  placeholder="e.g. COK (Cochin), GOI (Goa)"
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setLoadingFlights(true);
                    api.searchFlights(flightOrigin, flightDest)
                      .then((r) => r.data?.offers && setFlights(r.data.offers))
                      .finally(() => setLoadingFlights(false));
                  }}
                  className="w-full py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition-colors shadow-sm"
                >
                  Search Live Routes
                </button>
              </div>
            </div>
          </div>

          {/* Flight Offers List */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Flight Options ({flightOrigin} &rarr; {flightDest})</span>
              <span className="text-xs text-slate-400 font-normal">• Real route network estimates</span>
            </h3>

            {loadingFlights ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {flights.map((f) => (
                  <div
                    key={f.id}
                    className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                        <span>{f.airlineName}</span>
                        <span className="text-xs text-teal-600 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md">
                          {f.durationFormatted} Non-stop
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Baggage: {f.baggageAllowance} • Cabin: {f.cabinClass}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <div className="text-right">
                        <span className="text-lg font-extrabold text-teal-600 dark:text-teal-400">
                          {f.currency} {f.price.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 block">Indicative fare</span>
                      </div>
                      <a
                        href={f.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition-colors flex items-center gap-1.5"
                      >
                        <span>Check Fares</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Trains and Buses */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Train size={18} className="text-teal-500" />
              <span>Ground Transit & Rail Connectivity</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {transitOptions.map((t) => (
                <div
                  key={t.id}
                  className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{t.operator}</span>
                    <span className="text-[10px] font-bold uppercase text-teal-600 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md">
                      {t.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {t.originStation} &rarr; {t.destinationStation}
                  </p>
                  <p className="text-xs text-slate-400">
                    Duration: ~{t.durationFormatted} ({t.distanceKm} km) • Frequency: {t.frequency}
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-bold text-teal-600">
                      From {t.classes[0]?.currency} {t.classes[0]?.estimatedFare}
                    </span>
                    <a
                      href={t.bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 hover:underline font-semibold flex items-center gap-1"
                    >
                      <span>{t.bookingPortalName}</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
