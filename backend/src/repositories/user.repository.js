/**
 * User Repository
 * All Mongoose operations for the User collection live here.
 * Services call this — controllers never touch Mongoose directly.
 */

const User = require('../models/User');

const userRepository = {
  /**
   * Find a user by email.
   * Explicitly selects password so the auth service can compare.
   */
  findByEmail: async (email) => {
    return User.findOne({ email: email.toLowerCase(), isDeleted: false }).select('+password');
  },

  /**
   * Find a user by their MongoDB _id (no password).
   */
  findById: async (id) => {
    return User.findOne({ _id: id, isDeleted: false });
  },

  /**
   * Create a new user document.
   * @param {object} data - { name, email, password, role, title }
   */
  create: async (data) => {
    const user = new User(data);
    return user.save();
  },

  /**
   * Update a user by id.
   * @param {string} id
   * @param {object} updates
   */
  updateById: async (id, updates) => {
    return User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  },

  /**
   * Soft-delete a user.
   */
  softDeleteById: async (id) => {
    return User.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  },
};

module.exports = userRepository;
