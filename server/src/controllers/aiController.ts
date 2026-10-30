import { Request, Response } from 'express';
import { AiAgentService } from '../services/aiAgentService.js';
import { GeoapifyService } from '../services/geoapifyService.js';
import { AuthRequest } from '../middleware/auth.js';

export const assistantChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { prompt, history, userPreferences, currentTripContext } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      res.json({
        success: true,
        data: {
          reply: 'Hello! I am your TripWise AI Travel Agent. How can I assist with your journey today?',
          toolExecutions: [],
          suggestedPlaces: [],
          tips: ['Ask me to plan a trip, search accommodations, or check live weather.'],
          isLiveAi: true,
        },
      });
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
    console.warn('assistantChat caught error, returning safe response:', err.message);
    res.json({
      success: true,
      data: {
        reply: `### 🗺️ TripWise Intelligent Travel Guide\n\nI am ready to help you plan an unforgettable trip. You can ask for day-by-day itineraries, flight options, hotel recommendations, or live weather for any destination worldwide!\n\n> 💡 **Quick Tip**: Tell me your destination, group size, and budget to get a personalized recommendation.`,
        toolExecutions: [],
        suggestedPlaces: [],
        tips: ['Try asking: "Plan a 5-day trip to Munnar under ₹50,000 for 4 people"'],
        isLiveAi: false,
      },
    });
  }
};

export const getRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { destination, interests, travelStyle } = req.body;
    let places: any[] = [];
    try {
      places = await GeoapifyService.searchPlaces(destination || 'Munnar');
    } catch {
      places = [];
    }

    res.json({
      success: true,
      data: {
        destination: destination || 'Munnar',
        recommendations: places.slice(0, 6),
        travelStyle: travelStyle || 'comfort',
        insights: 'Curated based on verified real-world places, geographic distances, and traveler ratings.',
      },
    });
  } catch (err: any) {
    res.json({
      success: true,
      data: {
        destination: 'Munnar',
        recommendations: [],
        travelStyle: 'comfort',
        insights: 'Curated based on verified real-world places.',
      },
    });
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
    console.warn('generateItinerary fallback:', err.message);
    const startD = req.body?.startDate || new Date().toISOString().split('T')[0];
    const endD = req.body?.endDate || startD;
    const dest = req.body?.destination || 'Munnar';
    const fallbackItin = await AiAgentService.generateGroundedItinerary({
      destination: dest,
      startDate: startD,
      endDate: endD,
      travelers: Number(req.body?.travelers) || 2,
      budget: Number(req.body?.budget) || 25000,
      currency: req.body?.currency || 'INR',
      interests: ['nature', 'sightseeing'],
      pace: 'moderate',
      skipAi: true,
    });
    res.json({
      success: true,
      data: fallbackItin,
    });
  }
};
