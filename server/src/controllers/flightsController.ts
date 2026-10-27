import { Request, Response } from 'express';
import { FlightService } from '../services/flightService.js';

export const searchFlights = async (req: Request, res: Response): Promise<void> => {
  try {
    const origin = (req.query.origin as string) || 'DEL';
    const destination = (req.query.destination as string) || 'COK';
    const departureDate = (req.query.departureDate as string) || (req.query.date as string) || new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0];
    const passengers = req.query.passengers ? parseInt(req.query.passengers as string, 10) : 1;
    const cabinClass = (req.query.cabinClass as string) || 'ECONOMY';
    const currency = (req.query.currency as string) || 'INR';

    const results = await FlightService.searchFlights(
      origin,
      destination,
      departureDate,
      passengers,
      cabinClass,
      currency
    );

    res.json({
      success: true,
      data: results,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
