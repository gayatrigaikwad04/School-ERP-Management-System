/**
 * Attendance Service
 * Business logic for attendance marking.
 *
 * Business rules enforced:
 *  - One record per student per date (duplicate prevention).
 *  - Student must be Active.
 *  - Cannot mark attendance for a future date.
 *  - Bulk mark: mark whole class in one request (upsert semantics — update if exists).
 */

const attendanceRepo = require('../repositories/attendance.repository');
const studentRepo    = require('../repositories/student.repository');
const classRepo      = require('../repositories/class.repository');
const AppError       = require('../utils/AppError');
const HTTP_STATUS    = require('../constants/httpStatus');

// ─────────────────────────────────────────────
// Helper: today's date string YYYY-MM-DD
// ─────────────────────────────────────────────
const todayStr = () => new Date().toISOString().split('T')[0];

const attendanceService = {
  /**
   * Get all attendance records for a class on a date.
   * @param {string} classId
   * @param {string} date  YYYY-MM-DD
   */
  getAttendanceByClassAndDate: async (classId, date) => {
    const cls = await classRepo.findById(classId);
    if (!cls) throw new AppError('Class not found.', HTTP_STATUS.NOT_FOUND);

    const records = await attendanceRepo.findByClassAndDate(classId, date);
    const summary = await attendanceRepo.getSummaryByClassAndDate(classId, date);
    return { date, class: cls, records, summary };
  },

  /**
   * Get attendance history for a single student.
   */
  getStudentAttendance: async (studentId, queryParams) => {
    const student = await studentRepo.findById(studentId);
    if (!student) throw new AppError('Student not found.', HTTP_STATUS.NOT_FOUND);

    const filters = {
      startDate: queryParams.startDate || '',
      endDate:   queryParams.endDate   || '',
      status:    queryParams.status    || '',
    };
    const options = { page: queryParams.page || 1, limit: queryParams.limit || 30 };

    const result = await attendanceRepo.findByStudent(studentId, filters, options);
    return { student: { id: student._id, name: `${student.firstName} ${student.lastName}`, studentId: student.studentId }, ...result };
  },

  /**
   * Get paginated attendance with filters.
   */
  getAttendance: async (queryParams) => {
    const filters = {
      classId:   queryParams.classId   || '',
      date:      queryParams.date      || '',
      startDate: queryParams.startDate || '',
      endDate:   queryParams.endDate   || '',
      status:    queryParams.status    || '',
    };
    const options = { page: queryParams.page || 1, limit: queryParams.limit || 50 };
    return attendanceRepo.findAll(filters, options);
  },

  /**
   * Mark attendance for a single student.
   * Rejects duplicates — use updateAttendance to correct an existing record.
   */
  markAttendance: async (data) => {
    const { studentId, classId, date, status, remarks } = data;

    // 1. Validate date is not in the future
    if (date > todayStr()) {
      throw new AppError('Cannot mark attendance for a future date.', HTTP_STATUS.BAD_REQUEST);
    }

    // 2. Validate student exists and is Active
    const student = await studentRepo.findById(studentId);
    if (!student) throw new AppError('Student not found.', HTTP_STATUS.NOT_FOUND);
    if (student.status === 'Inactive') {
      throw new AppError('Cannot mark attendance for an inactive student.', HTTP_STATUS.BAD_REQUEST);
    }

    // 3. Validate class
    const cls = await classRepo.findById(classId);
    if (!cls) throw new AppError('Class not found.', HTTP_STATUS.NOT_FOUND);

    // 4. Duplicate check
    const existing = await attendanceRepo.findByStudentAndDate(studentId, date);
    if (existing) {
      throw new AppError(
        `Attendance for ${student.firstName} ${student.lastName} on ${date} already exists. Use PUT to update.`,
        HTTP_STATUS.CONFLICT
      );
    }

    // 5. Create record with denormalised fields
    return attendanceRepo.create({
      studentId,
      classId,
      date,
      status,
      remarks:     remarks || '',
      studentName: `${student.firstName} ${student.lastName}`,
      className:   `${cls.className} ${cls.section}`,
    });
  },

  /**
   * Bulk mark attendance for an entire class.
   * Accepts an array of { studentId, status, remarks }.
   * Uses upsert-like logic: creates new, updates existing.
   *
   * @param {string} classId
   * @param {string} date
   * @param {Array}  entries  - [{ studentId, status, remarks }]
   */
  bulkMarkAttendance: async (classId, date, entries) => {
    if (date > todayStr()) {
      throw new AppError('Cannot mark attendance for a future date.', HTTP_STATUS.BAD_REQUEST);
    }

    const cls = await classRepo.findById(classId);
    if (!cls) throw new AppError('Class not found.', HTTP_STATUS.NOT_FOUND);

    const results = { created: 0, updated: 0, errors: [] };

    await Promise.all(
      entries.map(async (entry) => {
        try {
          const student = await studentRepo.findById(entry.studentId);
          if (!student || student.status === 'Inactive') return;

          const existing = await attendanceRepo.findByStudentAndDate(entry.studentId, date);

          if (existing) {
            await attendanceRepo.updateById(existing._id, {
              status:  entry.status,
              remarks: entry.remarks || existing.remarks,
            });
            results.updated += 1;
          } else {
            await attendanceRepo.create({
              studentId:   entry.studentId,
              classId,
              date,
              status:      entry.status,
              remarks:     entry.remarks || '',
              studentName: `${student.firstName} ${student.lastName}`,
              className:   `${cls.className} ${cls.section}`,
            });
            results.created += 1;
          }
        } catch (err) {
          results.errors.push({ studentId: entry.studentId, error: err.message });
        }
      })
    );

    return {
      date,
      classId,
      className: `${cls.className} ${cls.section}`,
      ...results,
    };
  },

  /**
   * Update an existing attendance record.
   * Typically used to correct Present → Absent or vice-versa.
   */
  updateAttendance: async (id, data) => {
    // Reject future date updates
    if (data.date && data.date > todayStr()) {
      throw new AppError('Cannot set attendance date to a future date.', HTTP_STATUS.BAD_REQUEST);
    }

    const record = await attendanceRepo.findById(id);
    if (!record) throw new AppError('Attendance record not found.', HTTP_STATUS.NOT_FOUND);

    const updated = await attendanceRepo.updateById(id, {
      ...(data.status  && { status:  data.status }),
      ...(data.remarks !== undefined && { remarks: data.remarks }),
    });

    return updated;
  },
};

module.exports = attendanceService;
