/**
 * Student Repository
 * All Mongoose operations for the Student collection.
 */

const Student = require('../models/Student');

const studentRepository = {
  /**
   * Paginated, filtered list of students.
   * @param {object} filters - { search, classId, status, gender }
   * @param {object} options - { page, limit, sort }
   */
  findAll: async (filters = {}, options = {}) => {
    const query = { isDeleted: false };

    if (filters.status && filters.status !== 'All') {
      query.status = filters.status;
    }

    if (filters.gender && filters.gender !== 'All') {
      query.gender = filters.gender;
    }

    if (filters.classId && filters.classId !== 'All') {
      query.classId = filters.classId;
    }

    if (filters.search) {
      const regex = new RegExp(filters.search, 'i');
      query.$or = [
        { firstName: regex },
        { lastName: regex },
        { studentId: regex },
        { parentName: regex },
        { phone: regex },
        { rollNo: regex },
      ];
    }

    const page  = Math.max(1, Number(options.page)  || 1);
    const limit = Math.min(100, Number(options.limit) || 20);
    const skip  = (page - 1) * limit;
    const sort  = options.sort || { createdAt: -1 };

    const [students, total] = await Promise.all([
      Student.find(query)
        .populate('classId', 'className section')
        .populate('parentId', 'name email phone')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean({ virtuals: true }),
      Student.countDocuments(query),
    ]);

    return { students, total, page, limit };
  },

  /**
   * Get all active students (bulk, no pagination) — used for attendance, fees.
   * @param {string} [classId] - Optional filter by class
   */
  findAllActive: async (classId = null) => {
    const query = { status: 'Active', isDeleted: false };
    if (classId) query.classId = classId;
    return Student.find(query)
      .sort({ firstName: 1, lastName: 1 })
      .lean({ virtuals: true });
  },

  /**
   * Find a student by MongoDB _id — full detail with populated refs.
   */
  findById: async (id) => {
    return Student.findOne({ _id: id, isDeleted: false })
      .populate('classId', 'className section academicYear capacity')
      .populate('parentId', 'name email phone address occupation parentId');
  },

  /**
   * Find by human-readable studentId (e.g. OA-2026-0491).
   */
  findByStudentId: async (studentId) => {
    return Student.findOne({ studentId: studentId.toUpperCase(), isDeleted: false });
  },

  /**
   * Check for duplicate studentId, optionally excluding one document.
   */
  findDuplicateStudentId: async (studentId, excludeId = null) => {
    const query = { studentId: studentId.toUpperCase(), isDeleted: false };
    if (excludeId) query._id = { $ne: excludeId };
    return Student.findOne(query);
  },

  /**
   * Get last studentId to generate next sequential code.
   */
  findLastStudentId: async () => {
    return Student.findOne({ isDeleted: false }, { studentId: 1 })
      .sort({ studentId: -1 })
      .lean();
  },

  /**
   * Count students by class.
   */
  countByClass: async (classId) => {
    return Student.countDocuments({ classId, status: 'Active', isDeleted: false });
  },

  /**
   * Count all active students.
   */
  countActive: async () => {
    return Student.countDocuments({ status: 'Active', isDeleted: false });
  },

  /**
   * Count total students (non-deleted).
   */
  countTotal: async () => {
    return Student.countDocuments({ isDeleted: false });
  },

  /**
   * Create a new student document.
   */
  create: async (data) => {
    const student = new Student(data);
    return student.save();
  },

  /**
   * Update by id.
   */
  updateById: async (id, updates) => {
    return Student.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updates,
      { new: true, runValidators: true }
    )
      .populate('classId', 'className section')
      .populate('parentId', 'name email phone');
  },

  /**
   * Update paidAmount only — called by payment module.
   */
  updatePaidAmount: async (id, newPaidAmount) => {
    return Student.findByIdAndUpdate(
      id,
      { paidAmount: newPaidAmount },
      { new: true }
    );
  },

  /**
   * Soft-delete.
   */
  softDeleteById: async (id) => {
    return Student.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, status: 'Inactive' },
      { new: true }
    );
  },

  /**
   * Toggle status Active ↔ Inactive.
   */
  toggleStatus: async (id) => {
    const student = await Student.findOne({ _id: id, isDeleted: false });
    if (!student) return null;
    student.status = student.status === 'Active' ? 'Inactive' : 'Active';
    return student.save();
  },
};

module.exports = studentRepository;
