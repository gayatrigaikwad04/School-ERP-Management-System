/**
 * Global error-handling middleware.
 *
 * Express identifies error middleware by its four-argument signature.
 * Always mount this LAST in app.js (after all routes).
 *
 * Handles:
 *  - AppError (operational, known errors)
 *  - Mongoose ValidationError
 *  - Mongoose CastError   (bad ObjectId)
 *  - Mongoose duplicate key (code 11000)
 *  - JWT errors
 *  - Generic unexpected errors
 */

const logger = require('../utils/logger');
const AppError = require('../utils/AppError');
const HTTP_STATUS = require('../constants/httpStatus');

// ─────────────────────────────────────────────
// Error shape transformers
// ─────────────────────────────────────────────

const handleMongooseValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => ({
    field: el.path,
    message: el.message,
  }));
  return new AppError('Validation failed', HTTP_STATUS.BAD_REQUEST, errors);
};

const handleCastError = (err) => {
  const message = `Invalid value for field '${err.path}': ${err.value}`;
  return new AppError(message, HTTP_STATUS.BAD_REQUEST);
};

const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || 'field';
  const value = err.keyValue ? err.keyValue[field] : '';
  const message = `Duplicate value: '${value}' already exists for '${field}'.`;
  return new AppError(message, HTTP_STATUS.CONFLICT);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again.', HTTP_STATUS.UNAUTHORIZED);

const handleJWTExpiredError = () =>
  new AppError('Your session has expired. Please log in again.', HTTP_STATUS.UNAUTHORIZED);

// ─────────────────────────────────────────────
// Main error handler
// ─────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Transform known error types into AppError
  if (err.name === 'ValidationError') error = handleMongooseValidationError(err);
  else if (err.name === 'CastError') error = handleCastError(err);
  else if (err.code === 11000) error = handleDuplicateKeyError(err);
  else if (err.name === 'JsonWebTokenError') error = handleJWTError();
  else if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  // Log unexpected (non-operational) errors in full
  if (!error.isOperational) {
    logger.error('UNEXPECTED ERROR:', err);
  }

  const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message =
    error.isOperational
      ? error.message
      : process.env.NODE_ENV === 'production'
      ? 'Something went wrong. Please try again later.'
      : err.message;

  return res.status(statusCode).json({
    success: false,
    message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

module.exports = { errorHandler };
