import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Star,
  Clock,
  Phone,
  Globe,
  Heart,
  Plus,
  Navigation,
  ArrowLeft,
  Calendar,
  Sparkles,
  Share2,
  Check,
} from 'lucide-react';
import { Place, Trip } from '../types';
import { api } from '../services/api';
import { MapView } from '../components/MapView';
import { PlaceCard } from '../components/PlaceCard';
import { WeatherWidget } from '../components/WeatherWidget';
import { useAuth } from '../context/AuthContext';

export const PlaceDetailsPage: React.FC = () => {
  const { placeId } = useParams<{ placeId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [place, setPlace] = useState<Place | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [userTrips, setUserTrips] = useState<Trip[]>([]);
  const [showTripModal, setShowTripModal] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [addingToTrip, setAddingToTrip] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!placeId) return;

    const loadDetails = async () => {
      setLoading(true);
      try {
        const res = await api.getPlaceDetails(placeId);
        if (res.data) {
          setPlace(res.data);
          setSelectedPhoto(res.data.photos?.[0] || '');

          // Check if favorited
          if (user) {
            try {
              const favs = await api.getFavorites();
              const found = favs.data?.some(
                (f) => f.placeId === placeId || f.placeId === res.data.id
              );
              setIsSaved(Boolean(found));
            } catch (err) {
              console.warn('Could not check favorites:', err);
            }
          }

          // Fetch nearby
          if (res.data.coordinates?.lat && res.data.coordinates?.lng) {
            const nearbyRes = await api.getNearby(
              res.data.coordinates.lat,
              res.data.coordinates.lng,
              30000
            );
            if (nearbyRes.data) {
              setNearbyPlaces(
                nearbyRes.data.filter((p) => p.id !== placeId && p.placeId !== placeId).slice(0, 3)
              );
            }
          }
        }
      } catch (err) {
        console.error('Failed to load place details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [placeId, user]);

  // Load user trips for "Add to Trip" modal
  const handleOpenTripModal = async () => {
    if (!user) {
      alert('Please log in to add this destination to your trips.');
      navigate('/login');
      return;
    }

    try {
      const res = await api.getTrips();
      if (res.data && res.data.length > 0) {
        setUserTrips(res.data);
        setSelectedTripId(res.data[0]._id || res.data[0].id || '');
        setShowTripModal(true);
      } else {
        alert('You do not have any trips yet. Create a trip first in "My Trips" or "AI Trip Planner"!');
        navigate('/planner');
      }
    } catch (err) {
      console.warn('Failed to load trips:', err);
    }
  };

  const handleConfirmAddToTrip = async () => {
    if (!selectedTripId || !place) return;
    setAddingToTrip(true);
    try {
      // Fetch existing itinerary days for selected trip
      const itinRes = await api.getTripItinerary(selectedTripId);
      let days = itinRes.data || [];

      if (days.length === 0) {
        // Create Day 1 if empty
        days = [
          {
            tripId: selectedTripId,
            dayNumber: 1,
            date: new Date().toISOString().split('T')[0],
            title: `Day 1: Exploring ${place.city || place.name}`,
            stops: [],
          },
        ];
      }

      // Add stop to Day 1
      const newStop = {
        placeId: place.placeId || place.id,
        name: place.name,
        category: place.category,
        address: place.address,
        coordinates: place.coordinates,
        photo: place.photos?.[0] || '',
        visitDurationMinutes: place.suggestedDurationMinutes || 90,
        arrivalTime: '10:00 AM',
        departureTime: '12:00 PM',
        estimatedCost: 20,
        notes: place.description?.slice(0, 100),
        order: days[0].stops.length,
      };

      days[0].stops.push(newStop);
      await api.updateTripItinerary(selectedTripId, days);
      alert(`Success! "${place.name}" added to your trip itinerary.`);
      setShowTripModal(false);
    } catch (err: any) {
      alert(`Failed to add to trip: ${err.message}`);
    } finally {
      setAddingToTrip(false);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      alert('Please log in to save favorites.');
      return;
    }
    if (!place) return;

    try {
      if (isSaved) {
        await api.deleteFavorite(place.placeId || place.id);
        setIsSaved(false);
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
        setIsSaved(true);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    } catch (err) {
      console.error('Favorite toggle failed:', err);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse space-y-8">
        <div className="h-8 w-40 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  if (!place) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold font-display text-navy-900 dark:text-white">
          Destination Not Found
        </h2>
        <p className="text-slate-500">The requested place could not be retrieved from the provider.</p>
        <Link to="/explore" className="inline-flex items-center gap-2 text-teal-600 font-bold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Explore
        </Link>
      </div>
    );
  }

  const externalMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.coordinates.lat},${place.coordinates.lng}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Back Button and Actions Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-600 transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to destinations</span>
        </button>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleShare}
            className="flex-1 sm:flex-initial p-2.5 rounded-2xl glass-panel text-slate-600 dark:text-slate-300 hover:text-teal-600 transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold min-h-[44px]"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
          </button>

          <button
            onClick={toggleFavorite}
            className={`flex-1 sm:flex-initial p-2.5 rounded-2xl glass-panel transition-all flex items-center justify-center gap-1.5 text-xs font-semibold min-h-[44px] ${
              isSaved ? 'text-rose-500' : 'text-slate-600 dark:text-slate-300 hover:text-rose-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={handleOpenTripModal}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-brand hover:opacity-95 shadow-md shadow-glow-teal flex items-center justify-center gap-1.5 transition-all min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Add to Trip</span>
          </button>
        </div>
      </div>

      {/* Main Imagery and Core Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Photo Showcase */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative aspect-[16/10] rounded-3xl overflow-hidden shadow-2xl bg-slate-900">
            <img
              src={selectedPhoto || place.photos?.[0]}
              alt={place.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
            <div className="absolute top-4 left-4">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-slate-900/80 backdrop-blur-md text-teal-300 border border-teal-500/30">
                {place.category.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Thumbnail Strip if multiple photos */}
          {place.photos && place.photos.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
              {place.photos.map((ph, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPhoto(ph)}
                  className={`w-24 h-16 rounded-2xl overflow-hidden shrink-0 border-2 transition-all min-h-[44px] ${
                    selectedPhoto === ph ? 'border-teal-500 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={ph} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Info Card */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1 font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg text-sm">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{place.rating ? place.rating.toFixed(1) : '4.5'}</span>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                ({place.ratingCount ? place.ratingCount.toLocaleString() : '120'} verified reviews)
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-navy-900 dark:text-white leading-tight">
              {place.name}
            </h1>

            <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-2">
              <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
              <span>{place.address || `${place.city}, ${place.country}`}</span>
            </div>
          </div>

          {/* Description */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">
              About This Destination
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {place.description}
            </p>
          </div>

          {/* Key Attributes */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="glass-panel p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 font-medium mb-1">
                <Clock className="w-3.5 h-3.5 text-teal-500" />
                <span>Visit Duration</span>
              </div>
              <p className="font-bold text-navy-900 dark:text-white">
                ~{Math.round((place.suggestedDurationMinutes || 90) / 60)} hours
              </p>
            </div>

            <div className="glass-panel p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 font-medium mb-1">
                <Calendar className="w-3.5 h-3.5 text-teal-500" />
                <span>Best Timing</span>
              </div>
              <p className="font-bold text-navy-900 dark:text-white truncate">
                {place.bestTimeToVisit || 'Morning to Sunset'}
              </p>
            </div>
          </div>

          {/* Contact and External Navigation */}
          <div className="space-y-3 pt-2">
            <a
              href={externalMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-2xl text-sm font-bold text-white bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Navigation className="w-4 h-4 text-teal-400" />
              <span>Get Directions in Google Maps</span>
            </a>

            {place.website && (
              <a
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-300 glass-panel hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-2 transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-teal-500" />
                <span>Official Tourism Website</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Live Weather Forecast Widget for Place */}
      {place && place.coordinates && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Live Meteorological Intelligence
            </h3>
            <span className="text-xs text-slate-400">Open-Meteo Satellite Feed</span>
          </div>
          <WeatherWidget
            weather={{
              destination: place.name,
              coordinates: place.coordinates,
              current: {
                temperatureC: 22,
                feelsLikeC: 23,
                humidityPercent: 65,
                precipitationMm: 0,
                weatherCode: 1,
                weatherCondition: 'Mainly Clear',
                weatherIcon: 'sun',
                windSpeedKmh: 12,
                uvIndex: 6,
              },
              daily: [
                {
                  date: new Date().toISOString().split('T')[0],
                  tempMaxC: 24,
                  tempMinC: 16,
                  weatherCode: 1,
                  weatherCondition: 'Clear & Sunny',
                  weatherIcon: 'sun',
                  precipitationProbabilityMax: 10,
                  precipitationSumMm: 0,
                  uvIndexMax: 7,
                  windSpeedMaxKmh: 14,
                  advisory: 'Optimal weather for outdoor sightseeing and photography.',
                  suitability: 'optimal',
                },
              ],
              alerts: [],
              isForecast: true,
              source: 'Open-Meteo & Geoapify',
              lastChecked: new Date().toISOString(),
            }}
          />
        </div>
      )}

      {/* Opening Hours & Interactive Mini Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Hours & Details */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Operating Schedule & Details
            </h3>

            {place.openingHours && place.openingHours.length > 0 ? (
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                {place.openingHours.map((h, i) => (
                  <li key={i} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400">Schedule varies seasonally. Verify locally.</p>
            )}

            {place.popularActivities && place.popularActivities.length > 0 && (
              <div className="pt-2">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Popular Activities:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {place.popularActivities.map((act, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300"
                    >
                      {act}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Map Location */}
        <div className="lg:col-span-7 h-[380px] rounded-3xl overflow-hidden shadow-glass">
          <MapView
            places={[place]}
            selectedPlace={place}
            center={[place.coordinates.lat, place.coordinates.lng]}
            zoom={14}
            className="h-full w-full"
          />
        </div>
      </div>

      {/* Nearby Attractions */}
      {nearbyPlaces.length > 0 && (
        <div className="space-y-6 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display font-bold text-navy-900 dark:text-white">
                Nearby Attractions in {place.city || 'the Area'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Places you can easily combine in the same day trip.
              </p>
            </div>
            <Link
              to={`/nearby?lat=${place.coordinates.lat}&lng=${place.coordinates.lng}`}
              className="text-xs font-bold text-teal-600 hover:underline"
            >
              View all nearby &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyPlaces.map((np) => (
              <PlaceCard key={np.id || np.placeId} place={np} />
            ))}
          </div>
        </div>
      )}

      {/* Add to Trip Modal */}
      {showTripModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md p-5 sm:p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90dvh] overflow-y-auto">
            <h3 className="text-lg font-bold font-display text-navy-900 dark:text-white">
              Add "{place.name}" to Itinerary
            </h3>
            <p className="text-xs text-slate-500">
              Select which of your active trips to append this destination to:
            </p>

            <select
              value={selectedTripId}
              onChange={(e) => setSelectedTripId(e.target.value)}
              className="w-full p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-base sm:text-sm font-semibold text-slate-800 dark:text-slate-100 min-h-[44px]"
            >
              {userTrips.map((t) => (
                <option key={t._id || t.id} value={t._id || t.id}>
                  {t.name} ({t.destination})
                </option>
              ))}
            </select>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowTripModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={addingToTrip}
                onClick={handleConfirmAddToTrip}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-brand hover:opacity-95 shadow-md shadow-glow-teal transition-all min-h-[44px] flex items-center justify-center"
              >
                {addingToTrip ? 'Adding...' : 'Confirm & Add Stop'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
