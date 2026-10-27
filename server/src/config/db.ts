import mongoose from 'mongoose';
import { ENV } from './env.js';

let isConnected = false;
let isInMemoryFallback = false;

export const connectDB = async (): Promise<boolean> => {
  if (isConnected) return true;

  try {
    // Attempt connecting to configured MongoDB
    console.log(`Connecting to MongoDB at: ${ENV.MONGODB_URI}...`);
    mongoose.set('strictQuery', false);
    
    // Set a short timeout for connection if local server is not active
    await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 4000,
    });

    isConnected = true;
    isInMemoryFallback = false;
    console.log('MongoDB successfully connected.');
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
