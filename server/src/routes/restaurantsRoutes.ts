import { Router } from 'express';
import { searchRestaurants } from '../controllers/restaurantsController.js';

const router = Router();
router.get('/search', searchRestaurants);

export default router;
