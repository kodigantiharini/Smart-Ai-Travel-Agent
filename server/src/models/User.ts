import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  profileImage?: string;
  preferences: {
    currency: string;
    units: 'metric' | 'imperial';
    travelStyle: 'budget' | 'comfort' | 'luxury' | 'adventure' | 'cultural';
    interests: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    profileImage: { type: String, default: '' },
    preferences: {
      currency: { type: String, default: 'USD' },
      units: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
      travelStyle: { 
        type: String, 
        enum: ['budget', 'comfort', 'luxury', 'adventure', 'cultural'], 
        default: 'comfort' 
      },
      interests: { type: [String], default: ['scenic', 'nature', 'culture', 'food'] },
    },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
