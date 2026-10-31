import { Router } from 'express';
import {
  getStories,
  getStoryById,
  createStory,
  toggleLikeStory,
  addComment,
} from '../controllers/communityController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/stories', getStories);
router.get('/stories/:id', getStoryById);
router.post('/stories', requireAuth, createStory);
router.post('/stories/:id/like', requireAuth, toggleLikeStory);
router.post('/stories/:id/comments', requireAuth, addComment);

export default router;
