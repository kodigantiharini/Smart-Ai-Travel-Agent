import { Router } from 'express';
import {
  createTrip,
  listTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  duplicateTrip,
  getTripItinerary,
  updateTripItinerary,
} from '../controllers/tripsController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/', createTrip);
router.get('/', listTrips);
router.get('/:tripId', getTripById);
router.patch('/:tripId', updateTrip);
router.delete('/:tripId', deleteTrip);
router.post('/:tripId/duplicate', duplicateTrip);
router.get('/:tripId/itinerary', getTripItinerary);
router.put('/:tripId/itinerary', updateTripItinerary);

export default router;
