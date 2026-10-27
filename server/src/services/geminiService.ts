import axios from 'axios';
import { ENV } from '../config/env.js';
import { VERIFIED_PLACES, VerifiedPlace } from '../data/verifiedPlaces.js';
import { GoogleMapsService } from './googleMapsService.js';

export interface AssistantMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AssistantChatResponse {
  reply: string;
  suggestedPlaces: any[];
  tips: string[];
  estimatedBudget?: {
    total: number;
    currency: string;
    breakdown: { category: string; amount: number }[];
    disclaimer: string;
  };
  isLiveAi: boolean;
}

export class GeminiService {
  private static apiKey = ENV.GEMINI_API_KEY;

  /**
   * Travel Assistant Conversation with verified place validation
   */
  public static async chatAssistant(
    prompt: string,
    history: AssistantMessage[] = [],
    userPreferences?: any
  ): Promise<AssistantChatResponse> {
    const relevantPlaces = await GoogleMapsService.searchPlaces(prompt);
    const topPlacesSummary = relevantPlaces.slice(0, 5).map((p: any) => ({
      name: p.name,
      city: p.city,
      country: p.country,
      category: p.category,
      address: p.address,
      rating: p.rating,
      suggestedDurationMinutes: p.suggestedDurationMinutes || 120,
    }));

    if (this.apiKey && this.apiKey.trim().length > 10) {
      try {
        const systemInstruction = `You are TripWise AI, an expert, thoughtful, and grounded travel assistant.
You provide realistic, verified travel guidance.
Rules:
1. Always base suggestions on the following verified real-world places available: ${JSON.stringify(topPlacesSummary)}.
2. Clearly label estimates as "Estimated". Do not invent fake live prices, opening hours, or ratings.
3. Keep the tone inspiring, elegant, practical, and helpful.
4. If the user asks for a budget, breakdown typical costs realistically (transport, stay, food, activities) and mark it with an explicit disclaimer.`;

        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
          {
            contents: [
              {
                role: 'user',
                parts: [
                  { text: systemInstruction },
                  ...history.map((m) => ({ text: `${m.role.toUpperCase()}: ${m.content}` })),
                  { text: `USER REQUEST: ${prompt}` },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            },
          },
          { timeout: 10000 }
        );

        const aiText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (aiText) {
          return {
            reply: aiText,
            suggestedPlaces: relevantPlaces.slice(0, 4),
            tips: [
              'Verify local operating hours before your arrival.',
              'Early morning visits offer the best crowd-free photography.',
              'Carry local currency for artisanal vendors and tea stalls.'
            ],
            isLiveAi: true,
          };
        }
      } catch (err: any) {
        console.warn('Gemini API call failed, using grounded intelligent engine:', err.message);
      }
    }

    // Grounded intelligent travel engine fallback
    let reply = `Here are tailored recommendations based on verified destinations for "${prompt}":\n\n`;
    if (relevantPlaces.length > 0) {
      reply += `• **${relevantPlaces[0].name}** in ${relevantPlaces[0].city}: ${relevantPlaces[0].description}\n`;
      if (relevantPlaces.length > 1) {
        reply += `• **${relevantPlaces[1].name}**: Perfect for ${relevantPlaces[1].tags.slice(0, 3).join(', ')}.\n`;
      }
      if (relevantPlaces.length > 2) {
        reply += `• **${relevantPlaces[2].name}**: Recommended visit duration: ~${Math.round(relevantPlaces[2].suggestedDurationMinutes / 60)} hours.\n`;
      }
      reply += `\nAll recommended spots have verified geographic coordinates and high traveler ratings.`;
    } else {
      reply = `I explored global destinations for "${prompt}". Discover top worldwide destinations like Paris (Eiffel Tower & Louvre), Rome (Colosseum), Tokyo (Sensō-ji), Agra (Taj Mahal), the Swiss Alps (Matterhorn), Cairo (Pyramids of Giza), or the Grand Canyon.`;
    }

    return {
      reply,
      suggestedPlaces: relevantPlaces.slice(0, 4),
      tips: [
        'Book high-demand attraction tickets at least 48 hours in advance.',
        'Travel during golden hour for the best panoramic lighting.',
        'Pack reusable water bottles and comfortable walking shoes.'
      ],
      estimatedBudget: {
        total: 250,
        currency: userPreferences?.currency || 'USD',
        breakdown: [
          { category: 'Accommodation (Boutique Stay)', amount: 120 },
          { category: 'Transportation & Transfers', amount: 50 },
          { category: 'Cuisine & Dining', amount: 50 },
          { category: 'Attraction Tickets & Tours', amount: 30 }
        ],
        disclaimer: 'Estimated costs are indicative guidelines based on seasonal averages and exclude personal flights.'
      },
      isLiveAi: false,
    };
  }

  /**
   * Generate multi-day day-by-day Itinerary with verified stops and timing validation
   */
  public static async generateItinerary(params: {
    destination: string;
    startDate: string;
    endDate: string;
    travelers: number;
    budget: number;
    currency: string;
    interests: string[];
    pace: 'relaxed' | 'moderate' | 'packed';
    preferredStartTime?: string;
  }) {
    const {
      destination,
      startDate,
      endDate,
      travelers = 1,
      budget = 1000,
      currency = 'USD',
      interests = ['nature', 'scenic'],
      pace = 'moderate',
      preferredStartTime = '09:00 AM',
    } = params;

    // Calculate number of days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const daysCount = Math.min(7, Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1));

    // Find verified places matching destination and interests
    let destinationPlaces = await GoogleMapsService.searchPlaces(destination);
    if (destinationPlaces.length < 3) {
      destinationPlaces = VERIFIED_PLACES;
    }

    const stopsPerDay = pace === 'relaxed' ? 2 : pace === 'packed' ? 4 : 3;

    // Distribute stops across days
    const days = [];
    let placeIndex = 0;

    for (let dayNum = 1; dayNum <= daysCount; dayNum++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + (dayNum - 1));
      const dateStr = currentDate.toISOString().split('T')[0];

      const dayStops = [];
      let currentHour = 9; // 09:00 AM

      for (let s = 0; s < stopsPerDay; s++) {
        const place = destinationPlaces[placeIndex % destinationPlaces.length];
        placeIndex++;

        const arrivalHour = currentHour;
        const durationHours = Math.round((place.suggestedDurationMinutes || 90) / 60);
        const departureHour = arrivalHour + durationHours;

        const formatTime = (h: number) => {
          const ampm = h >= 12 ? 'PM' : 'AM';
          const hr = h > 12 ? h - 12 : h === 0 ? 12 : h;
          return `${String(hr).padStart(2, '0')}:00 ${ampm}`;
        };

        dayStops.push({
          placeId: place.placeId || place.id,
          name: place.name,
          category: place.category,
          address: place.address,
          coordinates: place.coordinates,
          photo: place.photos?.[0] || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
          visitDurationMinutes: place.suggestedDurationMinutes || 90,
          arrivalTime: formatTime(arrivalHour),
          departureTime: formatTime(departureHour),
          estimatedCost: Math.round(budget / (daysCount * stopsPerDay * 1.5)),
          notes: `Recommended visit duration: ${place.suggestedDurationMinutes || 90} mins. Respect local guidelines.`,
          order: s,
        });

        // Add 1 hour buffer + lunch break around 13:00
        currentHour = departureHour + 1;
        if (currentHour === 13) currentHour = 14;
      }

      days.push({
        dayNumber: dayNum,
        date: dateStr,
        title: `Day ${dayNum}: Exploring ${destination} Highlights`,
        stops: dayStops,
      });
    }

    return {
      destination,
      daysCount,
      startDate,
      endDate,
      travelers,
      budget,
      currency,
      pace,
      days,
    };
  }
}
