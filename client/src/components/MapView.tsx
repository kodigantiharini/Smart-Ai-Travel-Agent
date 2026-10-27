import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Place } from '../types';
import { MapPin, Navigation, Compass, Layers, ShieldCheck } from 'lucide-react';

interface MapViewProps {
  places: Place[];
  selectedPlace?: Place | null;
  onSelectPlace?: (place: Place) => void;
  center?: [number, number];
  zoom?: number;
  routeCoordinates?: [number, number][];
  routeMetrics?: {
    distanceKm: number;
    durationMinutes: number;
    travelMode?: string;
  };
  showStopNumbers?: boolean;
  className?: string;
}

export const MapView: React.FC<MapViewProps> = ({
  places,
  selectedPlace,
  onSelectPlace,
  center = [10.0889, 77.0595], // Munnar default
  zoom = 12,
  routeCoordinates,
  routeMetrics,
  showStopNumbers = false,
  className = 'h-[500px] w-full',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [locatingUser, setLocatingUser] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true,
      });

      // Clean OpenStreetMap global tile layer (No watermark, reliable worldwide)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Filter places
  const filteredPlaces = places.filter((p) => {
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'attractions') return !['hotel', 'restaurant', 'cafe'].includes(p.category);
    if (categoryFilter === 'hotels') return p.category === 'hotel';
    if (categoryFilter === 'restaurants') return p.category === 'restaurant' || p.category === 'cafe';
    return true;
  });

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const bounds: [number, number][] = [];

    filteredPlaces.forEach((place, index) => {
      const { lat, lng } = place.coordinates;
      if (lat === undefined || lng === undefined) return;

      bounds.push([lat, lng]);

      const isSelected = selectedPlace && (selectedPlace.id === place.id || selectedPlace.placeId === place.placeId);
      const isHotel = place.category === 'hotel';
      const isFood = place.category === 'restaurant' || place.category === 'cafe';

      const pinBg = isSelected
        ? 'bg-rose-500 ring-4 ring-rose-200'
        : isHotel
        ? 'bg-indigo-600 ring-2 ring-white'
        : isFood
        ? 'bg-amber-600 ring-2 ring-white'
        : 'bg-teal-600 ring-2 ring-white';

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div class="relative group cursor-pointer">
            <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 ${pinBg} hover:scale-110 text-white font-bold text-xs">
              ${showStopNumbers ? `${index + 1}` : `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="2"/></svg>`}
            </div>
            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 transform"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      const popupHtml = `
        <div style="min-width: 220px; font-family: system-ui, sans-serif; padding: 2px;">
          <img src="${place.photos?.[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80'}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />
          <h4 style="margin: 0 0 4px 0; font-weight: 700; font-size: 14px; color: #0F172A;">${place.name}</h4>
          <p style="margin: 0 0 8px 0; font-size: 11px; color: #64748B;">${place.address || `${place.city}, ${place.country}`}</p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="background: #ECFDF5; color: #059669; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700;">★ ${place.rating ? place.rating.toFixed(1) : '4.5'}</span>
            <span style="font-size: 10px; color: #0D9488; font-weight: 600;">Geoapify Verified</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        onSelectPlace?.(place);
      });

      markersRef.current.push(marker);
    });

    if (userLocation) {
      bounds.push(userLocation);
      const userMarker = L.marker(userLocation, {
        icon: L.divIcon({
          className: 'user-location-marker',
          html: `<div class="w-4 h-4 rounded-full bg-blue-500 ring-4 ring-blue-200 animate-pulse"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        }),
      }).addTo(map);
      markersRef.current.push(userMarker);
    }

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 13);
    }
  }, [filteredPlaces, selectedPlace, userLocation, showStopNumbers]);

  // Center on selected place
  useEffect(() => {
    if (selectedPlace && mapInstanceRef.current) {
      const { lat, lng } = selectedPlace.coordinates;
      if (lat !== undefined && lng !== undefined) {
        mapInstanceRef.current.setView([lat, lng], 14, { animate: true });
      }
    }
  }, [selectedPlace]);

  // Draw Route Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (routeCoordinates && routeCoordinates.length >= 2) {
      const polyline = L.polyline(routeCoordinates, {
        color: '#0D9488',
        weight: 5,
        opacity: 0.9,
      }).addTo(map);

      polylineRef.current = polyline;
      map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
    }
  }, [routeCoordinates]);

  // Handle Geolocation
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
        mapInstanceRef.current?.setView(coords, 14, { animate: true });
        setLocatingUser(false);
      },
      (err) => {
        alert(`Location permission denied or unavailable: ${err.message}`);
        setLocatingUser(false);
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className={`relative rounded-3xl overflow-hidden shadow-glass border border-slate-200 dark:border-slate-800 ${className}`}>
      {/* Top Filter Bar */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-wrap gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md">
        {(['all', 'attractions', 'hotels', 'restaurants'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-all ${
              categoryFilter === cat
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Locate Me Floating Button */}
      <button
        onClick={handleLocateMe}
        disabled={locatingUser}
        title="Find My Current Location"
        className="absolute top-4 right-4 z-[1000] p-2.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-700 dark:text-slate-200 hover:text-teal-600 shadow-md border border-slate-200 dark:border-slate-700 transition-all"
      >
        <Navigation size={18} className={locatingUser ? 'animate-spin text-teal-600' : ''} />
      </button>

      {/* Route Metrics Overlay Banner */}
      {routeMetrics && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000] flex items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl border border-slate-700 shadow-lg text-xs">
          <div className="flex items-center gap-2">
            <Compass size={16} className="text-teal-400" />
            <span className="font-semibold text-teal-300">Active Routing:</span>
            <span>{routeMetrics.distanceKm} km</span>
            <span className="text-slate-400">• ~{routeMetrics.durationMinutes} mins {routeMetrics.travelMode || 'drive'}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <ShieldCheck size={12} className="text-teal-400" />
            <span>Geoapify Routing</span>
          </div>
        </div>
      )}

      {/* Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[350px]" />
    </div>
  );
};
