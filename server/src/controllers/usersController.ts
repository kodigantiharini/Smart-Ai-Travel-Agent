import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { UserModel } from '../models/User.js';
import { TripModel } from '../models/Trip.js';
import { FavoriteModel } from '../models/Favorite.js';
import { ExpenseModel } from '../models/Expense.js';
import { ItineraryModel } from '../models/Itinerary.js';
import { memoryStore } from '../services/memoryStore.js';
import { getDBStatus } from '../config/db.js';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const dbStatus = getDBStatus();

    if (dbStatus.connected) {
      const user = await UserModel.findById(userId).select('-passwordHash');
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      res.json({ success: true, data: user });
    } else {
      const user = memoryStore.users.find((u) => u._id === userId || u.id === userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      const { passwordHash, ...safeUser } = user;
      res.json({ success: true, data: safeUser });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { name, profileImage, preferences } = req.body;
    const dbStatus = getDBStatus();

    if (dbStatus.connected) {
      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      if (name) user.name = name;
      if (profileImage !== undefined) user.profileImage = profileImage;
      if (preferences) {
        user.preferences = { ...user.preferences, ...preferences };
      }

      await user.save();
      res.json({ success: true, data: user });
    } else {
      const index = memoryStore.users.findIndex((u) => u._id === userId || u.id === userId);
      if (index === -1) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      if (name) memoryStore.users[index].name = name;
      if (profileImage !== undefined) memoryStore.users[index].profileImage = profileImage;
      if (preferences) {
        memoryStore.users[index].preferences = {
          ...memoryStore.users[index].preferences,
          ...preferences,
        };
      }
      memoryStore.users[index].updatedAt = new Date();

      const { passwordHash, ...safeUser } = memoryStore.users[index];
      res.json({ success: true, data: safeUser });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const dbStatus = getDBStatus();

    if (dbStatus.connected) {
      const trips = await TripModel.find({ owner: userId });
      for (const t of trips) {
        await ItineraryModel.deleteMany({ tripId: t._id });
      }
      await TripModel.deleteMany({ owner: userId });
      await FavoriteModel.deleteMany({ userId });
      await ExpenseModel.deleteMany({ userId });
      await UserModel.findByIdAndDelete(userId);
    } else {
      memoryStore.trips = memoryStore.trips.filter((t) => t.owner !== userId);
      memoryStore.favorites = memoryStore.favorites.filter((f) => f.userId !== userId);
      memoryStore.expenses = memoryStore.expenses.filter((e) => e.userId !== userId);
      memoryStore.users = memoryStore.users.filter((u) => u._id !== userId && u.id !== userId);
    }

    res.json({ success: true, message: 'Your account and all associated data have been permanently deleted.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
