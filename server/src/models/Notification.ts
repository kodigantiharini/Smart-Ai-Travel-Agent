import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId | string;
  type: 'trip' | 'recommendation' | 'budget' | 'system';
  title: string;
  message: string;
  payload?: any;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { 
      type: String, 
      enum: ['trip', 'recommendation', 'budget', 'system'], 
      default: 'system' 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, default: {} },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const NotificationModel = 
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
