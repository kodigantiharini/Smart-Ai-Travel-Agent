import { Request, Response } from 'express';
import { AiAgentService } from '../services/aiAgentService.js';
import { GeoapifyService } from '../services/geoapifyService.js';
import { AuthRequest } from '../middleware/auth.js';

export const assistantChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { prompt, history, userPreferences, currentTripContext } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ success: false, message: 'A text prompt is required.' });
      return;
    }

    const response = await AiAgentService.processRequest(
      prompt,
      history || [],
      userPreferences,
      currentTripContext
    );

    res.json({
      success: true,
      data: response,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { destination, interests, travelStyle } = req.body;
    const places = await GeoapifyService.searchPlaces(destination || 'Munnar');

    res.json({
      success: true,
      data: {
        destination,
        recommendations: places.slice(0, 6),
        travelStyle: travelStyle || 'comfort',
        insights: 'Curated based on verified real-world places, geographic distances, and traveler ratings.',
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const generateItinerary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      destination,
      startDate,
      endDate,
      travelers = 1,
      budget = 1000,
      currency = 'USD',
      interests = ['sightseeing', 'nature'],
      pace = 'moderate',
      preferredStartTime = '09:00 AM',
    } = req.body;

    if (!destination || !startDate || !endDate) {
      res.status(400).json({
        success: false,
        message: 'Destination, startDate, and endDate are required.',
      });
      return;
    }

    const itinerary = await AiAgentService.generateGroundedItinerary({
      destination,
      startDate,
      endDate,
      travelers: Number(travelers) || 1,
      budget: Number(budget) || 1000,
      currency,
      interests: Array.isArray(interests) ? interests : [interests],
      pace,
      preferredStartTime,
    });

    res.json({
      success: true,
      data: itinerary,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
