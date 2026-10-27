import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { UserModel } from '../models/User.js';
import { memoryStore } from '../services/memoryStore.js';
import { getDBStatus } from '../config/db.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as { id: string; email: string };

    const dbStatus = getDBStatus();
    if (dbStatus.connected) {
      const user = await UserModel.findById(decoded.id).select('-passwordHash');
      if (!user) {
        res.status(401).json({ success: false, message: 'Invalid token. User not found.' });
        return;
      }
      req.user = { id: user._id.toString(), email: user.email, name: user.name };
    } else {
      // Memory store fallback
      const user = memoryStore.users.find((u) => u._id === decoded.id || u.id === decoded.id);
      if (!user) {
        res.status(401).json({ success: false, message: 'Invalid token or session expired.' });
        return;
      }
      req.user = { id: user._id || user.id, email: user.email, name: user.name };
    }

    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
    });
  }
};
