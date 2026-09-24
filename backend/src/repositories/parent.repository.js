/**
 * Parent Repository
 * All Mongoose operations for the Parent collection.
 */

const Parent = require('../models/Parent');

const parentRepository = {
  /**
   * Return paginated, searchable list of parents.
   * @param {object} filters  - { search }
   * @param {object} options  - { page, limit }
   */
  findAll: async (filters = {}, options = {}) => {
    const query = { isDeleted: false };

    if (filters.search) {
      const regex = new RegExp(filters.search, 'i');
      query.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { parentId: regex },
        { occupation: regex },
      ];
    }

    const page  = Math.max(1, Number(options.page)  || 1);
    const limit = Math.min(100, Number(options.limit) || 20);
    const skip  = (page - 1) * limit;

    const [parents, total] = await Promise.all([
      Parent.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Parent.countDocuments(query),
    ]);

    return { parents, total, page, limit };
  },

  /**
   * All parents for dropdown lookups.
   */
  findAllList: async () => {
    return Parent.find({ isDeleted: false })
      .select('_id parentId name phone email')
      .sort({ name: 1 })
      .lean();
  },

  /**
   * Find by MongoDB _id.
   */
  findById: async (id) => {
    return Parent.findOne({ _id: id, isDeleted: false });
  },

  /**
   * Find by parentId code (PAR-YYYY-NNN).
   */
  findByParentId: async (parentId) => {
    return Parent.findOne({ parentId: parentId.toUpperCase(), isDeleted: false });
  },

  /**
   * Check duplicate email (exclude current doc on update).
   */
  findByEmail: async (email, excludeId = null) => {
    const query = { email: email.toLowerCase(), isDeleted: false };
    if (excludeId) query._id = { $ne: excludeId };
    return Parent.findOne(query);
  },

  /**
   * Check duplicate parentId (exclude current doc on update).
   */
  findDuplicateParentId: async (parentId, excludeId = null) => {
    const query = { parentId: parentId.toUpperCase(), isDeleted: false };
    if (excludeId) query._id = { $ne: excludeId };
    return Parent.findOne(query);
  },

  /**
   * Get the last parentId to generate the next sequential one.
   * Returns the highest PAR-YYYY-NNN code.
   */
  findLastParentId: async () => {
    return Parent.findOne({ isDeleted: false }, { parentId: 1 })
      .sort({ parentId: -1 })
      .lean();
  },

  /**
   * Create a new parent.
   */
  create: async (data) => {
    const parent = new Parent(data);
    return parent.save();
  },

  /**
   * Update by id.
   */
  updateById: async (id, updates) => {
    return Parent.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updates,
      { new: true, runValidators: true }
    );
  },

  /**
   * Add a student ObjectId to the parent's studentIds array.
   */
  addStudentRef: async (parentId, studentObjectId) => {
    return Parent.findByIdAndUpdate(
      parentId,
      { $addToSet: { studentIds: studentObjectId } },
      { new: true }
    );
  },

  /**
   * Remove a student ObjectId from the parent's studentIds array.
   */
  removeStudentRef: async (parentId, studentObjectId) => {
    return Parent.findByIdAndUpdate(
      parentId,
      { $pull: { studentIds: studentObjectId } },
      { new: true }
    );
  },

  /**
   * Soft-delete.
   */
  softDeleteById: async (id) => {
    return Parent.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
  },
};

module.exports = parentRepository;
