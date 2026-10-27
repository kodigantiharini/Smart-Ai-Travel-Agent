import mongoose, { Schema, Document } from 'mongoose';

export type ExpenseCategory = 
  | 'transportation'
  | 'accommodation'
  | 'food'
  | 'tickets'
  | 'activities'
  | 'shopping'
  | 'miscellaneous';

export interface IExpense extends Document {
  userId: mongoose.Types.ObjectId | string;
  tripId: mongoose.Types.ObjectId | string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency: string;
  expenseDate: string;
  status: 'planned' | 'actual';
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tripId: { type: Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
    category: {
      type: String,
      enum: [
        'transportation',
        'accommodation',
        'food',
        'tickets',
        'activities',
        'shopping',
        'miscellaneous',
      ],
      required: true,
    },
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    expenseDate: { type: String, required: true },
    status: { type: String, enum: ['planned', 'actual'], default: 'actual' },
  },
  { timestamps: true }
);

export const ExpenseModel = 
  mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);
