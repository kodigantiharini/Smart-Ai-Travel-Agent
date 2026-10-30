import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroBanner } from '../components/dashboard/HeroBanner';
import { PopularDestinations } from '../components/dashboard/PopularDestinations';
import { DashboardAssistant } from '../components/dashboard/DashboardAssistant';
import { RightTripPanel } from '../components/dashboard/RightTripPanel';
import { MapView } from '../components/MapView';
import { Place, Trip, ItineraryStop } from '../types';
import { api } from '../services/api';
import { MapPin, Navigation, Route, Sparkles, Layers } from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // Active trip state
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [selectedDayStops, setSelectedDayStops] = useState<ItineraryStop[]>([]);
  const [mapPlaces, setMapPlaces] = useState<Place[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([35.0116, 135.7681]); // Kyoto
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [routeMetrics, setRouteMetrics] = useState<{
    distanceKm: number;
    durationMinutes: number;
    travelMode?: string;
  } | undefined>(undefined);

  // Load latest trip or featured destination places
  useEffect(() => {
    let isMounted = true;

    const initDashboardData = async () => {
      let tripLoaded = false;
      const token = localStorage.getItem('tripwise_token');

      if (token) {
        try {
          const tripsRes = await api.getTrips();
          if (isMounted && tripsRes.data && tripsRes.data.length > 0) {
            const latest = tripsRes.data[0];
            setActiveTrip(latest);
            tripLoaded = true;

            // Load trip itinerary
            const itinRes = await api.getTripItinerary(latest._id || latest.id);
            if (itinRes.data && itinRes.data.length > 0) {
              const firstDay = itinRes.data[0];
              setSelectedDayStops(firstDay.stops || []);
              syncMapStops(firstDay.stops || []);
            }
          }
        } catch (err) {
          console.warn('Trips fetch skipped or not authenticated:', err);
        }
      }

      // If no active trip loaded, populate the interactive map with rich verified destinations
      if (!tripLoaded && isMounted) {
        try {
          const placesRes = await api.searchPlaces('');
          if (isMounted && placesRes.data && placesRes.data.length > 0) {
            setMapPlaces(placesRes.data.slice(0, 10));
            if (placesRes.data[0]?.coordinates) {
              setMapCenter([
                placesRes.data[0].coordinates.lat,
                placesRes.data[0].coordinates.lng,
              ]);
            }
          }
        } catch (err) {
          console.warn('Default places load error:', err);
        }
      }
    };

    initDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync itinerary stops to Map Places & calculate real OSRM driving route
  const syncMapStops = async (stops: ItineraryStop[]) => {
    if (!stops || stops.length === 0) return;

    const convertedPlaces: Place[] = stops
      .filter((s) => s.coordinates || s.place?.coordinates)
      .map((s, idx) => {
        const coords = s.coordinates || s.place?.coordinates || { lat: 0, lng: 0 };
        return {
          id: s._id || `stop-${idx}`,
          name: s.place?.name || s.name || `Stop ${idx + 1}`,
          category: (s.place?.category as any) || 'viewpoint',
          country: s.place?.country || 'Japan',
          city: s.place?.city || 'Kyoto',
          description: s.activity || s.place?.description || 'Itinerary attraction stop',
          rating: s.place?.rating || 4.8,
          coordinates: coords,
          image: s.place?.image || s.place?.images?.[0] || 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
          verified: true,
          priceLevel: 'moderate',
        };
      });

    setMapPlaces(convertedPlaces);

    if (convertedPlaces.length > 0) {
      setMapCenter([
        convertedPlaces[0].coordinates.lat,
        convertedPlaces[0].coordinates.lng,
      ]);
    }

    // If at least 2 stops exist, calculate real driving route via OSRM backend
    if (convertedPlaces.length >= 2) {
      try {
        const origin = convertedPlaces[0].coordinates;
        const destination = convertedPlaces[convertedPlaces.length - 1].coordinates;
        const routeRes = await api.getRoutes(origin, destination, 'DRIVE');
        if (routeRes.data?.coordinates) {
          setRouteCoordinates(routeRes.data.coordinates);
          setRouteMetrics({
            distanceKm: routeRes.data.distanceKm || 14.2,
            durationMinutes: routeRes.data.durationMinutes || 28,
            travelMode: 'DRIVE',
          });
        }
      } catch (routeErr) {
        console.warn('Route calculation skipped for map:', routeErr);
      }
    } else {
      setRouteCoordinates([]);
      setRouteMetrics(undefined);
    }
  };

  const handleSelectDay = (dayNumber: number, stops: ItineraryStop[]) => {
    setSelectedDayStops(stops);
    syncMapStops(stops);
  };

  const handleFocusStop = (lat: number, lng: number) => {
    setMapCenter([lat, lng]);
  };

  const handleItineraryGenerated = (itin: any) => {
    if (itin.days && itin.days.length > 0) {
      const firstDay = itin.days[0];
      setSelectedDayStops(firstDay.stops || []);
      syncMapStops(firstDay.stops || []);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-300">
      {/* 3-Column Desktop Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main 2-Column Content Area (Hero + Destinations + Assistant & Map) */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Main Scenic Hero Banner */}
          <HeroBanner
            destination={activeTrip?.destination || 'Kyoto & Arashiyama'}
            country="Japan"
            description="Explore bamboo groves, historic shrines, and serene zen stone gardens. Powered by live weather and real-time routing."
            imageUrl="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1800&q=80"
            lat={mapCenter[0]}
            lng={mapCenter[1]}
            onPlanClick={() => navigate('/planner')}
          />

          {/* 2. Popular Destinations Grid */}
          <PopularDestinations
            onSelectDestination={(place) => {
              navigate(`/planner?destination=${encodeURIComponent(place.name)}`);
            }}
          />

          {/* 3. Lower Split Section: AI Assistant & Interactive Map */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-display font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <span>Real-Time Travel Intelligence</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Side-by-side AI concierge conversation & interactive Leaflet route map
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
              {/* Left Column: AI Travel Assistant */}
              <DashboardAssistant
                currentTripContext={activeTrip}
                onItineraryGenerated={handleItineraryGenerated}
                onFocusCoordinates={handleFocusStop}
              />

              {/* Right Column: Interactive Map */}
              <div className="h-[340px] sm:h-[420px] md:h-[480px] lg:h-[520px] rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 flex flex-col">
                <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <Navigation size={15} className="text-blue-600" />
                    <span className="font-bold text-xs text-slate-800 dark:text-white">
                      Interactive Itinerary Map
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold">
                    Geoapify & OSRM
                  </span>
                </div>

                <div className="flex-1 relative">
                  <MapView
                    places={mapPlaces}
                    center={mapCenter}
                    zoom={13}
                    showStopNumbers={true}
                    routeCoordinates={routeCoordinates}
                    routeMetrics={routeMetrics}
                    className="h-full w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Persistent Trip Panel (Desktop Column) */}
        <div className="lg:col-span-4 lg:sticky lg:top-20">
          <RightTripPanel
            activeTrip={activeTrip}
            onSelectDay={handleSelectDay}
            onFocusStop={handleFocusStop}
            onTripUpdated={() => {
              // Reload trips when activity reordered/removed
              api.getTrips().then((res) => {
                if (res.data?.[0]) setActiveTrip(res.data[0]);
              });
            }}
          />
        </div>
      </div>
    </div>
  );
};
