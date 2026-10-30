import { Request, Response } from 'express';
import { HotelService } from '../services/hotelService.js';

export const searchHotels = async (req: Request, res: Response): Promise<void> => {
  try {
    const destination = (req.query.destination as string) || (req.query.city as string) || 'Munnar';
    const checkIn = (req.query.checkIn as string) || (req.query.startDate as string) || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
    const checkOut = (req.query.checkOut as string) || (req.query.endDate as string) || new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0];
    const guests = req.query.guests ? parseInt(req.query.guests as string, 10) : 2;
    const rooms = req.query.rooms ? parseInt(req.query.rooms as string, 10) : 1;
    const tier = req.query.tier as any;
    const currency = (req.query.currency as string) || 'INR';

    const results = await HotelService.searchHotels(destination, checkIn, checkOut, guests, rooms, tier, currency);
    res.json({
      success: true,
      data: results,
    });
  } catch (err: any) {
    console.warn('searchHotels controller fallback:', err.message);
    const dest = (req.query.destination as string) || (req.query.city as string) || 'Munnar';
    const curr = (req.query.currency as string) || 'INR';
    const fallbackResults = await HotelService.searchHotels(dest, undefined, undefined, 2, 1, 'comfort', curr);
    res.json({
      success: true,
      data: fallbackResults,
    });
  }
};
