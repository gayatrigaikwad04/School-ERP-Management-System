/**
 * Auth Service
 * Contains all business logic for authentication.
 * Calls userRepository for data access.
 */

const jwt         = require('jsonwebtoken');
const userRepo    = require('../repositories/user.repository');
const AppError    = require('../utils/AppError');
const HTTP_STATUS = require('../constants/httpStatus');

// ─────────────────────────────────────────────
// JWT helpers
// ─────────────────────────────────────────────

/**
 * Generate a signed JWT for the given user payload.
 * @param {{ id: string, email: string, role: string }} payload
 */
const generateToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured.');
  }
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// ─────────────────────────────────────────────
// Service methods
// ─────────────────────────────────────────────

const authService = {
  /**
   * Authenticate a user with email + password.
   * Returns { token, user }.
   */
  login: async (email, password) => {
    // 1. Find user — must explicitly select password field
    const user = await userRepo.findByEmail(email);

    if (!user) {
      throw new AppError('Invalid email or password.', HTTP_STATUS.UNAUTHORIZED);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Contact the administrator.', HTTP_STATUS.FORBIDDEN);
    }

    // 2. Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password.', HTTP_STATUS.UNAUTHORIZED);
    }

    // 3. Generate JWT
    const token = generateToken({ id: user._id, email: user.email, role: user.role });

    // 4. Update lastLogin timestamp (non-blocking)
    userRepo.updateById(user._id, { lastLogin: new Date() }).catch(() => {});

    return { token, user: user.toPublicJSON() };
  },

  /**
   * Return the currently authenticated user's profile.
   * @param {string} userId - from req.user.id (decoded JWT)
   */
  getCurrentUser: async (userId) => {
    const user = await userRepo.findById(userId);
    if (!user) {
      throw new AppError('User not found.', HTTP_STATUS.NOT_FOUND);
    }
    return user.toPublicJSON();
  },

  /**
   * Logout is stateless (JWT).
   * The client removes the token.
   * We return a success signal so the frontend can clean up.
   */
  logout: async () => {
    return { message: 'Logged out successfully.' };
  },
};

module.exports = authService;
