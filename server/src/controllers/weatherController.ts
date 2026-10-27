import { Request, Response } from 'express';
import { WeatherService } from '../services/weatherService.js';
import { GeoapifyService } from '../services/geoapifyService.js';

export const getWeather = async (req: Request, res: Response): Promise<void> => {
  try {
    let lat = req.query.lat ? parseFloat(req.query.lat as string) : NaN;
    let lng = req.query.lng ? parseFloat(req.query.lng as string) : NaN;
    const destination = (req.query.destination as string) || (req.query.city as string) || '';
    const date = req.query.date as string | undefined;

    if (isNaN(lat) || isNaN(lng)) {
      if (destination) {
        const geo = await GeoapifyService.geocode(destination);
        if (geo) {
          lat = geo.lat;
          lng = geo.lng;
        } else {
          lat = 10.0889; // Default to Munnar
          lng = 77.0595;
        }
      } else {
        res.status(400).json({
          success: false,
          message: 'Either valid coordinates (lat, lng) or a destination name is required.',
        });
        return;
      }
    }

    const report = await WeatherService.getWeather(lat, lng, destination || 'Destination', date);
    res.json({
      success: true,
      data: report,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
