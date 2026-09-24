/**
 * Fee Repository
 * All Mongoose operations for the Fee (fee structure) collection.
 */

const Fee = require('../models/Fee');

const feeRepository = {
  /**
   * Get all fee structures — optionally filtered by academicYear / status.
   * No pagination needed (fee structures are few — one per class per year).
   */
  findAll: async (filters = {}) => {
    const query = { isDeleted: false };

    if (filters.academicYear) query.academicYear = filters.academicYear;
    if (filters.status && filters.status !== 'All') query.status = filters.status;
    if (filters.classId) query.classId = filters.classId;

    return Fee.find(query)
      .populate('classId', 'className section capacity')
      .sort({ className: 1 })
      .lean({ virtuals: true });
  },

  /**
   * Find fee structure by MongoDB _id.
   */
  findById: async (id) => {
    return Fee.findOne({ _id: id, isDeleted: false })
      .populate('classId', 'className section');
  },

  /**
   * Find fee structure by classId + academicYear (unique constraint).
   * @param {string} classId
   * @param {string} academicYear
   * @param {string} [excludeId]  - Exclude on update checks
   */
  findByClassAndYear: async (classId, academicYear, excludeId = null) => {
    const query = { classId, academicYear, isDeleted: false };
    if (excludeId) query._id = { $ne: excludeId };
    return Fee.findOne(query);
  },

  /**
   * Find active fee structure for a class (used in payment module).
   */
  findActiveByClass: async (classId) => {
    return Fee.findOne({ classId, status: 'Active', isDeleted: false });
  },

  /**
   * Create a new fee structure.
   */
  create: async (data) => {
    const fee = new Fee(data);
    return fee.save();
  },

  /**
   * Update a fee structure by id.
   */
  updateById: async (id, updates) => {
    return Fee.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updates,
      { new: true, runValidators: true }
    ).populate('classId', 'className section');
  },

  /**
   * Soft-delete.
   */
  softDeleteById: async (id) => {
    return Fee.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, status: 'Inactive' },
      { new: true }
    );
  },
};

module.exports = feeRepository;
