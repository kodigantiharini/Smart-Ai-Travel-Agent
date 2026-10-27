import { Request, Response } from 'express';
import { getDBStatus } from '../config/db.js';
import { ENV } from '../config/env.js';

export const getHealth = (req: Request, res: Response): void => {
  const db = getDBStatus();

  res.json({
    status: 'ok',
    app: 'TripWise AI API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: {
      connected: db.connected,
      mode: db.inMemoryFallback ? 'in-memory-hybrid-resilient' : 'mongodb',
    },
    integrations: {
      geoapifyConfigured: Boolean(ENV.GEOAPIFY_API_KEY && ENV.GEOAPIFY_API_KEY.length > 5),
      openMeteoWeather: true,
      frankfurterCurrency: true,
      groqConfigured: Boolean(ENV.GROQ_API_KEY && ENV.GROQ_API_KEY.length > 5),
      geminiConfigured: Boolean(ENV.GEMINI_API_KEY && ENV.GEMINI_API_KEY.length > 5),
      amadeusConfigured: Boolean(ENV.AMADEUS_CLIENT_ID && ENV.AMADEUS_CLIENT_SECRET),
      cloudinaryConfigured: Boolean(ENV.CLOUDINARY_CLOUD_NAME),
    },
    uptimeSeconds: Math.floor(process.uptime()),
  });
};
