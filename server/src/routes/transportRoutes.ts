import { Router } from 'express';
import { searchTransport } from '../controllers/transportController.js';

const router = Router();
router.get('/search', searchTransport);

export default router;
