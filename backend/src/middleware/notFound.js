/**
 * 404 Not-Found middleware.
 * Mount this BEFORE the global error handler but AFTER all routes.
 * Any request that reaches here matched no route.
 */

const HTTP_STATUS = require('../constants/httpStatus');

const notFound = (req, res, _next) => {
  return res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    errors: [],
  });
};

module.exports = { notFound };
