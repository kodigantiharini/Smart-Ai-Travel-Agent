import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ENV } from './env.js';
import { UserModel } from '../models/User.js';
import { TripModel } from '../models/Trip.js';
import { ItineraryModel } from '../models/Itinerary.js';

let isConnected = false;
let isInMemoryFallback = false;

const seedMongoDemoData = async () => {
  try {
    const existing = await UserModel.findOne({ email: 'alex@tripwise.ai' });
    if (!existing) {
      const passwordHash = await bcrypt.hash('Password123!', 10);
      const user = await UserModel.create({
        _id: new mongoose.Types.ObjectId('654321098765432109876543'),
        name: 'Alex Rivera',
        email: 'alex@tripwise.ai',
        passwordHash,
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        preferences: {
          currency: 'USD',
          units: 'metric',
          travelStyle: 'comfort',
          interests: ['scenic', 'nature', 'culture', 'food', 'mountains'],
        },
      });

      const trip = await TripModel.create({
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439022'),
        owner: user._id,
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
      });

      await ItineraryModel.create({
        tripId: trip._id,
        dayNumber: 1,
        date: '2026-12-05',
        title: 'Arrival in Paris & Eiffel Tower Sunset',
        stops: [
          {
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
            order: 0,
          },
          {
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
            notes: 'Evening gallery admission to view Mona Lisa and Winged Victory',
            order: 1,
          },
        ],
      });
      console.log('Demo user Alex Rivera and sample trips successfully seeded in MongoDB Atlas.');
    }
  } catch (err: any) {
    console.warn('Mongo demo seed skipped:', err.message);
  }
};

export const connectDB = async (): Promise<boolean> => {
  if (isConnected) return true;

  try {
    console.log(`Connecting to MongoDB at: ${ENV.MONGODB_URI.substring(0, 30)}...`);
    mongoose.set('strictQuery', false);
    
    // Allow up to 15 seconds for cloud Atlas TLS handshakes across regions
    await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
    });

    isConnected = true;
    isInMemoryFallback = false;
    console.log('MongoDB successfully connected.');
    await seedMongoDemoData();
    return true;
  } catch (error: any) {
    console.warn(`MongoDB connection failed (${error.message}).`);
    console.warn('Switching to TripWise in-memory hybrid storage mode so the app remains 100% operational!');
    isConnected = false;
    isInMemoryFallback = true;
    return false;
  }
};

export const getDBStatus = () => ({
  connected: isConnected,
  inMemoryFallback: isInMemoryFallback,
  uri: isConnected ? ENV.MONGODB_URI : 'In-Memory Safe Store',
});
