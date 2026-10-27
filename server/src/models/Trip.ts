import mongoose, { Schema, Document } from 'mongoose';

export interface ITrip extends Document {
  owner: mongoose.Types.ObjectId | string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: number;
  currency: string;
  status: 'planning' | 'upcoming' | 'ongoing' | 'completed' | 'archived';
  coverImage?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TripSchema = new Schema<ITrip>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    travelers: { type: Number, default: 1, min: 1 },
    budget: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'USD' },
    status: {
      type: String,
      enum: ['planning', 'upcoming', 'ongoing', 'completed', 'archived'],
      default: 'planning',
    },
    coverImage: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const TripModel = mongoose.models.Trip || mongoose.model<ITrip>('Trip', TripSchema);
