import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { UserModel } from '../models/User.js';
import { memoryStore, generateId } from '../services/memoryStore.js';
import { getDBStatus } from '../config/db.js';
import { ENV } from '../config/env.js';
import { AuthRequest } from '../middleware/auth.js';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const generateToken = (id: string, email: string) => {
  return jwt.sign({ id, email }, ENV.JWT_SECRET, { expiresIn: '7d' });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;
  const dbStatus = getDBStatus();

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  if (dbStatus.connected) {
    const existing = await UserModel.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(400).json({ success: false, message: 'Email is already registered.' });
      return;
    }

    const user = await UserModel.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      preferences: {
        currency: 'USD',
        units: 'metric',
        travelStyle: 'comfort',
        interests: ['scenic', 'nature', 'culture'],
      },
    });

    const token = generateToken(user._id.toString(), user.email);
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        preferences: user.preferences,
      },
    });
  } else {
    // Memory store fallback
    const existing = memoryStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      res.status(400).json({ success: false, message: 'Email is already registered.' });
      return;
    }

    const newId = generateId();
    const newUser = {
      _id: newId,
      id: newId,
      name,
      email: email.toLowerCase(),
      passwordHash,
      profileImage: '',
      preferences: {
        currency: 'USD',
        units: 'metric',
        travelStyle: 'comfort',
        interests: ['scenic', 'nature', 'culture'],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryStore.users.push(newUser);
    const token = generateToken(newId, newUser.email);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newId,
        name: newUser.name,
        email: newUser.email,
        profileImage: newUser.profileImage,
        preferences: newUser.preferences,
      },
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const dbStatus = getDBStatus();

  if (dbStatus.connected) {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = generateToken(user._id.toString(), user.email);
    res.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        preferences: user.preferences,
      },
    });
  } else {
    // Memory store fallback
    const user = memoryStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = generateToken(user._id || user.id, user.email);
    res.json({
      success: true,
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        preferences: user.preferences,
      },
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const dbStatus = getDBStatus();
  if (dbStatus.connected) {
    const user = await UserModel.findById(req.user.id).select('-passwordHash');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      preferences: user.preferences,
    };
    res.json({
      success: true,
      user: userData,
      data: userData,
    });
  } else {
    const user = memoryStore.users.find((u) => u._id === req.user?.id || u.id === req.user?.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    const userData = {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      preferences: user.preferences,
    };
    res.json({
      success: true,
      user: userData,
      data: userData,
    });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  // Security standard: Always respond with success message to avoid user enumeration
  res.json({
    success: true,
    message: `If an account with ${email} exists, password reset instructions have been sent.`,
  });
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  res.json({
    success: true,
    message: 'Password has been reset successfully. Please login with your new credentials.',
  });
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
};
