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
  inviteCollaborator,
  removeCollaborator,
  joinTripByCode,
  getTripVotes,
  proposeTripVote,
  castTripVote,
  approveVoteToItinerary,
  getTripMessages,
  sendTripMessage,
  getTripBookings,
  linkTripBooking,
} from '../controllers/tripsController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/', createTrip);
router.get('/', listTrips);
router.post('/join', joinTripByCode);
router.get('/:tripId', getTripById);
router.patch('/:tripId', updateTrip);
router.delete('/:tripId', deleteTrip);
router.post('/:tripId/duplicate', duplicateTrip);
router.get('/:tripId/itinerary', getTripItinerary);
router.put('/:tripId/itinerary', updateTripItinerary);

// MiVoyage Collaborator Routes
router.post('/:tripId/collaborators', inviteCollaborator);
router.delete('/:tripId/collaborators/:email', removeCollaborator);

// MiVoyage Voting Routes
router.get('/:tripId/votes', getTripVotes);
router.post('/:tripId/votes', proposeTripVote);
router.post('/:tripId/votes/:voteId/vote', castTripVote);
router.post('/:tripId/votes/:voteId/approve', approveVoteToItinerary);

// MiVoyage Group Discussion Messages Routes
router.get('/:tripId/messages', getTripMessages);
router.post('/:tripId/messages', sendTripMessage);

// MiVoyage Attached Bookings Routes
router.get('/:tripId/bookings', getTripBookings);
router.post('/:tripId/bookings', linkTripBooking);

export default router;
