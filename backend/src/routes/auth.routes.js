/**
 * Auth Routes
 * POST /api/auth/login
 * GET  /api/auth/me
 * POST /api/auth/logout
 */

const { Router } = require('express');
const rateLimit  = require('express-rate-limit');

const authController          = require('../controllers/auth.controller');
const { loginValidator }      = require('../validators/auth.validator');
const { protect }             = require('../middleware/authMiddleware');

const router = Router();

// Stricter rate limiter for login — 10 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in 15 minutes.',
    errors: [],
  },
});

// POST /api/auth/login
router.post('/login', loginLimiter, loginValidator, authController.login);

// GET /api/auth/me  (protected)
router.get('/me', protect, authController.getCurrentUser);

// POST /api/auth/logout  (protected)
router.post('/logout', protect, authController.logout);

module.exports = router;
