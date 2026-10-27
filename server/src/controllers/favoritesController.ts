import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { FavoriteModel } from '../models/Favorite.js';
import { memoryStore, generateId } from '../services/memoryStore.js';
import { getDBStatus } from '../config/db.js';

export const listFavorites = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { collection } = req.query;

    const dbStatus = getDBStatus();
    if (dbStatus.connected) {
      const query: any = { userId };
      if (collection && collection !== 'All') {
        query.collectionName = collection;
      }
      const favorites = await FavoriteModel.find(query).sort({ createdAt: -1 });
      res.json({ success: true, count: favorites.length, data: favorites });
    } else {
      let favs = memoryStore.favorites.filter((f) => f.userId === userId);
      if (collection && collection !== 'All') {
        favs = favs.filter((f) => f.collectionName === collection);
      }
      res.json({ success: true, count: favs.length, data: favs });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const {
      placeId,
      name,
      category = 'tourist_attraction',
      address = '',
      coordinates,
      rating = 4.5,
      ratingCount = 100,
      photo = '',
      collectionName = 'All Favorites',
      notes = '',
    } = req.body;

    if (!placeId || !name || !coordinates) {
      res.status(400).json({ success: false, message: 'placeId, name, and coordinates are required.' });
      return;
    }

    const dbStatus = getDBStatus();
    if (dbStatus.connected) {
      // Check existing to prevent duplicate
      const existing = await FavoriteModel.findOne({ userId, placeId });
      if (existing) {
        res.status(400).json({ success: false, message: 'Place is already in your favorites.' });
        return;
      }

      const fav = await FavoriteModel.create({
        userId,
        placeId,
        name,
        category,
        address,
        coordinates,
        rating,
        ratingCount,
        photo,
        collectionName,
        notes,
      });

      res.status(201).json({ success: true, data: fav });
    } else {
      const existing = memoryStore.favorites.find(
        (f) => f.userId === userId && f.placeId === placeId
      );
      if (existing) {
        res.status(400).json({ success: false, message: 'Place is already in your favorites.' });
        return;
      }

      const newFav = {
        _id: generateId(),
        id: generateId(),
        userId,
        placeId,
        name,
        category,
        address,
        coordinates,
        rating,
        ratingCount,
        photo,
        collectionName,
        notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      memoryStore.favorites.push(newFav);
      res.status(201).json({ success: true, data: newFav });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { favoriteId } = req.params;
    const userId = req.user?.id;

    const dbStatus = getDBStatus();
    if (dbStatus.connected) {
      const fav = await FavoriteModel.findOneAndDelete({
        $or: [{ _id: favoriteId }, { placeId: favoriteId }],
        userId,
      });

      if (!fav) {
        res.status(404).json({ success: false, message: 'Favorite not found' });
        return;
      }

      res.json({ success: true, message: 'Favorite removed successfully.' });
    } else {
      const index = memoryStore.favorites.findIndex(
        (f) =>
          f.userId === userId &&
          (f._id === favoriteId || f.id === favoriteId || f.placeId === favoriteId)
      );

      if (index === -1) {
        res.status(404).json({ success: false, message: 'Favorite not found' });
        return;
      }

      memoryStore.favorites.splice(index, 1);
      res.json({ success: true, message: 'Favorite removed successfully.' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCollections = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const dbStatus = getDBStatus();

    let collectionNames: string[] = ['All Favorites'];

    if (dbStatus.connected) {
      const distinct = await FavoriteModel.distinct('collectionName', { userId });
      collectionNames = Array.from(new Set(['All Favorites', ...distinct]));
    } else {
      const userFavs = memoryStore.favorites.filter((f) => f.userId === userId);
      const names = userFavs.map((f) => f.collectionName || 'All Favorites');
      collectionNames = Array.from(new Set(['All Favorites', ...names]));
    }

    res.json({ success: true, data: collectionNames });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const renameCollection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { oldName, newName } = req.body;

    if (!oldName || !newName) {
      res.status(400).json({ success: false, message: 'oldName and newName are required' });
      return;
    }

    const dbStatus = getDBStatus();
    if (dbStatus.connected) {
      await FavoriteModel.updateMany({ userId, collectionName: oldName }, { collectionName: newName });
    } else {
      memoryStore.favorites.forEach((f) => {
        if (f.userId === userId && f.collectionName === oldName) {
          f.collectionName = newName;
        }
      });
    }

    res.json({ success: true, message: `Collection renamed to ${newName}` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
