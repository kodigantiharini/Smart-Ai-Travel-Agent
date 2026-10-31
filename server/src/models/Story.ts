import mongoose, { Schema, Document } from 'mongoose';

export interface IStoryComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  createdAt: string;
}

export interface IStory extends Document {
  authorId: mongoose.Types.ObjectId | string;
  authorName: string;
  authorAvatar?: string;
  title: string;
  content: string;
  destination: string;
  location?: string;
  photos: string[];
  category: 'nature' | 'beach' | 'culture' | 'food' | 'adventure' | 'budget';
  tags: string[];
  likes: string[];
  comments: IStoryComment[];
  tripPlanPreview?: {
    days: number;
    budget: string;
    topStops: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const StorySchema = new Schema<IStory>(
  {
    authorId: { type: Schema.Types.Mixed, required: true, index: true },
    authorName: { type: String, required: true },
    authorAvatar: { type: String, default: '' },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    destination: { type: String, required: true, index: true },
    location: { type: String, default: '' },
    photos: { type: [String], default: [] },
    category: {
      type: String,
      default: 'nature',
      index: true,
    },
    tags: { type: [String], default: [] },
    likes: { type: [String], default: [] },
    comments: {
      type: [
        {
          id: { type: String, required: true },
          userId: { type: String, required: true },
          userName: { type: String, required: true },
          userAvatar: { type: String },
          text: { type: String, required: true },
          createdAt: { type: String },
        },
      ],
      default: [],
    },
    tripPlanPreview: {
      days: { type: Number },
      budget: { type: String },
      topStops: { type: [String] },
    },
  },
  { timestamps: true }
);

export const StoryModel = mongoose.models.Story || mongoose.model<IStory>('Story', StorySchema);
