/**
 * Authentication & authorisation middleware.
 *
 * protect   — Verifies JWT from Authorization header and attaches req.user.
 * authorize — Restricts endpoint to one or more roles.
 */

const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const HTTP_STATUS = require('../constants/httpStatus');

/**
 * Verify JWT and attach the decoded payload to req.user.
 * Expects: Authorization: Bearer <token>
 */
const protect = (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(
        new AppError('Authentication required. Please provide a Bearer token.', HTTP_STATUS.UNAUTHORIZED)
      );
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role, iat, exp }
    return next();
  } catch (err) {
    return next(err); // Passed to global error handler (handles JWT errors)
  }
};

/**
 * Restrict access to specific roles.
 * Must be used AFTER `protect`.
 *
 * Usage: router.delete('/...', protect, authorize('Admin'), controller)
 *
 * @param  {...string} roles - Allowed roles, e.g. 'Admin', 'Staff'
 */
const authorize = (...roles) => {
  return (req, _res, next) => {
    if (!roles.includes(req.user?.role)) {
      return next(
        new AppError(
          `Access denied. Required role: ${roles.join(' or ')}.`,
          HTTP_STATUS.FORBIDDEN
        )
      );
    }
    return next();
  };
};

module.exports = { protect, authorize };
