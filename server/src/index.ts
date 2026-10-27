import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security and middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

app.use(cors({
  origin: [
    ENV.CLIENT_URL,
    'http://localhost:5175',
    'http://127.0.0.1:5175',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
  ],
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

// Root route
app.get('/', (req, res) => {
  res.json({
    app: 'TripWise AI REST API',
    version: '1.0.0',
    documentation: '/api/v1',
    health: '/api/v1/health',
  });
});

// Apply rate limiter to API v1
app.use('/api/v1', apiLimiter);

// Mount API v1 router
app.use('/api/v1', apiRouter);

// Centralized error handling
app.use(errorHandler);

// Start server function
export const startServer = async () => {
  await connectDB();
  
  const server = app.listen(ENV.PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 TripWise AI Backend Server running on port ${ENV.PORT}`);
    console.log(`📍 Environment: ${ENV.NODE_ENV}`);
    console.log(`🔗 API Base URL: http://localhost:${ENV.PORT}/api/v1`);
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
