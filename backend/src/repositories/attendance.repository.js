/**
 * Attendance Repository
 * All Mongoose operations for the Attendance collection.
 */

const Attendance = require('../models/Attendance');

const attendanceRepository = {
  /**
   * Check if a student already has an attendance record for a given date.
   * Used for duplicate prevention.
   */
  findByStudentAndDate: async (studentId, date) => {
    return Attendance.findOne({ studentId, date, isDeleted: false });
  },

  /**
   * Get all attendance records for a class on a specific date.
   * Used to render the daily attendance sheet.
   */
  findByClassAndDate: async (classId, date) => {
    return Attendance.find({ classId, date, isDeleted: false })
      .populate('studentId', 'firstName lastName studentId rollNo avatar')
      .sort({ 'studentId.rollNo': 1 })
      .lean();
  },

  /**
   * Get attendance history for a single student — paginated.
   * @param {string} studentId
   * @param {object} filters  - { startDate, endDate, status }
   * @param {object} options  - { page, limit }
   */
  findByStudent: async (studentId, filters = {}, options = {}) => {
    const query = { studentId, isDeleted: false };

    if (filters.status && filters.status !== 'All') {
      query.status = filters.status;
    }

    // Date range filter using string comparison (YYYY-MM-DD sorts lexicographically)
    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = filters.startDate;
      if (filters.endDate)   query.date.$lte = filters.endDate;
    }

    const page  = Math.max(1, Number(options.page)  || 1);
    const limit = Math.min(100, Number(options.limit) || 30);
    const skip  = (page - 1) * limit;

    const [records, total] = await Promise.all([
      Attendance.find(query).sort({ date: -1 }).skip(skip).limit(limit).lean(),
      Attendance.countDocuments(query),
    ]);

    return { records, total, page, limit };
  },

  /**
   * Get paginated attendance with class + date filters.
   */
  findAll: async (filters = {}, options = {}) => {
    const query = { isDeleted: false };

    if (filters.classId)   query.classId = filters.classId;
    if (filters.date)      query.date    = filters.date;
    if (filters.status && filters.status !== 'All') query.status = filters.status;

    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = filters.startDate;
      if (filters.endDate)   query.date.$lte = filters.endDate;
    }

    const page  = Math.max(1, Number(options.page)  || 1);
    const limit = Math.min(200, Number(options.limit) || 50);
    const skip  = (page - 1) * limit;

    const [records, total] = await Promise.all([
      Attendance.find(query)
        .populate('studentId', 'firstName lastName studentId rollNo')
        .populate('classId',   'className section')
        .sort({ date: -1, studentName: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Attendance.countDocuments(query),
    ]);

    return { records, total, page, limit };
  },

  /**
   * Count Present/Absent for a class on a date.
   * Returns { present, absent, total }.
   */
  getSummaryByClassAndDate: async (classId, date) => {
    const result = await Attendance.aggregate([
      { $match: { classId: new (require('mongoose').Types.ObjectId)(classId), date, isDeleted: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const summary = { present: 0, absent: 0, total: 0 };
    result.forEach((r) => {
      if (r._id === 'Present') summary.present = r.count;
      if (r._id === 'Absent')  summary.absent  = r.count;
    });
    summary.total = summary.present + summary.absent;
    return summary;
  },

  /**
   * Count how many students were marked Present today across all classes.
   */
  countPresentToday: async (todayStr) => {
    return Attendance.countDocuments({ date: todayStr, status: 'Present', isDeleted: false });
  },

  /**
   * Bulk-insert attendance records for a full class in one operation.
   * Uses ordered:false so a duplicate doesn't block the rest.
   */
  bulkCreate: async (records) => {
    return Attendance.insertMany(records, { ordered: false });
  },

  /**
   * Create a single attendance record.
   */
  create: async (data) => {
    const record = new Attendance(data);
    return record.save();
  },

  /**
   * Update a single attendance record by its _id.
   */
  updateById: async (id, updates) => {
    return Attendance.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updates,
      { new: true, runValidators: true }
    );
  },

  /**
   * Find attendance record by its _id.
   */
  findById: async (id) => {
    return Attendance.findOne({ _id: id, isDeleted: false });
  },
};

module.exports = attendanceRepository;
