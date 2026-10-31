import mongoose, { Schema, Document } from 'mongoose';

export interface ITripCollaborator {
  userId?: string;
  name: string;
  email: string;
  role: 'organizer' | 'editor' | 'viewer';
  avatar?: string;
  joinedAt?: string;
}

export interface ITripVote {
  id: string;
  proposedBy: string;
  proposerName: string;
  activityName: string;
  category: string;
  estimatedCost?: number;
  dayNumber?: number;
  description?: string;
  upvotes: string[];
  downvotes: string[];
  status: 'active' | 'approved' | 'rejected';
  createdAt: string;
}

export interface ITripMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
}

export interface ITripBooking {
  id: string;
  type: 'flight' | 'hotel' | 'transport' | 'activity';
  title: string;
  provider: string;
  referenceNumber: string;
  date: string;
  details?: string;
  amount?: number;
  currency?: string;
  status: 'confirmed' | 'pending';
}

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
  inviteCode?: string;
  collaborators: ITripCollaborator[];
  votes: ITripVote[];
  messages: ITripMessage[];
  bookings: ITripBooking[];
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
    inviteCode: { type: String, index: true },
    collaborators: {
      type: [
        {
          userId: { type: String },
          name: { type: String, required: true },
          email: { type: String, required: true },
          role: { type: String, enum: ['organizer', 'editor', 'viewer'], default: 'editor' },
          avatar: { type: String },
          joinedAt: { type: String },
        },
      ],
      default: [],
    },
    votes: {
      type: [
        {
          id: { type: String, required: true },
          proposedBy: { type: String, required: true },
          proposerName: { type: String, required: true },
          activityName: { type: String, required: true },
          category: { type: String, default: 'activity' },
          estimatedCost: { type: Number, default: 0 },
          dayNumber: { type: Number, default: 1 },
          description: { type: String, default: '' },
          upvotes: { type: [String], default: [] },
          downvotes: { type: [String], default: [] },
          status: { type: String, enum: ['active', 'approved', 'rejected'], default: 'active' },
          createdAt: { type: String },
        },
      ],
      default: [],
    },
    messages: {
      type: [
        {
          id: { type: String, required: true },
          senderId: { type: String, required: true },
          senderName: { type: String, required: true },
          senderAvatar: { type: String },
          content: { type: String, required: true },
          timestamp: { type: String },
        },
      ],
      default: [],
    },
    bookings: {
      type: [
        {
          id: { type: String, required: true },
          type: { type: String, enum: ['flight', 'hotel', 'transport', 'activity'], required: true },
          title: { type: String, required: true },
          provider: { type: String, required: true },
          referenceNumber: { type: String, required: true },
          date: { type: String, required: true },
          details: { type: String, default: '' },
          amount: { type: Number, default: 0 },
          currency: { type: String, default: 'USD' },
          status: { type: String, enum: ['confirmed', 'pending'], default: 'confirmed' },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export const TripModel = mongoose.models.Trip || mongoose.model<ITrip>('Trip', TripSchema);
