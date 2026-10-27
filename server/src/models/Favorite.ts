import mongoose, { Schema, Document } from 'mongoose';

export interface IFavorite extends Document {
  userId: mongoose.Types.ObjectId | string;
  provider: 'google' | 'verified';
  placeId: string;
  name: string;
  category: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  rating?: number;
  ratingCount?: number;
  photo?: string;
  collectionName: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    provider: { type: String, enum: ['google', 'verified'], default: 'verified' },
    placeId: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, default: 'tourist_attraction' },
    address: { type: String, default: '' },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    photo: { type: String, default: '' },
    collectionName: { type: String, default: 'All Favorites', index: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

// Prevent duplicate favorite per user and placeId
FavoriteSchema.index({ userId: 1, placeId: 1 }, { unique: true });

export const FavoriteModel = 
  mongoose.models.Favorite || mongoose.model<IFavorite>('Favorite', FavoriteSchema);
