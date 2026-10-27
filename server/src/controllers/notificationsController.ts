import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { NotificationModel } from '../models/Notification.js';
import { memoryStore, generateId } from '../services/memoryStore.js';
import { getDBStatus } from '../config/db.js';

export const listNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const dbStatus = getDBStatus();

    if (dbStatus.connected) {
      const notifications = await NotificationModel.find({ recipient: userId }).sort({ createdAt: -1 });
      res.json({ success: true, count: notifications.length, data: notifications });
    } else {
      const notifs = memoryStore.notifications
        .filter((n) => n.recipient === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      res.json({ success: true, count: notifs.length, data: notifs });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { notificationId } = req.params;
    const userId = req.user?.id;
    const dbStatus = getDBStatus();

    if (dbStatus.connected) {
      await NotificationModel.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { read: true }
      );
    } else {
      const n = memoryStore.notifications.find(
        (notif) => (notif._id === notificationId || notif.id === notificationId) && notif.recipient === userId
      );
      if (n) n.read = true;
    }

    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const dbStatus = getDBStatus();

    if (dbStatus.connected) {
      await NotificationModel.updateMany({ recipient: userId, read: false }, { read: true });
    } else {
      memoryStore.notifications.forEach((n) => {
        if (n.recipient === userId) n.read = true;
      });
    }

    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
