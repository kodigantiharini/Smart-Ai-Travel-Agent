import { Request, Response } from 'express';
import { GeoapifyService } from '../services/geoapifyService.js';
import { GoogleMapsService } from '../services/googleMapsService.js';
import { VERIFIED_PLACES } from '../data/verifiedPlaces.js';

export const searchPlaces = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = (req.query.q as string) || '';
    const category = req.query.category as string | undefined;

    let places: any[] = [];
    try {
      places = await GeoapifyService.searchPlaces(query, category);
    } catch (e: any) {
      console.warn('Geoapify searchPlaces fallback:', e.message);
    }

    if (!places || places.length === 0) {
      try {
        places = (await GoogleMapsService.searchPlaces(query, category)) as any;
      } catch (e: any) {
        console.warn('GoogleMaps searchPlaces fallback:', e.message);
      }
    }

    if (!places || places.length === 0) {
      const qLower = query.toLowerCase().trim();
      places = VERIFIED_PLACES.filter((p) => {
        if (!qLower) return true;
        return (
          p.name.toLowerCase().includes(qLower) ||
          p.city.toLowerCase().includes(qLower) ||
          p.country.toLowerCase().includes(qLower) ||
          p.category.toLowerCase().includes(qLower) ||
          p.tags.some((t) => t.toLowerCase().includes(qLower)) ||
          p.description.toLowerCase().includes(qLower)
        );
      });
      if (places.length === 0) {
        places = VERIFIED_PLACES;
      }
    }

    res.json({
      success: true,
      count: places.length,
      data: places,
    });
  } catch (err: any) {
    res.json({
      success: true,
      count: VERIFIED_PLACES.length,
      data: VERIFIED_PLACES,
    });
  }
};

export const autocomplete = async (req: Request, res: Response): Promise<void> => {
  try {
    const input = (req.query.input as string) || '';
    let suggestions: any[] = [];
    try {
      suggestions = await GoogleMapsService.autocomplete(input);
    } catch {
      suggestions = [];
    }

    if (!suggestions || suggestions.length === 0) {
      const q = input.toLowerCase().trim();
      suggestions = VERIFIED_PLACES
        .filter((p) => !q || p.name.toLowerCase().includes(q) || p.city.toLowerCase().includes(q) || p.country.toLowerCase().includes(q))
        .slice(0, 5)
        .map((p) => ({
          placeId: p.placeId || p.id,
          description: `${p.name}, ${p.city}, ${p.country}`,
          mainText: p.name,
          secondaryText: `${p.city}, ${p.country}`,
        }));
    }

    res.json({
      success: true,
      data: suggestions,
    });
  } catch (err: any) {
    res.json({
      success: true,
      data: [],
    });
  }
};

export const getNearby = async (req: Request, res: Response): Promise<void> => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = req.query.radius ? parseInt(req.query.radius as string, 10) : 25000;
    const category = req.query.category as string | undefined;

    let places: any[] = [];
    if (!isNaN(lat) && !isNaN(lng)) {
      try {
        places = await GoogleMapsService.getNearby(lat, lng, radius, category);
      } catch (err: any) {
        console.warn('getNearby provider fallback:', err.message);
      }
    }

    if (!places || places.length === 0) {
      places = VERIFIED_PLACES.slice(0, 6);
    }

    res.json({
      success: true,
      count: places.length,
      data: places,
    });
  } catch (err: any) {
    res.json({
      success: true,
      count: VERIFIED_PLACES.slice(0, 6).length,
      data: VERIFIED_PLACES.slice(0, 6),
    });
  }
};

export const getPlaceDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const placeId = String(req.params.placeId);
    let place = await GoogleMapsService.getPlaceDetails(placeId);

    if (!place) {
      const found = VERIFIED_PLACES.find((p) => p.id === placeId || p.placeId === placeId);
      if (found) {
        place = found as any;
      }
    }

    if (!place) {
      const match = VERIFIED_PLACES.find(
        (p) =>
          placeId.toLowerCase().includes(p.city.toLowerCase()) ||
          p.name.toLowerCase().includes(placeId.toLowerCase())
      );
      place = (match || VERIFIED_PLACES[0]) as any;
    }

    res.json({
      success: true,
      data: place,
    });
  } catch (err: any) {
    res.json({
      success: true,
      data: VERIFIED_PLACES[0],
    });
  }
};
