import { Request, Response } from 'express';
import { CurrencyService } from '../services/currencyService.js';

export const getRates = async (req: Request, res: Response): Promise<void> => {
  try {
    const base = (req.query.base as string) || 'USD';
    const rates = await CurrencyService.getRates(base);
    res.json({
      success: true,
      data: rates,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const convertCurrency = async (req: Request, res: Response): Promise<void> => {
  try {
    const amount = parseFloat(req.query.amount as string);
    const from = (req.query.from as string) || 'USD';
    const to = (req.query.to as string) || 'INR';

    if (isNaN(amount)) {
      res.status(400).json({ success: false, message: 'Valid amount numeric parameter required.' });
      return;
    }

    const result = await CurrencyService.convert(amount, from, to);
    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
