/**
 * Custom operational error class.
 * Thrown by services and repositories to signal expected failures
 * (validation, not-found, conflict) in a structured way.
 *
 * The global error handler checks `isOperational` to decide whether
 * to expose the message to the client or return a generic 500.
 */

class AppError extends Error {
  /**
   * @param {string} message  - Human-readable message returned to the client.
   * @param {number} statusCode - HTTP status code (4xx / 5xx).
   * @param {Array}  [errors]  - Optional array of field-level validation errors.
   */
  constructor(message, statusCode, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true; // Distinguish from unexpected programming errors
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
