/**
 * Express application factory.
 * Configures all global middleware, mounts the API router,
 * and attaches error-handling middleware.
 */

const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit    = require('express-rate-limit');

const apiRoutes           = require('./routes/index');
const { notFound }        = require('./middleware/notFound');
const { errorHandler }    = require('./middleware/errorMiddleware');
const logger              = require('./utils/logger');
const HTTP_STATUS         = require('./constants/httpStatus');

const app = express();

// ─────────────────────────────────────────────
// Security middleware
// ─────────────────────────────────────────────

app.use(helmet());

// CORS — allow requests from the configured frontend origin
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS policy: origin '${origin}' not allowed.`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Global rate limiter — 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again after 15 minutes.',
    errors: [],
  },
});

app.use('/api', globalLimiter);

// ─────────────────────────────────────────────
// Parsers & logging
// ─────────────────────────────────────────────

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'test') {
  // Stream Morgan output through Winston
  app.use(
    morgan('combined', {
      stream: { write: (message) => logger.http(message.trim()) },
    })
  );
}

// ─────────────────────────────────────────────
// Health check (unauthenticated, no rate limit)
// ─────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'SchoolERP API is running',
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    },
  });
});

// ─────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────

app.use('/api', apiRoutes);

// ─────────────────────────────────────────────
// Error handling (must be last)
// ─────────────────────────────────────────────

app.use(notFound);
app.use(errorHandler);

module.exports = app;
