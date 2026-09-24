/**
 * Attendance Controller
 * Thin HTTP layer — delegates to attendanceService.
 */

const attendanceService = require('../services/attendance.service');
const { sendSuccess }   = require('../utils/apiResponse');
const HTTP_STATUS       = require('../constants/httpStatus');

const attendanceController = {
  /**
   * GET /api/attendance
   * Query: classId, date, startDate, endDate, status, page, limit
   */
  getAttendance: async (req, res, next) => {
    try {
      const result = await attendanceService.getAttendance(req.query);
      return sendSuccess(
        res,
        HTTP_STATUS.OK,
        'Attendance records fetched successfully',
        result.records,
        { total: result.total, page: result.page, limit: result.limit }
      );
    } catch (err) {
      return next(err);
    }
  },

  /**
   * GET /api/attendance/class/:classId/date/:date
   * Full attendance sheet for a class on a date.
   */
  getByClassAndDate: async (req, res, next) => {
    try {
      const result = await attendanceService.getAttendanceByClassAndDate(
        req.params.classId,
        req.params.date
      );
      return sendSuccess(res, HTTP_STATUS.OK, 'Attendance sheet fetched successfully', result);
    } catch (err) {
      return next(err);
    }
  },

  /**
   * GET /api/attendance/student/:studentId
   * Attendance history for a student.
   * Query: startDate, endDate, status, page, limit
   */
  getStudentAttendance: async (req, res, next) => {
    try {
      const result = await attendanceService.getStudentAttendance(
        req.params.studentId,
        req.query
      );
      return sendSuccess(
        res,
        HTTP_STATUS.OK,
        'Student attendance fetched successfully',
        result,
        { total: result.total, page: result.page, limit: result.limit }
      );
    } catch (err) {
      return next(err);
    }
  },

  /**
   * POST /api/attendance
   * Mark attendance for a single student.
   * Body: { studentId, classId, date, status, remarks }
   */
  markAttendance: async (req, res, next) => {
    try {
      const record = await attendanceService.markAttendance(req.body);
      return sendSuccess(res, HTTP_STATUS.CREATED, 'Attendance marked successfully', record);
    } catch (err) {
      return next(err);
    }
  },

  /**
   * POST /api/attendance/bulk
   * Bulk mark attendance for a whole class.
   * Body: { classId, date, entries: [{ studentId, status, remarks }] }
   */
  bulkMarkAttendance: async (req, res, next) => {
    try {
      const { classId, date, entries } = req.body;
      const result = await attendanceService.bulkMarkAttendance(classId, date, entries);
      return sendSuccess(res, HTTP_STATUS.OK, 'Bulk attendance saved successfully', result);
    } catch (err) {
      return next(err);
    }
  },

  /**
   * PUT /api/attendance/:id
   * Update an existing attendance record.
   * Body: { status, remarks }
   */
  updateAttendance: async (req, res, next) => {
    try {
      const record = await attendanceService.updateAttendance(req.params.id, req.body);
      return sendSuccess(res, HTTP_STATUS.OK, 'Attendance updated successfully', record);
    } catch (err) {
      return next(err);
    }
  },
};

module.exports = attendanceController;
