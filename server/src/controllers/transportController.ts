import { Request, Response } from 'express';
import { TransportService } from '../services/transportService.js';

export const searchTransport = async (req: Request, res: Response): Promise<void> => {
  try {
    const origin = (req.query.origin as string) || 'Cochin';
    const destination = (req.query.destination as string) || 'Munnar';
    const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
    const type = (req.query.type as any) || 'all';
    const currency = (req.query.currency as string) || 'INR';

    const results = await TransportService.searchTransport(origin, destination, date, type, currency);
    res.json({
      success: true,
      data: results,
    });
  } catch (err: any) {
    console.warn('searchTransport fallback:', err.message);
    const origin = (req.query.origin as string) || 'Cochin';
    const destination = (req.query.destination as string) || 'Munnar';
    const fallbackResults = await TransportService.searchTransport(origin, destination);
    res.json({
      success: true,
      data: fallbackResults,
    });
  }
};
