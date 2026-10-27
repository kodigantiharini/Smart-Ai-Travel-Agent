import { Request, Response } from 'express';
import { GeoapifyService } from '../services/geoapifyService.js';
import { GoogleMapsService } from '../services/googleMapsService.js';

export const searchPlaces = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = (req.query.q as string) || '';
    const category = req.query.category as string | undefined;

    let places = await GeoapifyService.searchPlaces(query, category);
    if (!places || places.length === 0) {
      places = (await GoogleMapsService.searchPlaces(query, category)) as any;
    }

    res.json({
      success: true,
      count: places.length,
      data: places,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const autocomplete = async (req: Request, res: Response): Promise<void> => {
  try {
    const input = (req.query.input as string) || '';
    const suggestions = await GoogleMapsService.autocomplete(input);
    res.json({
      success: true,
      data: suggestions,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getNearby = async (req: Request, res: Response): Promise<void> => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = req.query.radius ? parseInt(req.query.radius as string, 10) : 25000;
    const category = req.query.category as string | undefined;

    if (isNaN(lat) || isNaN(lng)) {
      res.status(400).json({
        success: false,
        message: 'Valid latitude (lat) and longitude (lng) coordinates are required.',
      });
      return;
    }

    const places = await GoogleMapsService.getNearby(lat, lng, radius, category);
    res.json({
      success: true,
      count: places.length,
      data: places,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPlaceDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const placeId = String(req.params.placeId);
    const place = await GoogleMapsService.getPlaceDetails(placeId);

    if (!place) {
      res.status(404).json({ success: false, message: 'Place not found' });
      return;
    }

    res.json({
      success: true,
      data: place,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
