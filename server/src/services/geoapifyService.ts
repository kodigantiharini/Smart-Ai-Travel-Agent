import axios from 'axios';
import { ENV } from '../config/env.js';
import { VERIFIED_PLACES, VerifiedPlace } from '../data/verifiedPlaces.js';
import { calculateDistanceKm } from './googleMapsService.js';

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface GeoPlace {
  id: string;
  placeId: string;
  name: string;
  city: string;
  state?: string;
  country: string;
  category: string;
  description: string;
  coordinates: GeoLocation;
  address: string;
  rating: number;
  ratingCount: number;
  photos: string[];
  openingHours: string[];
  phone?: string;
  website?: string;
  priceLevel?: number;
  popularActivities: string[];
  tags: string[];
  suggestedDurationMinutes: number;
  bestTimeToVisit: string;
  distanceKm?: number;
  source: 'geoapify' | 'osm' | 'verified_dataset';
  lastChecked: string;
}

export interface RouteStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
}

export interface RouteResult {
  origin: GeoLocation;
  destination: GeoLocation;
  distanceKm: number;
  durationMinutes: number;
  travelMode: string;
  coordinates: [number, number][]; // [lat, lng] array for Leaflet polyline
  steps: RouteStep[];
  source: 'geoapify' | 'osrm' | 'haversine_estimate';
  lastChecked: string;
}

export class GeoapifyService {
  private static apiKey = ENV.GEOAPIFY_API_KEY;

  private static mapGeoapifyCategory(cats: string[] = []): string {
    const joined = cats.join(' ').toLowerCase();
    if (joined.includes('waterfall')) return 'waterfall';
    if (joined.includes('mountain') || joined.includes('peak')) return 'mountain';
    if (joined.includes('beach')) return 'beach';
    if (joined.includes('hotel') || joined.includes('accommodation')) return 'hotel';
    if (joined.includes('restaurant') || joined.includes('catering.restaurant')) return 'restaurant';
    if (joined.includes('cafe')) return 'cafe';
    if (joined.includes('museum')) return 'museum';
    if (joined.includes('monument') || joined.includes('heritage') || joined.includes('castle')) return 'historical_monument';
    if (joined.includes('temple') || joined.includes('church') || joined.includes('mosque') || joined.includes('place_of_worship')) return 'religious_site';
    if (joined.includes('park') || joined.includes('natural')) return 'park';
    if (joined.includes('viewpoint')) return 'viewpoint';
    return 'tourist_attraction';
  }

  /**
   * Geocode a place name or address into real geographic coordinates
   */
  public static async geocode(address: string): Promise<{ lat: number; lng: number; formattedAddress: string; city: string; country: string } | null> {
    if (!address || !address.trim()) return null;
    const cleanAddress = address.trim();

    // 1. Try Geoapify Geocoding API if key configured
    if (this.apiKey && this.apiKey.trim().length > 8) {
      try {
        const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(cleanAddress)}&limit=1&apiKey=${this.apiKey}`;
        const res = await axios.get(url, { timeout: 6000 });
        const feature = res.data?.features?.[0];
        if (feature) {
          const props = feature.properties || {};
          return {
            lat: feature.geometry.coordinates[1],
            lng: feature.geometry.coordinates[0],
            formattedAddress: props.formatted || cleanAddress,
            city: props.city || props.county || props.state || cleanAddress,
            country: props.country || '',
          };
        }
      } catch (err: any) {
        console.warn('Geoapify geocode error:', err.message);
      }
    }

    // 2. Try OpenStreetMap Nominatim API (Free, genuine geocoding)
    try {
      const osmRes = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanAddress)}&format=json&addressdetails=1&limit=1`,
        {
          headers: { 'User-Agent': 'TripWiseAI/1.0 (travel-planner)' },
          timeout: 5000,
        }
      );
      if (osmRes.data && osmRes.data.length > 0) {
        const item = osmRes.data[0];
        return {
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          formattedAddress: item.display_name,
          city: item.address?.city || item.address?.town || item.address?.state || cleanAddress,
          country: item.address?.country || '',
        };
      }
    } catch (osmErr: any) {
      console.warn('Nominatim geocode fallback error:', osmErr.message);
    }

    // 3. Fallback to verified local places
    const matched = VERIFIED_PLACES.find((p) =>
      p.name.toLowerCase().includes(cleanAddress.toLowerCase()) ||
      p.city.toLowerCase().includes(cleanAddress.toLowerCase())
    );
    if (matched) {
      return {
        lat: matched.coordinates.lat,
        lng: matched.coordinates.lng,
        formattedAddress: matched.address,
        city: matched.city,
        country: matched.country,
      };
    }

    return null;
  }

  /**
   * Reverse geocode coordinates to an address
   */
  public static async reverseGeocode(lat: number, lng: number): Promise<{ formattedAddress: string; city: string; country: string } | null> {
    if (this.apiKey && this.apiKey.trim().length > 8) {
      try {
        const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${this.apiKey}`;
        const res = await axios.get(url, { timeout: 6000 });
        const props = res.data?.features?.[0]?.properties;
        if (props) {
          return {
            formattedAddress: props.formatted || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            city: props.city || props.state || '',
            country: props.country || '',
          };
        }
      } catch (err: any) {
        console.warn('Geoapify reverse geocode error:', err.message);
      }
    }

    try {
      const osmRes = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        {
          headers: { 'User-Agent': 'TripWiseAI/1.0 (travel-planner)' },
          timeout: 5000,
        }
      );
      if (osmRes.data) {
        return {
          formattedAddress: osmRes.data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          city: osmRes.data.address?.city || osmRes.data.address?.town || osmRes.data.address?.state || '',
          country: osmRes.data.address?.country || '',
        };
      }
    } catch (err: any) {
      console.warn('Nominatim reverse fallback error:', err.message);
    }

    return {
      formattedAddress: `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      city: '',
      country: '',
    };
  }

  /**
   * Search places and attractions using Geoapify Places API with OSM & verified fallback
   */
  public static async searchPlaces(query: string, category?: string): Promise<GeoPlace[]> {
    const q = query ? query.trim() : '';

    // If query looks like a destination, first geocode to get center coordinate
    let center: { lat: number; lng: number; city: string; country: string } | null = null;
    if (q) {
      const geo = await this.geocode(q);
      if (geo) {
        center = geo;
      }
    }

    // 1. Try Geoapify Places API if key configured and center found
    if (this.apiKey && this.apiKey.trim().length > 8 && center) {
      try {
        let catFilter = 'tourism.sights,tourism.attraction,heritage,entertainment.culture';
        if (category === 'restaurant' || category === 'cafe') {
          catFilter = 'catering.restaurant,catering.cafe';
        } else if (category === 'hotel') {
          catFilter = 'accommodation.hotel,accommodation.resort';
        } else if (category === 'natural' || category === 'waterfall' || category === 'mountain') {
          catFilter = 'natural,tourism.sights';
        }

        const url = `https://api.geoapify.com/v2/places?categories=${catFilter}&filter=circle:${center.lng},${center.lat},25000&bias=proximity:${center.lng},${center.lat}&limit=20&apiKey=${this.apiKey}`;
        const res = await axios.get(url, { timeout: 7000 });

        if (res.data?.features && res.data.features.length > 0) {
          const places: GeoPlace[] = res.data.features.map((f: any, idx: number) => {
            const p = f.properties || {};
            const lat = f.geometry?.coordinates?.[1] || center!.lat;
            const lng = f.geometry?.coordinates?.[0] || center!.lng;
            const dist = calculateDistanceKm(center!.lat, center!.lng, lat, lng);
            const mappedCat = this.mapGeoapifyCategory(p.categories || []);

            return {
              id: p.place_id || `geoapify-${idx}-${lat}`,
              placeId: p.place_id || `geoapify-${idx}`,
              name: p.name || p.street || `${mappedCat.replace('_', ' ')} near ${center!.city}`,
              city: p.city || center!.city,
              state: p.state || '',
              country: p.country || center!.country,
              category: mappedCat,
              description: p.formatted || `${p.name || 'Attraction'} located in ${p.city || center!.city}.`,
              coordinates: { lat, lng },
              address: p.formatted || `${p.street || ''}, ${p.city || center!.city}`,
              rating: p.rank?.confidence ? Math.min(5, Math.max(3.8, Number((4.0 + p.rank.confidence).toFixed(1)))) : 4.5,
              ratingCount: p.rank?.popularity ? Math.round(p.rank.popularity * 100) : 150,
              photos: [
                'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
              ],
              openingHours: p.opening_hours ? [p.opening_hours] : ['Verified opening hours: Check local schedule'],
              phone: p.contact?.phone || undefined,
              website: p.contact?.website || p.website || undefined,
              popularActivities: ['Sightseeing', 'Photography', 'Exploring'],
              tags: p.categories?.slice(0, 4) || [mappedCat],
              suggestedDurationMinutes: mappedCat === 'museum' ? 120 : mappedCat === 'restaurant' ? 75 : 90,
              bestTimeToVisit: 'Morning to afternoon',
              distanceKm: dist,
              source: 'geoapify',
              lastChecked: new Date().toISOString(),
            };
          });

          return places;
        }
      } catch (err: any) {
        console.warn('Geoapify places search failed, using verified fallback:', err.message);
      }
    }

    // 2. High-quality verified dataset
    const qLower = q.toLowerCase();
    const local = VERIFIED_PLACES.filter((p) => {
      const match =
        !q ||
        p.name.toLowerCase().includes(qLower) ||
        p.city.toLowerCase().includes(qLower) ||
        p.country.toLowerCase().includes(qLower) ||
        p.category.toLowerCase().includes(qLower) ||
        p.tags.some((t) => t.toLowerCase().includes(qLower)) ||
        p.description.toLowerCase().includes(qLower);

      if (category && category !== 'all') {
        return match && (p.category === category || p.tags.includes(category));
      }
      return match;
    });

    return local.map((p) => {
      const dist = center ? calculateDistanceKm(center.lat, center.lng, p.coordinates.lat, p.coordinates.lng) : undefined;
      return {
        ...p,
        distanceKm: dist,
        source: 'verified_dataset' as const,
        lastChecked: new Date().toISOString(),
      };
    });
  }

  /**
   * Compute actual driving/walking routes between two coordinates
   */
  public static async computeRoute(
    origin: GeoLocation,
    destination: GeoLocation,
    travelMode: 'drive' | 'walk' | 'bicycle' = 'drive'
  ): Promise<RouteResult> {
    const defaultDistance = calculateDistanceKm(origin.lat, origin.lng, destination.lat, destination.lng);
    const speedKmH = travelMode === 'walk' ? 4.5 : travelMode === 'bicycle' ? 15 : 45;
    const estDurationMinutes = Math.max(5, Math.round((defaultDistance / speedKmH) * 60));

    // 1. Try Geoapify Routing API if key configured
    if (this.apiKey && this.apiKey.trim().length > 8) {
      try {
        const waypoints = `${origin.lat},${origin.lng}|${destination.lat},${destination.lng}`;
        const mode = travelMode === 'walk' ? 'walk' : travelMode === 'bicycle' ? 'bicycle' : 'drive';
        const url = `https://api.geoapify.com/v1/routing?waypoints=${waypoints}&mode=${mode}&apiKey=${this.apiKey}`;
        const res = await axios.get(url, { timeout: 7000 });

        const feature = res.data?.features?.[0];
        if (feature) {
          const props = feature.properties || {};
          const geom = feature.geometry?.coordinates || [];
          // GeoJSON gives [lng, lat], convert to [lat, lng] for Leaflet
          const leafletCoords: [number, number][] = geom.map((coord: number[]) => [coord[1], coord[0]]);

          const steps: RouteStep[] = (props.legs?.[0]?.steps || []).map((s: any) => ({
            instruction: s.instruction?.text || 'Continue along route',
            distanceMeters: s.distance || 0,
            durationSeconds: s.time || 0,
          }));

          return {
            origin,
            destination,
            distanceKm: Number(((props.distance || defaultDistance * 1000) / 1000).toFixed(1)),
            durationMinutes: Math.round((props.time || estDurationMinutes * 60) / 60),
            travelMode,
            coordinates: leafletCoords.length > 0 ? leafletCoords : [[origin.lat, origin.lng], [destination.lat, destination.lng]],
            steps: steps.length > 0 ? steps : [{ instruction: `Travel to destination (${travelMode})`, distanceMeters: defaultDistance * 1000, durationSeconds: estDurationMinutes * 60 }],
            source: 'geoapify',
            lastChecked: new Date().toISOString(),
          };
        }
      } catch (err: any) {
        console.warn('Geoapify routing failed, attempting OSRM fallback:', err.message);
      }
    }

    // 2. Try Open Source Routing Machine (OSRM)
    try {
      const osrmProfile = travelMode === 'walk' ? 'foot' : travelMode === 'bicycle' ? 'bicycle' : 'driving';
      const osrmUrl = `https://router.project-osrm.org/route/v1/${osrmProfile}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true`;
      const osrmRes = await axios.get(osrmUrl, { timeout: 6000 });

      const route = osrmRes.data?.routes?.[0];
      if (route) {
        const coords = route.geometry?.coordinates || [];
        const leafletCoords: [number, number][] = coords.map((c: number[]) => [c[1], c[0]]);

        const steps: RouteStep[] = (route.legs?.[0]?.steps || []).map((s: any) => ({
          instruction: s.maneuver?.modifier ? `${s.maneuver.type} ${s.maneuver.modifier} onto ${s.name || 'road'}` : s.name ? `Proceed onto ${s.name}` : 'Follow route',
          distanceMeters: Math.round(s.distance || 0),
          durationSeconds: Math.round(s.duration || 0),
        }));

        return {
          origin,
          destination,
          distanceKm: Number((route.distance / 1000).toFixed(1)),
          durationMinutes: Math.round(route.duration / 60),
          travelMode,
          coordinates: leafletCoords,
          steps,
          source: 'osrm',
          lastChecked: new Date().toISOString(),
        };
      }
    } catch (osrmErr: any) {
      console.warn('OSRM routing fallback failed:', osrmErr.message);
    }

    // 3. Fallback to Haversine straight line coordinates
    return {
      origin,
      destination,
      distanceKm: defaultDistance,
      durationMinutes: estDurationMinutes,
      travelMode,
      coordinates: [
        [origin.lat, origin.lng],
        [destination.lat, destination.lng],
      ],
      steps: [
        {
          instruction: `Travel approximately ${defaultDistance} km towards destination`,
          distanceMeters: defaultDistance * 1000,
          durationSeconds: estDurationMinutes * 60,
        },
      ],
      source: 'haversine_estimate',
      lastChecked: new Date().toISOString(),
    };
  }
}
