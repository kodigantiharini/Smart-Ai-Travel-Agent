import mongoose, { Schema, Document } from 'mongoose';

export interface IItineraryStop {
  id?: string;
  placeId: string;
  name: string;
  category: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  photo?: string;
  visitDurationMinutes: number;
  arrivalTime?: string; // "09:30 AM"
  departureTime?: string; // "11:30 AM"
  estimatedCost?: number;
  notes?: string;
  order: number;
}

export interface IItineraryDay extends Document {
  tripId: mongoose.Types.ObjectId | string;
  dayNumber: number;
  date: string;
  title: string;
  stops: IItineraryStop[];
  createdAt: Date;
  updatedAt: Date;
}

const StopSchema = new Schema<IItineraryStop>(
  {
    placeId: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, default: 'tourist_attraction' },
    address: { type: String, default: '' },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    photo: { type: String, default: '' },
    visitDurationMinutes: { type: Number, default: 60 },
    arrivalTime: { type: String, default: '' },
    departureTime: { type: String, default: '' },
    estimatedCost: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    order: { type: Number, required: true },
  },
  { _id: true }
);

const ItineraryDaySchema = new Schema<IItineraryDay>(
  {
    tripId: { type: Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
    dayNumber: { type: Number, required: true },
    date: { type: String, required: true },
    title: { type: String, default: '' },
    stops: { type: [StopSchema], default: [] },
  },
  { timestamps: true }
);

export const ItineraryModel = 
  mongoose.models.Itinerary || mongoose.model<IItineraryDay>('Itinerary', ItineraryDaySchema);
