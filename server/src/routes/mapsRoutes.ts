import { Router } from 'express';
import { geocode, reverseGeocode, getRoutes } from '../controllers/mapsController.js';

const router = Router();

router.get('/geocode', geocode);
router.post('/reverse-geocode', reverseGeocode);
router.post('/routes', getRoutes);

export default router;
