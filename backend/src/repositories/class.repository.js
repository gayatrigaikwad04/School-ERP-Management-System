/**
 * Class Repository
 * All Mongoose operations for the Class collection.
 */

const Class = require('../models/Class');

const classRepository = {
  /**
   * Return paginated, filtered list of classes.
   * @param {object} filters  - { search, status, academicYear }
   * @param {object} options  - { page, limit, sort }
   */
  findAll: async (filters = {}, options = {}) => {
    const query = { isDeleted: false };

    if (filters.status && filters.status !== 'All') {
      query.status = filters.status;
    }

    if (filters.academicYear) {
      query.academicYear = filters.academicYear;
    }

    if (filters.search) {
      const regex = new RegExp(filters.search, 'i');
      query.$or = [
        { className: regex },
        { section: regex },
        { classTeacherName: regex },
        { room: regex },
      ];
    }

    const page  = Math.max(1, Number(options.page)  || 1);
    const limit = Math.min(100, Number(options.limit) || 20);
    const skip  = (page - 1) * limit;
    const sort  = options.sort || { className: 1, section: 1 };

    const [classes, total] = await Promise.all([
      Class.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Class.countDocuments(query),
    ]);

    return { classes, total, page, limit };
  },

  /**
   * Return all active classes (for dropdowns / lookups — no pagination).
   */
  findAllActive: async () => {
    return Class.find({ status: 'Active', isDeleted: false })
      .sort({ className: 1, section: 1 })
      .lean();
  },

  /**
   * Find a single class by its MongoDB _id.
   */
  findById: async (id) => {
    return Class.findOne({ _id: id, isDeleted: false });
  },

  /**
   * Check whether a class with the same name+section+year exists.
   * Used to prevent duplicates before create/update.
   * @param {string} className
   * @param {string} section
   * @param {string} academicYear
   * @param {string} [excludeId]   - Exclude this id during update checks
   */
  findDuplicate: async (className, section, academicYear, excludeId = null) => {
    const query = {
      className: new RegExp(`^${className}$`, 'i'),
      section: section.toUpperCase(),
      academicYear,
      isDeleted: false,
    };
    if (excludeId) query._id = { $ne: excludeId };
    return Class.findOne(query);
  },

  /**
   * Create a new class document.
   */
  create: async (data) => {
    const cls = new Class(data);
    return cls.save();
  },

  /**
   * Update a class by id.
   */
  updateById: async (id, updates) => {
    return Class.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updates,
      { new: true, runValidators: true }
    );
  },

  /**
   * Soft-delete a class.
   */
  softDeleteById: async (id) => {
    return Class.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, status: 'Inactive' },
      { new: true }
    );
  },
};

module.exports = classRepository;
