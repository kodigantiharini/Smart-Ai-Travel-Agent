import { Router } from 'express';
import {
  searchPlaces,
  autocomplete,
  getNearby,
  getPlaceDetails,
} from '../controllers/placesController.js';

const router = Router();

router.get('/search', searchPlaces);
router.get('/autocomplete', autocomplete);
router.get('/nearby', getNearby);
router.get('/:placeId', getPlaceDetails);

export default router;
