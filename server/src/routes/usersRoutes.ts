import { Router } from 'express';
import { getProfile, updateProfile, deleteAccount, getUserStats } from '../controllers/usersController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/me', getProfile);
router.patch('/me', updateProfile);
router.delete('/me', deleteAccount);
router.get('/stats', getUserStats);

export default router;
