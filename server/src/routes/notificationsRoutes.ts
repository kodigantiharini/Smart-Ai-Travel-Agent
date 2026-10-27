import { Router } from 'express';
import {
  listNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationsController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', listNotifications);
router.patch('/:notificationId/read', markAsRead);
router.post('/read-all', markAllAsRead);

export default router;
