import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { TripModel } from '../models/Trip.js';
import { ItineraryModel } from '../models/Itinerary.js';
import { memoryStore, generateId } from '../services/memoryStore.js';
import { getDBStatus } from '../config/db.js';

export const createTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const {
      name,
      destination,
      startDate,
      endDate,
      travelers = 1,
      budget = 0,
      currency = 'USD',
      coverImage = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
      notes = '',
      initialItinerary = null,
    } = req.body;

    const dbStatus = getDBStatus();
    if (dbStatus.connected) {
      const trip = await TripModel.create({
        owner: userId,
        name,
        destination,
        startDate,
        endDate,
        travelers,
        budget,
        currency,
        coverImage,
        notes,
      });

      if (initialItinerary && Array.isArray(initialItinerary.days)) {
        for (const day of initialItinerary.days) {
          await ItineraryModel.create({
            tripId: trip._id,
            dayNumber: day.dayNumber,
            date: day.date,
            title: day.title || `Day ${day.dayNumber}`,
            stops: day.stops || [],
          });
        }
      }

      res.status(201).json({ success: true, data: trip });
    } else {
      // Memory store fallback
      const tripId = generateId();
      const newTrip = {
        _id: tripId,
        id: tripId,
        owner: userId,
        name,
        destination,
        startDate,
        endDate,
        travelers,
        budget,
        currency,
        coverImage,
        notes,
        status: 'planning',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.trips.push(newTrip);

      if (initialItinerary && Array.isArray(initialItinerary.days)) {
        for (const day of initialItinerary.days) {
          memoryStore.itineraries.push({
            _id: generateId(),
            id: generateId(),
            tripId,
            dayNumber: day.dayNumber,
            date: day.date,
            title: day.title || `Day ${day.dayNumber}`,
            stops: day.stops || [],
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }

      res.status(201).json({ success: true, data: newTrip });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const listTrips = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const dbStatus = getDBStatus();
    if (dbStatus.connected) {
      const trips = await TripModel.find({ owner: userId }).sort({ createdAt: -1 });
      res.json({ success: true, count: trips.length, data: trips });
    } else {
      const trips = memoryStore.trips
        .filter((t) => t.owner === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      res.json({ success: true, count: trips.length, data: trips });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getTripById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tripId } = req.params;
    const userId = req.user?.id;

    const dbStatus = getDBStatus();
    if (dbStatus.connected) {
      const trip = await TripModel.findById(tripId);
      if (!trip) {
        res.status(404).json({ success: false, message: 'Trip not found' });
        return;
      }
      if (trip.owner.toString() !== userId) {
        res.status(403).json({ success: false, message: 'Forbidden. You do not own this trip.' });
        return;
      }
      res.json({ success: true, data: trip });
    } else {
      const trip = memoryStore.trips.find(
        (t) => (t._id === tripId || t.id === tripId) && t.owner === userId
      );
      if (!trip) {
        res.status(404).json({ success: false, message: 'Trip not found' });
        return;
      }
      res.json({ success: true, data: trip });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tripId } = req.params;
    const userId = req.user?.id;

    const dbStatus = getDBStatus();
    if (dbStatus.connected) {
      const trip = await TripModel.findById(tripId);
      if (!trip || trip.owner.toString() !== userId) {
        res.status(404).json({ success: false, message: 'Trip not found or unauthorized' });
        return;
      }

      Object.assign(trip, req.body);
      await trip.save();
      res.json({ success: true, data: trip });
    } else {
      const index = memoryStore.trips.findIndex(
        (t) => (t._id === tripId || t.id === tripId) && t.owner === userId
      );
      if (index === -1) {
        res.status(404).json({ success: false, message: 'Trip not found or unauthorized' });
        return;
      }

      memoryStore.trips[index] = {
        ...memoryStore.trips[index],
        ...req.body,
        updatedAt: new Date(),
      };

      res.json({ success: true, data: memoryStore.trips[index] });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tripId } = req.params;
    const userId = req.user?.id;

    const dbStatus = getDBStatus();
    if (dbStatus.connected) {
      const trip = await TripModel.findById(tripId);
      if (!trip || trip.owner.toString() !== userId) {
        res.status(404).json({ success: false, message: 'Trip not found or unauthorized' });
        return;
      }

      await TripModel.findByIdAndDelete(tripId);
      await ItineraryModel.deleteMany({ tripId });
      res.json({ success: true, message: 'Trip and associated itinerary deleted.' });
    } else {
      const index = memoryStore.trips.findIndex(
        (t) => (t._id === tripId || t.id === tripId) && t.owner === userId
      );
      if (index === -1) {
        res.status(404).json({ success: false, message: 'Trip not found' });
        return;
      }

      memoryStore.trips.splice(index, 1);
      memoryStore.itineraries = memoryStore.itineraries.filter((it) => it.tripId !== tripId);
      memoryStore.expenses = memoryStore.expenses.filter((e) => e.tripId !== tripId);

      res.json({ success: true, message: 'Trip deleted.' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const duplicateTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tripId } = req.params;
    const userId = req.user?.id;

    const dbStatus = getDBStatus();
    if (dbStatus.connected) {
      const original = await TripModel.findById(tripId);
      if (!original || original.owner.toString() !== userId) {
        res.status(404).json({ success: false, message: 'Original trip not found' });
        return;
      }

      const dup = await TripModel.create({
        owner: userId,
        name: `${original.name} (Copy)`,
        destination: original.destination,
        startDate: original.startDate,
        endDate: original.endDate,
        travelers: original.travelers,
        budget: original.budget,
        currency: original.currency,
        coverImage: original.coverImage,
        notes: original.notes,
        status: 'planning',
      });

      const itins = await ItineraryModel.find({ tripId: original._id });
      for (const it of itins) {
        await ItineraryModel.create({
          tripId: dup._id,
          dayNumber: it.dayNumber,
          date: it.date,
          title: it.title,
          stops: it.stops,
        });
      }

      res.status(201).json({ success: true, data: dup });
    } else {
      const original = memoryStore.trips.find(
        (t) => (t._id === tripId || t.id === tripId) && t.owner === userId
      );
      if (!original) {
        res.status(404).json({ success: false, message: 'Original trip not found' });
        return;
      }

      const newId = generateId();
      const dup = {
        ...original,
        _id: newId,
        id: newId,
        name: `${original.name} (Copy)`,
        status: 'planning',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.trips.push(dup);

      const itins = memoryStore.itineraries.filter((it) => it.tripId === tripId);
      for (const it of itins) {
        memoryStore.itineraries.push({
          ...it,
          _id: generateId(),
          id: generateId(),
          tripId: newId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      res.status(201).json({ success: true, data: dup });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getTripItinerary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tripId } = req.params;
    const dbStatus = getDBStatus();

    if (dbStatus.connected) {
      const days = await ItineraryModel.find({ tripId }).sort({ dayNumber: 1 });
      res.json({ success: true, data: days });
    } else {
      const days = memoryStore.itineraries
        .filter((it) => it.tripId === tripId)
        .sort((a, b) => a.dayNumber - b.dayNumber);
      res.json({ success: true, data: days });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateTripItinerary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tripId } = req.params;
    const { days } = req.body;

    if (!Array.isArray(days)) {
      res.status(400).json({ success: false, message: 'days array is required' });
      return;
    }

    const dbStatus = getDBStatus();
    if (dbStatus.connected) {
      await ItineraryModel.deleteMany({ tripId });
      for (const day of days) {
        await ItineraryModel.create({
          tripId,
          dayNumber: day.dayNumber,
          date: day.date,
          title: day.title || `Day ${day.dayNumber}`,
          stops: day.stops || [],
        });
      }
      const updated = await ItineraryModel.find({ tripId }).sort({ dayNumber: 1 });
      res.json({ success: true, data: updated });
    } else {
      memoryStore.itineraries = memoryStore.itineraries.filter((it) => it.tripId !== tripId);
      for (const day of days) {
        memoryStore.itineraries.push({
          _id: day._id || generateId(),
          id: day.id || generateId(),
          tripId,
          dayNumber: day.dayNumber,
          date: day.date,
          title: day.title || `Day ${day.dayNumber}`,
          stops: day.stops || [],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      const updated = memoryStore.itineraries
        .filter((it) => it.tripId === tripId)
        .sort((a, b) => a.dayNumber - b.dayNumber);
      res.json({ success: true, data: updated });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
