import { Router } from 'express';
import { searchFlights } from '../controllers/flightsController.js';

const router = Router();
router.get('/search', searchFlights);

export default router;
