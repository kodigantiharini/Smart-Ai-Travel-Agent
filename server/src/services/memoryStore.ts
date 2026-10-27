import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// In-memory data collections
export interface MemoryCollections {
  users: any[];
  trips: any[];
  itineraries: any[];
  favorites: any[];
  expenses: any[];
  notifications: any[];
}

export const memoryStore: MemoryCollections = {
  users: [],
  trips: [],
  itineraries: [],
  favorites: [],
  expenses: [],
  notifications: [],
};

// Seed demo user so authentication and trips work right away if needed
const seedDemoData = () => {
  const demoUserId = '654321098765432109876543';
  
  if (memoryStore.users.length === 0) {
    memoryStore.users.push({
      _id: demoUserId,
      id: demoUserId,
      name: 'Alex Rivera',
      email: 'alex@tripwise.ai',
      passwordHash: bcrypt.hashSync('Password123!', 10),
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      preferences: {
        currency: 'USD',
        units: 'metric',
        travelStyle: 'comfort',
        interests: ['scenic', 'nature', 'culture', 'food', 'mountains']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Seed sample World Destination Trip (Paris & Swiss Alps)
    const worldTripId = '507f1f77bcf86cd799439022';
    const demoTripId = worldTripId;
    memoryStore.trips.push({
      _id: worldTripId,
      id: worldTripId,
      owner: demoUserId,
      name: 'Paris & Swiss Alps Grand Expedition',
      destination: 'Paris, France & Zermatt, Switzerland',
      startDate: '2026-12-05',
      endDate: '2026-12-12',
      travelers: 2,
      budget: 3500,
      currency: 'USD',
      status: 'upcoming',
      coverImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
      notes: 'Skip-the-line passes booked for the Eiffel Tower and Gornergrat cogwheel train.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Seed itinerary for World Trip
    memoryStore.itineraries.push({
      _id: 'day-1-paris',
      id: 'day-1-paris',
      tripId: worldTripId,
      dayNumber: 1,
      date: '2026-12-05',
      title: 'Arrival in Paris & Eiffel Tower Sunset',
      stops: [
        {
          id: 'stop-paris-1',
          placeId: 'eiffel-tower-paris',
          name: 'Eiffel Tower (Tour Eiffel)',
          category: 'historical_monument',
          address: 'Champ de Mars, 5 Av. Anatole France, 75007 Paris, France',
          coordinates: { lat: 48.8584, lng: 2.2945 },
          photo: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80',
          visitDurationMinutes: 150,
          arrivalTime: '04:00 PM',
          departureTime: '06:30 PM',
          estimatedCost: 35,
          notes: 'Summit observation deck during twilight sparkle',
          order: 0
        },
        {
          id: 'stop-paris-2',
          placeId: 'louvre-museum-paris',
          name: 'Musée du Louvre',
          category: 'museum',
          address: 'Rue de Rivoli, 75001 Paris, France',
          coordinates: { lat: 48.8606, lng: 2.3376 },
          photo: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80',
          visitDurationMinutes: 180,
          arrivalTime: '07:00 PM',
          departureTime: '10:00 PM',
          estimatedCost: 22,
          notes: 'Friday night quiet opening',
          order: 1
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Seed itinerary for Munnar Trip
    memoryStore.itineraries.push({
      _id: 'day-1-munnar',
      id: 'day-1-munnar',
      tripId: demoTripId,
      dayNumber: 1,
      date: '2026-11-10',
      title: 'Arrival & Scenic Waterfalls',
      stops: [
        {
          id: 'stop-1',
          placeId: 'attukad-waterfalls',
          name: 'Attukad Waterfalls',
          category: 'waterfall',
          address: 'Pallivasal, Munnar, Kerala 685565',
          coordinates: { lat: 10.0461, lng: 77.0379 },
          photo: 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=1200&q=80',
          visitDurationMinutes: 90,
          arrivalTime: '11:00 AM',
          departureTime: '12:30 PM',
          estimatedCost: 15,
          notes: 'Great spot for tea and cardamom snacks nearby',
          order: 0
        },
        {
          id: 'stop-2',
          placeId: 'eravikulam-national-park',
          name: 'Eravikulam National Park (Anamudi Peak)',
          category: 'park',
          address: 'Kannankevan Hills, Munnar',
          coordinates: { lat: 10.2014, lng: 77.0622 },
          photo: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
          visitDurationMinutes: 150,
          arrivalTime: '02:00 PM',
          departureTime: '04:30 PM',
          estimatedCost: 25,
          notes: 'Bus safari included, watch for Nilgiri Tahr',
          order: 1
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Seed sample expenses
    memoryStore.expenses.push(
      {
        _id: 'exp-1',
        id: 'exp-1',
        userId: demoUserId,
        tripId: demoTripId,
        category: 'accommodation',
        description: 'Boutique Tea Plantation Resort (3 nights)',
        amount: 450,
        currency: 'USD',
        expenseDate: '2026-11-10',
        status: 'actual',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'exp-2',
        id: 'exp-2',
        userId: demoUserId,
        tripId: demoTripId,
        category: 'transportation',
        description: 'Private 4x4 Jeep Safari to Kolukkumalai',
        amount: 80,
        currency: 'USD',
        expenseDate: '2026-11-11',
        status: 'planned',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'exp-3',
        id: 'exp-3',
        userId: demoUserId,
        tripId: demoTripId,
        category: 'food',
        description: 'Traditional Kerala Sadya & Cardamom Chai',
        amount: 40,
        currency: 'USD',
        expenseDate: '2026-11-10',
        status: 'actual',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    );

    // Seed sample favorite
    memoryStore.favorites.push({
      _id: 'fav-1',
      id: 'fav-1',
      userId: demoUserId,
      provider: 'verified',
      placeId: 'munnar-tea-gardens',
      name: 'Kolukkumalai Tea Estate & Sunrise Point',
      category: 'mountain',
      address: 'Kottakudi, Munnar, Kerala 685612, India',
      coordinates: { lat: 10.0889, lng: 77.2285 },
      rating: 4.8,
      ratingCount: 3420,
      photo: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80',
      collectionName: 'Dream Viewpoints',
      notes: 'Must wake up at 4am for the jeep ascent above clouds!',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Seed sample notification
    memoryStore.notifications.push({
      _id: 'notif-1',
      id: 'notif-1',
      recipient: demoUserId,
      type: 'trip',
      title: 'Upcoming Adventure in Munnar',
      message: 'Your Munnar Highland Escape starts soon! Check your itinerary schedule and weather.',
      payload: { tripId: demoTripId },
      read: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
};

// Seed on startup
seedDemoData();

export const generateId = () => crypto.randomBytes(12).toString('hex');
