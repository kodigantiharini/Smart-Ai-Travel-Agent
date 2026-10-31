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
    const inviteCode = 'MIV-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    const organizer = {
      userId,
      name: req.user?.name || 'Organizer',
      email: req.user?.email || '',
      role: 'organizer' as const,
      avatar: req.user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      joinedAt: new Date().toISOString(),
    };

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
        inviteCode,
        collaborators: [organizer],
        votes: [],
        messages: [],
        bookings: [],
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
        inviteCode,
        collaborators: [organizer],
        votes: [],
        messages: [],
        bookings: [],
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
    const userEmail = req.user?.email?.toLowerCase();
    if (dbStatus.connected) {
      const trips = await TripModel.find({
        $or: [
          { owner: userId },
          { 'collaborators.userId': userId },
          ...(userEmail ? [{ 'collaborators.email': userEmail }] : []),
        ],
      }).sort({ createdAt: -1 });
      res.json({ success: true, count: trips.length, data: trips });
    } else {
      const trips = memoryStore.trips
        .filter((t) => {
          if (t.owner === userId) return true;
          if (Array.isArray(t.collaborators)) {
            return t.collaborators.some(
              (c: any) => c.userId === userId || (userEmail && c.email?.toLowerCase() === userEmail)
            );
          }
          return false;
        })
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

// ==========================================
// MiVoyage Collaborative Trip Management
// ==========================================

export const inviteCollaborator = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tripId } = req.params;
    const { name, email, role = 'editor' } = req.body;

    if (!email || !name) {
      res.status(400).json({ success: false, message: 'Name and email are required.' });
      return;
    }

    const collaborator = {
      name,
      email: email.toLowerCase(),
      role,
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 500)}?auto=format&fit=crop&w=400&q=80`,
      joinedAt: new Date().toISOString(),
    };

    const dbStatus = getDBStatus();
    if (dbStatus.connected) {
      const trip = await TripModel.findById(tripId);
      if (!trip) {
        res.status(404).json({ success: false, message: 'Trip not found.' });
        return;
      }
      if (!Array.isArray(trip.collaborators)) trip.collaborators = [];
      const exists = trip.collaborators.some((c: any) => c.email?.toLowerCase() === email.toLowerCase());
      if (!exists) {
        trip.collaborators.push(collaborator as any);
        await trip.save();
      }
      res.json({ success: true, data: trip.collaborators });
    } else {
      const trip = memoryStore.trips.find((t) => t._id === tripId || t.id === tripId);
      if (!trip) {
        res.status(404).json({ success: false, message: 'Trip not found.' });
        return;
      }
      if (!Array.isArray(trip.collaborators)) trip.collaborators = [];
      const exists = trip.collaborators.some((c: any) => c.email?.toLowerCase() === email.toLowerCase());
      if (!exists) {
        trip.collaborators.push(collaborator);
      }
      res.json({ success: true, data: trip.collaborators });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const removeCollaborator = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tripId, email } = req.params;
    const cleanEmail = String(email || '').toLowerCase();
    const dbStatus = getDBStatus();

    if (dbStatus.connected) {
      const trip = await TripModel.findById(tripId);
      if (!trip) {
        res.status(404).json({ success: false, message: 'Trip not found.' });
        return;
      }
      trip.collaborators = trip.collaborators.filter((c: any) => c.email?.toLowerCase() !== cleanEmail);
      await trip.save();
      res.json({ success: true, data: trip.collaborators });
    } else {
      const trip = memoryStore.trips.find((t) => t._id === tripId || t.id === tripId);
      if (!trip) {
        res.status(404).json({ success: false, message: 'Trip not found.' });
        return;
      }
      trip.collaborators = (trip.collaborators || []).filter((c: any) => c.email?.toLowerCase() !== cleanEmail);
      res.json({ success: true, data: trip.collaborators });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const joinTripByCode = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { inviteCode } = req.body;
    const userId = req.user?.id || 'demo-user';
    const userName = req.user?.name || 'Explorer';
    const userEmail = req.user?.email || 'explorer@tripwise.ai';
    const userAvatar = req.user?.profileImage;

    if (!inviteCode) {
      res.status(400).json({ success: false, message: 'Invite code is required.' });
      return;
    }

    const cleanCode = inviteCode.trim().toUpperCase();
    const dbStatus = getDBStatus();

    if (dbStatus.connected) {
      const trip = await TripModel.findOne({ inviteCode: cleanCode });
      if (!trip) {
        res.status(404).json({ success: false, message: 'Invalid trip invite code.' });
        return;
      }
      const isAlreadyMember = trip.collaborators.some((c: any) => c.email?.toLowerCase() === userEmail.toLowerCase() || c.userId === userId);
      if (!isAlreadyMember) {
        trip.collaborators.push({
          userId,
          name: userName,
          email: userEmail.toLowerCase(),
          role: 'editor',
          avatar: userAvatar,
          joinedAt: new Date().toISOString(),
        } as any);
        await trip.save();
      }
      res.json({ success: true, data: trip, message: `Successfully joined ${trip.name}!` });
    } else {
      const trip = memoryStore.trips.find((t) => t.inviteCode?.toUpperCase() === cleanCode);
      if (!trip) {
        res.status(404).json({ success: false, message: 'Invalid trip invite code.' });
        return;
      }
      if (!Array.isArray(trip.collaborators)) trip.collaborators = [];
      const isAlreadyMember = trip.collaborators.some((c: any) => c.email?.toLowerCase() === userEmail.toLowerCase() || c.userId === userId);
      if (!isAlreadyMember) {
        trip.collaborators.push({
          userId,
          name: userName,
          email: userEmail.toLowerCase(),
          role: 'editor',
          avatar: userAvatar,
          joinedAt: new Date().toISOString(),
        });
      }
      res.json({ success: true, data: trip, message: `Successfully joined ${trip.name}!` });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// MiVoyage Group Activity Voting & Polls
// ==========================================

export const getTripVotes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tripId } = req.params;
    const dbStatus = getDBStatus();

    if (dbStatus.connected) {
      const trip = await TripModel.findById(tripId);
      res.json({ success: true, data: trip?.votes || [] });
    } else {
      const trip = memoryStore.trips.find((t) => t._id === tripId || t.id === tripId);
      res.json({ success: true, data: trip?.votes || [] });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const proposeTripVote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tripId } = req.params;
    const { activityName, category = 'activity', estimatedCost = 0, dayNumber = 1, description = '' } = req.body;
    const userId = req.user?.id || 'demo-user';
    const userName = req.user?.name || 'Explorer';

    if (!activityName) {
      res.status(400).json({ success: false, message: 'Activity name is required.' });
      return;
    }

    const newVote = {
      id: generateId(),
      proposedBy: userId,
      proposerName: userName,
      activityName,
      category,
      estimatedCost: Number(estimatedCost) || 0,
      dayNumber: Number(dayNumber) || 1,
      description,
      upvotes: [userId],
      downvotes: [],
      status: 'active' as const,
      createdAt: new Date().toISOString(),
    };

    const dbStatus = getDBStatus();
    if (dbStatus.connected) {
      const trip = await TripModel.findById(tripId);
      if (!trip) {
        res.status(404).json({ success: false, message: 'Trip not found.' });
        return;
      }
      if (!Array.isArray(trip.votes)) trip.votes = [];
      trip.votes.unshift(newVote as any);
      await trip.save();
      res.status(201).json({ success: true, data: newVote, votes: trip.votes });
    } else {
      const trip = memoryStore.trips.find((t) => t._id === tripId || t.id === tripId);
      if (!trip) {
        res.status(404).json({ success: false, message: 'Trip not found.' });
        return;
      }
      if (!Array.isArray(trip.votes)) trip.votes = [];
      trip.votes.unshift(newVote);
      res.status(201).json({ success: true, data: newVote, votes: trip.votes });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const castTripVote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tripId, voteId } = req.params;
    const { voteType = 'up' } = req.body;
    const userId = req.user?.id || 'demo-user';

    const dbStatus = getDBStatus();
    if (dbStatus.connected) {
      const trip = await TripModel.findById(tripId);
      if (!trip) {
        res.status(404).json({ success: false, message: 'Trip not found.' });
        return;
      }
      const targetVote = trip.votes.find((v: any) => v.id === voteId);
      if (!targetVote) {
        res.status(404).json({ success: false, message: 'Vote item not found.' });
        return;
      }

      if (voteType === 'up') {
        const uIdx = targetVote.upvotes.indexOf(userId);
        if (uIdx === -1) {
          targetVote.upvotes.push(userId);
          targetVote.downvotes = targetVote.downvotes.filter((id: string) => id !== userId);
        } else {
          targetVote.upvotes.splice(uIdx, 1);
        }
      } else {
        const dIdx = targetVote.downvotes.indexOf(userId);
        if (dIdx === -1) {
          targetVote.downvotes.push(userId);
          targetVote.upvotes = targetVote.upvotes.filter((id: string) => id !== userId);
        } else {
          targetVote.downvotes.splice(dIdx, 1);
        }
      }

      if (targetVote.upvotes.length >= 2) {
        targetVote.status = 'approved';
      }
      await trip.save();
      res.json({ success: true, data: targetVote, votes: trip.votes });
    } else {
      const trip = memoryStore.trips.find((t) => t._id === tripId || t.id === tripId);
      if (!trip) {
        res.status(404).json({ success: false, message: 'Trip not found.' });
        return;
      }
      const targetVote = (trip.votes || []).find((v: any) => v.id === voteId);
      if (!targetVote) {
        res.status(404).json({ success: false, message: 'Vote item not found.' });
        return;
      }

      if (voteType === 'up') {
        const uIdx = targetVote.upvotes.indexOf(userId);
        if (uIdx === -1) {
          targetVote.upvotes.push(userId);
          targetVote.downvotes = targetVote.downvotes.filter((id: string) => id !== userId);
        } else {
          targetVote.upvotes.splice(uIdx, 1);
        }
      } else {
        const dIdx = targetVote.downvotes.indexOf(userId);
        if (dIdx === -1) {
          targetVote.downvotes.push(userId);
          targetVote.upvotes = targetVote.upvotes.filter((id: string) => id !== userId);
        } else {
          targetVote.downvotes.splice(dIdx, 1);
        }
      }

      if (targetVote.upvotes.length >= 2) {
        targetVote.status = 'approved';
      }
      res.json({ success: true, data: targetVote, votes: trip.votes });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const approveVoteToItinerary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tripId, voteId } = req.params;
    const dbStatus = getDBStatus();

    let vote: any = null;
    if (dbStatus.connected) {
      const trip = await TripModel.findById(tripId);
      vote = trip?.votes.find((v: any) => v.id === voteId);
      if (vote) {
        vote.status = 'approved';
        await trip?.save();
      }
    } else {
      const trip = memoryStore.trips.find((t) => t._id === tripId || t.id === tripId);
      vote = (trip?.votes || []).find((v: any) => v.id === voteId);
      if (vote) {
        vote.status = 'approved';
      }
    }

    if (!vote) {
      res.status(404).json({ success: false, message: 'Vote item not found.' });
      return;
    }

    const dayNum = vote.dayNumber || 1;
    const newStop = {
      id: generateId(),
      placeId: `voted-${vote.id}`,
      name: vote.activityName,
      category: vote.category || 'activity',
      address: vote.description || `${vote.activityName} (Group Voted)`,
      coordinates: { lat: 15.4925, lng: 73.818 },
      photo: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
      visitDurationMinutes: 120,
      arrivalTime: '02:00 PM',
      departureTime: '04:00 PM',
      estimatedCost: vote.estimatedCost || 0,
      notes: `Proposed by ${vote.proposerName} (${vote.upvotes?.length || 0} group upvotes)`,
      order: 99,
    };

    if (dbStatus.connected) {
      let day = await ItineraryModel.findOne({ tripId, dayNumber: dayNum });
      if (!day) {
        day = await ItineraryModel.create({
          tripId,
          dayNumber: dayNum,
          date: new Date().toISOString().split('T')[0],
          title: `Day ${dayNum}`,
          stops: [newStop],
        });
      } else {
        day.stops.push(newStop as any);
        await day.save();
      }
      res.json({ success: true, message: `Added "${vote.activityName}" to Day ${dayNum}!`, data: day });
    } else {
      let day = memoryStore.itineraries.find((it) => it.tripId === tripId && it.dayNumber === dayNum);
      if (!day) {
        day = {
          _id: generateId(),
          id: generateId(),
          tripId,
          dayNumber: dayNum,
          date: new Date().toISOString().split('T')[0],
          title: `Day ${dayNum}`,
          stops: [newStop],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        memoryStore.itineraries.push(day);
      } else {
        day.stops.push(newStop);
      }
      res.json({ success: true, message: `Added "${vote.activityName}" to Day ${dayNum}!`, data: day });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// MiVoyage Trip Group Discussion / Chat
// ==========================================

export const getTripMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tripId } = req.params;
    const dbStatus = getDBStatus();

    if (dbStatus.connected) {
      const trip = await TripModel.findById(tripId);
      res.json({ success: true, data: trip?.messages || [] });
    } else {
      const trip = memoryStore.trips.find((t) => t._id === tripId || t.id === tripId);
      res.json({ success: true, data: trip?.messages || [] });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const sendTripMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tripId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id || 'demo-user';
    const userName = req.user?.name || 'Explorer';
    const userAvatar = req.user?.profileImage;

    if (!content || !content.trim()) {
      res.status(400).json({ success: false, message: 'Message content cannot be empty.' });
      return;
    }

    const newMsg = {
      id: generateId(),
      senderId: userId,
      senderName: userName,
      senderAvatar: userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const dbStatus = getDBStatus();
    if (dbStatus.connected) {
      const trip = await TripModel.findById(tripId);
      if (!trip) {
        res.status(404).json({ success: false, message: 'Trip not found.' });
        return;
      }
      if (!Array.isArray(trip.messages)) trip.messages = [];
      trip.messages.push(newMsg as any);
      await trip.save();
      res.status(201).json({ success: true, data: newMsg, messages: trip.messages });
    } else {
      const trip = memoryStore.trips.find((t) => t._id === tripId || t.id === tripId);
      if (!trip) {
        res.status(404).json({ success: false, message: 'Trip not found.' });
        return;
      }
      if (!Array.isArray(trip.messages)) trip.messages = [];
      trip.messages.push(newMsg);
      res.status(201).json({ success: true, data: newMsg, messages: trip.messages });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// MiVoyage All-in-One Bookings Integration
// ==========================================

export const getTripBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tripId } = req.params;
    const dbStatus = getDBStatus();

    if (dbStatus.connected) {
      const trip = await TripModel.findById(tripId);
      res.json({ success: true, data: trip?.bookings || [] });
    } else {
      const trip = memoryStore.trips.find((t) => t._id === tripId || t.id === tripId);
      res.json({ success: true, data: trip?.bookings || [] });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const linkTripBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tripId } = req.params;
    const { type, title, provider, referenceNumber, date, details, amount = 0, currency = 'USD' } = req.body;

    if (!title || !provider || !referenceNumber) {
      res.status(400).json({ success: false, message: 'Title, provider, and reference number are required.' });
      return;
    }

    const newBooking = {
      id: generateId(),
      type: type || 'hotel',
      title,
      provider,
      referenceNumber,
      date: date || new Date().toISOString().split('T')[0],
      details: details || '',
      amount: Number(amount) || 0,
      currency,
      status: 'confirmed' as const,
    };

    const dbStatus = getDBStatus();
    if (dbStatus.connected) {
      const trip = await TripModel.findById(tripId);
      if (!trip) {
        res.status(404).json({ success: false, message: 'Trip not found.' });
        return;
      }
      if (!Array.isArray(trip.bookings)) trip.bookings = [];
      trip.bookings.push(newBooking as any);
      await trip.save();
      res.status(201).json({ success: true, data: newBooking, bookings: trip.bookings });
    } else {
      const trip = memoryStore.trips.find((t) => t._id === tripId || t.id === tripId);
      if (!trip) {
        res.status(404).json({ success: false, message: 'Trip not found.' });
        return;
      }
      if (!Array.isArray(trip.bookings)) trip.bookings = [];
      trip.bookings.push(newBooking);
      res.status(201).json({ success: true, data: newBooking, bookings: trip.bookings });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
