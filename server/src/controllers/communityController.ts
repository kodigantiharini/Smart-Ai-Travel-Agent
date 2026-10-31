import { Request, Response } from 'express';
import { StoryModel, IStory } from '../models/Story.js';
import { memoryStore, generateId } from '../services/memoryStore.js';
import { getDBStatus } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';

export const getStories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, destination, search } = req.query;
    const dbStatus = getDBStatus();

    if (dbStatus.connected) {
      const query: any = {};
      if (category && category !== 'all') {
        query.category = category;
      }
      if (destination) {
        query.destination = new RegExp(destination as string, 'i');
      }
      if (search) {
        query.$or = [
          { title: new RegExp(search as string, 'i') },
          { content: new RegExp(search as string, 'i') },
          { destination: new RegExp(search as string, 'i') },
          { tags: new RegExp(search as string, 'i') },
        ];
      }

      let stories = await StoryModel.find(query).sort({ createdAt: -1 }).limit(50);
      if (stories.length === 0 && !category && !destination && !search) {
        try {
          const seeded = memoryStore.stories.map((s) => ({
            authorId: s.authorId || '654321098765432109876543',
            authorName: s.authorName || 'Travel Explorer',
            authorAvatar: s.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            title: s.title,
            content: s.content,
            destination: s.destination,
            location: s.location || '',
            photos: s.photos || [],
            category: s.category || 'nature',
            tags: s.tags || [],
            likes: Array.isArray(s.likes) ? s.likes : [],
            comments: Array.isArray(s.comments) ? s.comments : [],
            tripPlanPreview: s.tripPlanPreview,
            createdAt: new Date(),
          }));
          await StoryModel.insertMany(seeded);
          stories = await StoryModel.find(query).sort({ createdAt: -1 }).limit(50);
        } catch (seedErr) {
          console.warn('Auto-seed MongoDB stories skipped:', seedErr);
        }
      }
      res.json({ success: true, count: stories.length, data: stories });
    } else {
      let filtered = [...memoryStore.stories];
      if (category && category !== 'all') {
        filtered = filtered.filter((s) => s.category === category);
      }
      if (destination) {
        const destLower = (destination as string).toLowerCase();
        filtered = filtered.filter((s) => s.destination?.toLowerCase().includes(destLower));
      }
      if (search) {
        const sLower = (search as string).toLowerCase();
        filtered = filtered.filter(
          (s) =>
            s.title?.toLowerCase().includes(sLower) ||
            s.content?.toLowerCase().includes(sLower) ||
            s.destination?.toLowerCase().includes(sLower) ||
            s.tags?.some((t: string) => t.toLowerCase().includes(sLower))
        );
      }
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      res.json({ success: true, data: filtered });
    }
  } catch (err: any) {
    console.error('getStories error:', err);
    res.json({ success: true, data: memoryStore.stories });
  }
};

export const getStoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const dbStatus = getDBStatus();

    if (dbStatus.connected) {
      const story = await StoryModel.findById(id);
      if (!story) {
        res.status(404).json({ success: false, message: 'Story not found.' });
        return;
      }
      res.json({ success: true, data: story });
    } else {
      const story = memoryStore.stories.find((s) => s._id === id || s.id === id);
      if (!story) {
        res.status(404).json({ success: false, message: 'Story not found.' });
        return;
      }
      res.json({ success: true, data: story });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createStory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, content, destination, location, photos, category, tags, tripPlanPreview } = req.body;
    const authorId = req.user?.id || 'demo-user';
    const authorName = req.user?.name || 'Explorer';
    const authorAvatar =
      req.user?.profileImage ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

    if (!title || !content || !destination) {
      res.status(400).json({ success: false, message: 'Title, content, and destination are required.' });
      return;
    }

    const dbStatus = getDBStatus();
    if (dbStatus.connected) {
      const newStory = await StoryModel.create({
        authorId,
        authorName,
        authorAvatar,
        title,
        content,
        destination,
        location: location || destination,
        photos: Array.isArray(photos) && photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'],
        category: category || 'nature',
        tags: Array.isArray(tags) ? tags : [],
        likes: [],
        comments: [],
        tripPlanPreview,
      });
      res.status(201).json({ success: true, data: newStory });
    } else {
      const id = generateId();
      const newStory = {
        _id: id,
        id,
        authorId,
        authorName,
        authorAvatar,
        title,
        content,
        destination,
        location: location || destination,
        photos: Array.isArray(photos) && photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'],
        category: category || 'nature',
        tags: Array.isArray(tags) ? tags : [],
        likes: [],
        comments: [],
        tripPlanPreview,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.stories.unshift(newStory);
      res.status(201).json({ success: true, data: newStory });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const toggleLikeStory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'demo-user';
    const dbStatus = getDBStatus();

    if (dbStatus.connected) {
      const story = await StoryModel.findById(id);
      if (!story) {
        res.status(404).json({ success: false, message: 'Story not found.' });
        return;
      }

      const index = story.likes.indexOf(userId);
      if (index === -1) {
        story.likes.push(userId);
      } else {
        story.likes.splice(index, 1);
      }
      await story.save();
      res.json({ success: true, data: { likes: story.likes, count: story.likes.length, isLiked: story.likes.includes(userId) } });
    } else {
      const story = memoryStore.stories.find((s) => s._id === id || s.id === id);
      if (!story) {
        res.status(404).json({ success: false, message: 'Story not found.' });
        return;
      }
      if (!Array.isArray(story.likes)) story.likes = [];
      const index = story.likes.indexOf(userId);
      if (index === -1) {
        story.likes.push(userId);
      } else {
        story.likes.splice(index, 1);
      }
      res.json({ success: true, data: { likes: story.likes, count: story.likes.length, isLiked: story.likes.includes(userId) } });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user?.id || 'demo-user';
    const userName = req.user?.name || 'Fellow Traveler';
    const userAvatar =
      req.user?.profileImage ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

    if (!text || !text.trim()) {
      res.status(400).json({ success: false, message: 'Comment text cannot be empty.' });
      return;
    }

    const comment = {
      id: generateId(),
      userId,
      userName,
      userAvatar,
      text: text.trim(),
      createdAt: 'Just now',
    };

    const dbStatus = getDBStatus();
    if (dbStatus.connected) {
      const story = await StoryModel.findById(id);
      if (!story) {
        res.status(404).json({ success: false, message: 'Story not found.' });
        return;
      }
      story.comments.push(comment);
      await story.save();
      res.json({ success: true, data: comment, comments: story.comments });
    } else {
      const story = memoryStore.stories.find((s) => s._id === id || s.id === id);
      if (!story) {
        res.status(404).json({ success: false, message: 'Story not found.' });
        return;
      }
      if (!Array.isArray(story.comments)) story.comments = [];
      story.comments.push(comment);
      res.json({ success: true, data: comment, comments: story.comments });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
