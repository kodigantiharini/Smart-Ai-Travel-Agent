import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);

// Security and middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false,
}));

const allowedOrigins = [
  ENV.CLIENT_URL,
  ENV.CLIENT_URL?.replace(/\/$/, ''),
  'http://localhost:5175',
  'http://127.0.0.1:5175',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.onrender.com') ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (ENV.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Apply rate limiter to API v1
app.use('/api/v1', apiLimiter);

// Mount API v1 router
app.use('/api/v1', apiRouter);

// Resolve frontend client dist directory
const clientDistPath = path.resolve(__dirname, '../../client/dist');
const hasClientDist = fs.existsSync(clientDistPath) && fs.existsSync(path.join(clientDistPath, 'index.html'));

if (hasClientDist) {
  // Serve static assets with cache headers
  app.use(express.static(clientDistPath, { maxAge: '1d' }));

  // Fallback to React index.html for client-side routing
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // Root route when running in API-only mode
  app.get('/', (req, res) => {
    res.json({
      app: 'TripWise AI REST API',
      version: '1.0.0',
      documentation: '/api/v1',
      health: '/api/v1/health',
    });
  });

  app.all('/api/*', (req, res) => {
    res.status(404).json({ success: false, message: 'API endpoint not found' });
  });
}

// Centralized error handling
app.use(errorHandler);

// Start server function
export const startServer = async () => {
  await connectDB();
  
  const server = app.listen(ENV.PORT, '0.0.0.0', () => {
    console.log(`===============================================`);
    console.log(`🚀 TripWise AI Server running on port ${ENV.PORT}`);
    console.log(`📍 Environment: ${ENV.NODE_ENV}`);
    console.log(`🔗 API Base URL: http://0.0.0.0:${ENV.PORT}/api/v1`);
    if (hasClientDist) {
      console.log(`🌐 Serving Frontend UI from: ${clientDistPath}`);
    }
    console.log(`===============================================`);
  });

  return { app, server };
};

// Auto start if directly executed
if (process.env.NODE_ENV !== 'test') {
  startServer().catch((err) => {
    console.error('Fatal server startup failure:', err);
  });
}

export default app;
