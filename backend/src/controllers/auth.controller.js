/**
 * Auth Controller
 * Handles HTTP for authentication routes.
 * Delegates all logic to authService.
 */

const authService   = require('../services/auth.service');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const HTTP_STATUS   = require('../constants/httpStatus');

const authController = {
  /**
   * POST /api/auth/login
   * Body: { email, password }
   */
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      return sendSuccess(res, HTTP_STATUS.OK, 'Login successful', {
        token: result.token,
        user: result.user,
      });
    } catch (err) {
      return next(err);
    }
  },

  /**
   * GET /api/auth/me
   * Protected route — requires valid JWT.
   */
  getCurrentUser: async (req, res, next) => {
    try {
      const user = await authService.getCurrentUser(req.user.id);
      return sendSuccess(res, HTTP_STATUS.OK, 'User profile fetched successfully', user);
    } catch (err) {
      return next(err);
    }
  },

  /**
   * POST /api/auth/logout
   * Protected route — JWT is stateless; client removes token.
   */
  logout: async (req, res, next) => {
    try {
      const result = await authService.logout();
      return sendSuccess(res, HTTP_STATUS.OK, result.message);
    } catch (err) {
      return next(err);
    }
  },
};

module.exports = authController;
