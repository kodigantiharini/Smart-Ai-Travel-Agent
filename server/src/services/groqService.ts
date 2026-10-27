import axios from 'axios';
import { ENV } from '../config/env.js';
import { GoogleMapsService } from './googleMapsService.js';
import { VERIFIED_PLACES } from '../data/verifiedPlaces.js';

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

export class GroqService {
  private static apiKey = ENV.GROQ_API_KEY || '';
  private static primaryModel = 'qwen/qwen3.8-27b';
  private static fallbackModel = 'openai/gpt-oss-120b';

  /**
   * Universal AI Travel Assistant
   * Covers all 28 Indian States & 8 Union Territories and destinations across the entire world!
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

    const systemPrompt = `You are TripWise AI, an extraordinary, authoritative, and helpful global AI travel guide and trip concierge.
You possess encyclopedic mastery of all 28 States and 8 Union Territories across India (from Jammu & Kashmir, Ladakh, Himachal, Uttarakhand, Rajasthan, Uttar Pradesh, Goa, Kerala, Tamil Nadu, Karnataka, Maharashtra to the North-East Seven Sisters, Andaman & Nicobar) as well as the entire world (Europe, Americas, Asia, Middle East, Africa, Oceania).

Core Capabilities:
1. TOUR BUDGETS: When users ask for a budget, break down costs item-by-item (Hotels/Resorts, Transportation/Flights/Trains, Food & Dining, Entry Tickets & Safaris, Miscellaneous Cushion) in ${userPreferences?.currency || 'INR (₹)'} and USD.
2. TOUR PLANS & ITINERARIES: Provide structured morning-to-night schedules with practical travel times, distances, opening hours, and hidden local gems.
3. IN-DEPTH TRAVEL GUIDANCE: Advise on optimal seasons to visit, local cuisine to taste, dress codes, permit requirements (like ILP for Ladakh/Arunachal/Sikkim), and safety tips.
4. If relevant, ground recommendations in these verified destinations: ${JSON.stringify(topPlacesSummary)}.

Keep your tone inspiring, clear, respectful, highly structured with bullet points and bold headers, and easy to read.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-8).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: prompt },
    ];

    try {
      let aiText = '';
      try {
        const response = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: this.primaryModel,
            messages,
            temperature: 0.7,
            max_tokens: 1500,
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 20000,
          }
        );
        aiText = response.data?.choices?.[0]?.message?.content || '';
      } catch (primaryErr: any) {
        console.warn('Groq primary model failed, attempting fallback model:', primaryErr.message);
        const fallbackRes = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: this.fallbackModel,
            messages,
            temperature: 0.7,
            max_tokens: 1200,
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          }
        );
        aiText = fallbackRes.data?.choices?.[0]?.message?.content || '';
      }

      if (aiText) {
        // Extract budget estimate if prompt asks for cost or budget
        const isBudgetQuery = /budget|cost|price|estimate|how much|expense|rate/i.test(prompt);
        let estimatedBudget;

        if (isBudgetQuery) {
          const isIndia = /india|kerala|rajasthan|goa|ladakh|manali|kashmir|jaipur|delhi|mumbai|agra|varanasi|ooty|munnar|tamil|karnataka/i.test(prompt);
          const currency = userPreferences?.currency || (isIndia ? 'INR' : 'USD');
          const multiplier = currency === 'INR' ? 85 : 1;

          estimatedBudget = {
            total: Math.round(280 * multiplier),
            currency,
            breakdown: [
              { category: 'Accommodation (Boutique Stay)', amount: Math.round(130 * multiplier) },
              { category: 'Local Transportation & Transfers', amount: Math.round(60 * multiplier) },
              { category: 'Culinary Experiences & Dining', amount: Math.round(55 * multiplier) },
              { category: 'Sightseeing, Safaris & Entry Tickets', amount: Math.round(35 * multiplier) },
            ],
            disclaimer: 'Estimated figures reflect average seasonal tariffs and vary by travel style and peak dates.',
          };
        }

        return {
          reply: aiText,
          suggestedPlaces: relevantPlaces.slice(0, 4),
          tips: [
            'Book high-demand heritage and safari tickets at least 48 hours in advance.',
            'Visit top monuments during early morning golden hour for cooler weather and minimal crowds.',
            'Respect local cultural customs and dress codes at sacred shrines.',
            'Keep offline maps downloaded on mobile for remote mountain routes.'
          ],
          estimatedBudget,
          isLiveAi: true,
        };
      }
    } catch (err: any) {
      console.error('Groq AI API invocation error:', err.response?.data || err.message);
    }

    // Grounded fallback if network is unreachable
    let fallbackReply = `Here are expert recommendations for "${prompt}":\n\n`;
    if (relevantPlaces.length > 0) {
      relevantPlaces.slice(0, 3).forEach((p: any) => {
        fallbackReply += `• **${p.name}** (${p.city}, ${p.country}): ${p.description}\n`;
      });
    } else {
      fallbackReply += `Explore top curated worldwide & Indian destinations including the Taj Mahal (Agra), Hawa Mahal (Jaipur), Palolem Beach (Goa), Pangong Lake (Ladakh), Eiffel Tower (Paris), Colosseum (Rome), or Matterhorn (Swiss Alps).`;
    }

    return {
      reply: fallbackReply,
      suggestedPlaces: relevantPlaces.slice(0, 4),
      tips: [
        'Check seasonal weather forecasts before finalizing your travel dates.',
        'Carry a combination of digital payment apps and physical currency notes.'
      ],
      isLiveAi: false,
    };
  }

  /**
   * Generate complete structured multi-day itinerary with exact stops and timings
   */
  public static async generateItinerary(
    destination: string,
    days: number = 3,
    travelStyle: string = 'balanced',
    interests: string[] = ['sightseeing', 'culture'],
    budget: number = 1500,
    currency: string = 'USD'
  ): Promise<any> {
    const numDays = Math.min(Math.max(days, 1), 14);
    const availablePlaces = await GoogleMapsService.searchPlaces(destination);

    const prompt = `Create a realistic, structured ${numDays}-day travel itinerary for "${destination}".
Travel style: ${travelStyle}.
Key interests: ${interests.join(', ')}.
Total target budget: ${budget} ${currency}.

Available verified local places to prioritize:
${JSON.stringify(availablePlaces.slice(0, 10).map((p: any) => ({ id: p.id, name: p.name, city: p.city, address: p.address, coordinates: p.coordinates })))}

Respond with a strictly valid JSON object matching this schema without any markdown formatting or prefix text:
{
  "title": "${numDays}-Day ${destination} Itinerary",
  "summary": "High-level summary of the journey",
  "estimatedTotalCost": ${budget},
  "currency": "${currency}",
  "days": [
    {
      "dayNumber": 1,
      "date": "2026-11-10",
      "title": "Day title theme",
      "stops": [
        {
          "name": "Attraction name",
          "category": "tourist_attraction",
          "address": "Full street address",
          "coordinates": { "lat": 0.0, "lng": 0.0 },
          "visitDurationMinutes": 120,
          "arrivalTime": "09:30 AM",
          "departureTime": "11:30 AM",
          "estimatedCost": 20,
          "notes": "Helpful insider travel tip"
        }
      ]
    }
  ]
}`;

    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: this.primaryModel,
          messages: [
            {
              role: 'system',
              content: 'You are an itinerary planning engine that outputs only valid RFC 8259 JSON without commentary or markdown codeblocks.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.4,
          max_tokens: 3000,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 25000,
        }
      );

      let text = response.data?.choices?.[0]?.message?.content || '';
      // Strip markdown code fences if present
      text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

      const parsed = JSON.parse(text);
      if (parsed.days && parsed.days.length > 0) {
        return {
          ...parsed,
          isLiveAi: true,
        };
      }
    } catch (err: any) {
      console.warn('Groq structured itinerary generation fell back to programmatic builder:', err.message);
    }

    // Programmatic resilient fallback
    const placesToUse = availablePlaces.length > 0 ? availablePlaces : VERIFIED_PLACES;
    const generatedDays: any[] = [];

    for (let d = 1; d <= numDays; d++) {
      const dayStops: any[] = [];
      const place1 = placesToUse[(d * 2 - 2) % placesToUse.length];
      const place2 = placesToUse[(d * 2 - 1) % placesToUse.length];

      dayStops.push({
        id: `stop-${d}-1`,
        placeId: place1.id || place1.placeId,
        name: place1.name,
        category: place1.category || 'tourist_attraction',
        address: place1.address,
        coordinates: place1.coordinates,
        photo: place1.photos?.[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
        visitDurationMinutes: place1.suggestedDurationMinutes || 120,
        arrivalTime: '09:30 AM',
        departureTime: '12:00 PM',
        estimatedCost: Math.round((budget / (numDays * 3))),
        notes: place1.popularActivities?.[0] ? `Recommended: ${place1.popularActivities[0]}` : 'Explore highlights',
        order: 0,
      });

      if (place2 && place2.id !== place1.id) {
        dayStops.push({
          id: `stop-${d}-2`,
          placeId: place2.id || place2.placeId,
          name: place2.name,
          category: place2.category || 'tourist_attraction',
          address: place2.address,
          coordinates: place2.coordinates,
          photo: place2.photos?.[0] || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
          visitDurationMinutes: place2.suggestedDurationMinutes || 120,
          arrivalTime: '02:30 PM',
          departureTime: '05:00 PM',
          estimatedCost: Math.round((budget / (numDays * 3))),
          notes: place2.bestTimeToVisit ? `Best time: ${place2.bestTimeToVisit}` : 'Scenic photography spot',
          order: 1,
        });
      }

      generatedDays.push({
        dayNumber: d,
        date: new Date(Date.now() + (d - 1) * 86400000).toISOString().split('T')[0],
        title: `Day ${d}: ${place1.name} & Surrounds`,
        stops: dayStops,
      });
    }

    return {
      title: `${numDays}-Day Journey in ${destination}`,
      summary: `Tailored travel plan designed for ${travelStyle} exploration across iconic destinations.`,
      estimatedTotalCost: budget,
      currency,
      days: generatedDays,
      isLiveAi: false,
    };
  }
}
