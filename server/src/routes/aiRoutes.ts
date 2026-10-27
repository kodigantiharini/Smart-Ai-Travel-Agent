import { Router } from 'express';
import { assistantChat, getRecommendations, generateItinerary } from '../controllers/aiController.js';

const router = Router();

router.post('/assistant', assistantChat);
router.post('/recommendations', getRecommendations);
router.post('/itinerary', generateItinerary);

export default router;
