import { Request, Response } from 'express';
import { GeoapifyService } from '../services/geoapifyService.js';
import { GoogleMapsService } from '../services/googleMapsService.js';

export const geocode = async (req: Request, res: Response): Promise<void> => {
  try {
    const address = req.query.address as string;
    if (!address) {
      res.status(400).json({ success: false, message: 'Address query parameter is required.' });
      return;
    }

    let result = await GeoapifyService.geocode(address);
    if (!result) {
      result = (await GoogleMapsService.geocode(address)) as any;
    }

    if (!result) {
      res.status(404).json({ success: false, message: 'Location could not be geocoded.' });
      return;
    }

    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const reverseGeocode = async (req: Request, res: Response): Promise<void> => {
  try {
    const lat = req.body.lat !== undefined ? parseFloat(req.body.lat) : parseFloat(req.query.lat as string);
    const lng = req.body.lng !== undefined ? parseFloat(req.body.lng) : parseFloat(req.query.lng as string);

    if (isNaN(lat) || isNaN(lng)) {
      res.status(400).json({ success: false, message: 'lat and lng coordinates are required.' });
      return;
    }

    const result = await GeoapifyService.reverseGeocode(lat, lng);
    res.json({
      success: true,
      data: result || {
        lat,
        lng,
        formattedAddress: `Coordinates: ${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getRoutes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { origin, destination, travelMode } = req.body;

    if (!origin || !destination || origin.lat === undefined || destination.lat === undefined) {
      res.status(400).json({
        success: false,
        message: 'Origin and destination with lat and lng coordinates are required.',
      });
      return;
    }

    const mode = (travelMode || 'drive').toLowerCase() === 'walk' ? 'walk' : (travelMode || 'drive').toLowerCase() === 'bicycle' ? 'bicycle' : 'drive';
    const route = await GeoapifyService.computeRoute(origin, destination, mode as any);

    res.json({ success: true, data: route });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
