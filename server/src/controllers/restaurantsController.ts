import { Request, Response } from 'express';
import { RestaurantService } from '../services/restaurantService.js';

export const searchRestaurants = async (req: Request, res: Response): Promise<void> => {
  try {
    const destination = (req.query.destination as string) || (req.query.city as string) || 'Munnar';
    const cuisine = req.query.cuisine as string | undefined;
    const dietary = req.query.dietary as any;
    const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice as string, 10) : undefined;
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const lng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;

    const results = await RestaurantService.searchRestaurants(destination, cuisine, dietary, maxPrice, lat, lng);
    res.json({
      success: true,
      data: results,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
