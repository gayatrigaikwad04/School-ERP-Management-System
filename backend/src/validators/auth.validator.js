/**
 * Auth Validators
 * express-validator chains for authentication routes.
 * Imported as arrays and spread into route definitions.
 */

const { body } = require('express-validator');
const { validate } = require('../middleware/validate');

/**
 * Validation rules for POST /api/auth/login
 */
const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

  validate, // Execute checks and short-circuit if errors exist
];

module.exports = { loginValidator };
