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
  stories: any[];
}

export const memoryStore: MemoryCollections = {
  users: [],
  trips: [],
  itineraries: [],
  favorites: [],
  expenses: [],
  notifications: [],
  stories: [],
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
      inviteCode: 'MIV-PARIS',
      collaborators: [
        {
          userId: demoUserId,
          name: 'Alex Rivera',
          email: 'alex@tripwise.ai',
          role: 'organizer',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          joinedAt: new Date().toISOString(),
        },
        {
          userId: 'collab-2',
          name: 'Sophie Martin',
          email: 'sophie.m@example.com',
          role: 'editor',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
          joinedAt: new Date().toISOString(),
        },
      ],
      votes: [
        {
          id: 'vote-1',
          proposedBy: 'collab-2',
          proposerName: 'Sophie Martin',
          activityName: 'Montmartre Secret Bakeries & Sunset Crawl',
          category: 'food',
          estimatedCost: 45,
          dayNumber: 2,
          description: 'Sample artisan pain au chocolat, macarons and catch sunset steps from Sacré-Cœur.',
          upvotes: [demoUserId, 'collab-2'],
          downvotes: [],
          status: 'approved',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'vote-2',
          proposedBy: demoUserId,
          proposerName: 'Alex Rivera',
          activityName: 'Seine River Twilight Champagne Cruise',
          category: 'sightseeing',
          estimatedCost: 65,
          dayNumber: 3,
          description: 'Glass-canopied boat cruise passing under illuminated historic bridges.',
          upvotes: [demoUserId],
          downvotes: [],
          status: 'active',
          createdAt: new Date().toISOString(),
        },
      ],
      messages: [
        {
          id: 'msg-1',
          senderId: 'collab-2',
          senderName: 'Sophie Martin',
          senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
          content: 'Hey Alex! I added the Montmartre bakery walk to the voting board. Let me know what you think!',
          timestamp: '10:30 AM',
        },
        {
          id: 'msg-2',
          senderId: demoUserId,
          senderName: 'Alex Rivera',
          senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          content: 'Just upvoted it! Looks amazing. Don’t forget to pack light layers for the evening.',
          timestamp: '10:35 AM',
        },
      ],
      bookings: [
        {
          id: 'bk-1',
          type: 'hotel',
          title: 'Hôtel Le Relais Saint-Germain (4 Nights)',
          provider: 'Booking.com Verified Partner',
          referenceNumber: 'HTL-PAR-98214',
          date: '2026-12-05',
          details: 'Deluxe Room with Breakfast included, Boulevard Saint-Germain, Paris',
          amount: 720,
          currency: 'USD',
          status: 'confirmed',
        },
        {
          id: 'bk-2',
          type: 'flight',
          title: 'Air France AF1024 (JFK -> CDG)',
          provider: 'Air France',
          referenceNumber: 'FLT-AF-44219',
          date: '2026-12-04',
          details: 'Direct Flight, Seats 14A, 14B, Terminal 2E',
          amount: 850,
          currency: 'USD',
          status: 'confirmed',
        },
      ],
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

    // Seed MiVoyage Community Travel Stories & Moments
    memoryStore.stories.push(
      {
        _id: 'story-1',
        id: 'story-1',
        authorId: demoUserId,
        authorName: 'Alex Rivera',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        title: 'Chasing the Morning Clouds above Munnar’s Highest Tea Garden',
        content:
          'Taking the 4:30 AM 4x4 jeep safari up to Kolukkumalai was one of the most mesmerizing travel decisions I ever made. Standing at 7,900 feet with hot freshly plucked cardamom tea as the sun broke through a blanket of violet clouds. If you visit Munnar, do not miss the trek to the peak!',
        destination: 'Munnar, Kerala',
        location: 'Kolukkumalai Tea Estate, Western Ghats',
        photos: [
          'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1200&q=80',
        ],
        category: 'nature',
        tags: ['sunrise', 'mountains', 'tea_gardens', 'kerala'],
        likes: [demoUserId, 'user-2', 'user-3', 'user-4'],
        comments: [
          {
            id: 'c-1',
            userId: 'user-2',
            userName: 'Maya Patel',
            userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
            text: 'Breathtaking photo! Did you have to book the jeep through your resort in advance?',
            createdAt: '2 hours ago',
          },
          {
            id: 'c-2',
            userId: demoUserId,
            userName: 'Alex Rivera',
            userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            text: 'Yes! Ask your homestay host the night before; they arranged a local driver for ₹2,400 roundtrip.',
            createdAt: '1 hour ago',
          },
        ],
        tripPlanPreview: {
          days: 3,
          budget: '₹28,000 for 2',
          topStops: ['Kolukkumalai', 'Eravikulam National Park', 'Mattupetty Dam'],
        },
        createdAt: new Date(Date.now() - 86400000 * 1),
      },
      {
        _id: 'story-2',
        id: 'story-2',
        authorId: 'user-3',
        authorName: 'Kenji Sato',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        title: 'Twilight Walks through 10,000 Torii Gates at Fushimi Inari',
        content:
          'Pro tip for Kyoto travelers: visit Fushimi Inari after 7:30 PM. The tour buses are completely gone, the lanterns illuminate the vermilion wood, and you can hear the mountain breeze rustling through the bamboo. It felt completely otherworldly.',
        destination: 'Kyoto, Japan',
        location: 'Fushimi Ward, Kyoto',
        photos: [
          'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=1200&q=80',
        ],
        category: 'culture',
        tags: ['kyoto', 'japan', 'culture', 'temples', 'nightwalk'],
        likes: [demoUserId, 'user-2', 'user-5'],
        comments: [
          {
            id: 'c-3',
            userId: 'user-5',
            userName: 'Liam Cooper',
            userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
            text: 'Saved this directly to my Tokyo & Kyoto itinerary!',
            createdAt: '3 hours ago',
          },
        ],
        tripPlanPreview: {
          days: 4,
          budget: '$650 per person',
          topStops: ['Fushimi Inari', 'Arashiyama Bamboo Grove', 'Kinkaku-ji'],
        },
        createdAt: new Date(Date.now() - 86400000 * 2),
      },
      {
        _id: 'story-3',
        id: 'story-3',
        authorId: 'user-4',
        authorName: 'Ananya Sharma',
        authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
        title: 'Secret Seafood Shacks & Sunset Kayaking in South Goa',
        content:
          'Skip the crowded commercial beach lanes of Baga and head down to Cola Beach and Palolem backwaters. We rented double kayaks for ₹600/hr, paddled with kingfishers, and had garlic butter tiger prawns right on the sand with live acoustic music.',
        destination: 'Goa, India',
        location: 'Cola Beach & Palolem, South Goa',
        photos: [
          'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        ],
        category: 'beach',
        tags: ['goa', 'beach', 'kayaking', 'seafood', 'sunset'],
        likes: [demoUserId, 'user-2', 'user-3', 'user-4', 'user-5'],
        comments: [
          {
            id: 'c-4',
            userId: demoUserId,
            userName: 'Alex Rivera',
            userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            text: 'Cola beach lagoon is unmatched! Did you stay in the tent cottages?',
            createdAt: '5 hours ago',
          },
        ],
        tripPlanPreview: {
          days: 3,
          budget: '₹18,000 for 2',
          topStops: ['Cola Beach Lagoon', 'Cabo de Rama Fort', 'Palolem Bay'],
        },
        createdAt: new Date(Date.now() - 86400000 * 3),
      },
      {
        _id: 'story-4',
        id: 'story-4',
        authorId: 'user-6',
        authorName: 'Camille Laurent',
        authorAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
        title: 'Rooftop Picnic Facing the Sparkling Eiffel Tower',
        content:
          'Instead of paying €150 for crowded tourist cafes, grab fresh sourdough baguettes from Boulangerie Poilâne, goat cheese, cherries from the market, and head to Passerelle Debilly. You get an unobstructed view of the golden hour sparkle with zero lines.',
        destination: 'Paris, France',
        location: 'Passerelle Debilly, 7th Arrondissement',
        photos: [
          'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80',
        ],
        category: 'food',
        tags: ['paris', 'budget_tips', 'picnic', 'eiffel_tower'],
        likes: [demoUserId, 'user-3', 'user-6'],
        comments: [],
        tripPlanPreview: {
          days: 2,
          budget: '€120 total',
          topStops: ['Passerelle Debilly', 'Rue Cler Market', 'Champ de Mars'],
        },
        createdAt: new Date(Date.now() - 86400000 * 4),
      }
    );
  }
};

// Seed on startup
seedDemoData();

export const generateId = () => crypto.randomBytes(12).toString('hex');
