/**
 * Student Controller
 * Thin HTTP layer — delegates to studentService.
 */

const studentService  = require('../services/student.service');
const { sendSuccess } = require('../utils/apiResponse');
const HTTP_STATUS     = require('../constants/httpStatus');

const studentController = {
  /**
   * GET /api/students
   * Query: search, classId, status, gender, page, limit
   */
  getStudents: async (req, res, next) => {
    try {
      const result = await studentService.getStudents(req.query);
      return sendSuccess(
        res,
        HTTP_STATUS.OK,
        'Students fetched successfully',
        result.students,
        { total: result.total, page: result.page, limit: result.limit }
      );
    } catch (err) {
      return next(err);
    }
  },

  /**
   * GET /api/students/by-class/:classId
   * All active students in a class — for attendance marking.
   */
  getStudentsByClass: async (req, res, next) => {
    try {
      const students = await studentService.getActiveStudentsByClass(req.params.classId);
      return sendSuccess(res, HTTP_STATUS.OK, 'Students fetched successfully', students);
    } catch (err) {
      return next(err);
    }
  },

  /**
   * GET /api/students/:id
   */
  getStudentById: async (req, res, next) => {
    try {
      const student = await studentService.getStudentById(req.params.id);
      return sendSuccess(res, HTTP_STATUS.OK, 'Student fetched successfully', student);
    } catch (err) {
      return next(err);
    }
  },

  /**
   * POST /api/students
   */
  createStudent: async (req, res, next) => {
    try {
      const student = await studentService.createStudent(req.body);
      return sendSuccess(res, HTTP_STATUS.CREATED, 'Student created successfully', student);
    } catch (err) {
      return next(err);
    }
  },

  /**
   * PUT /api/students/:id
   */
  updateStudent: async (req, res, next) => {
    try {
      const student = await studentService.updateStudent(req.params.id, req.body);
      return sendSuccess(res, HTTP_STATUS.OK, 'Student updated successfully', student);
    } catch (err) {
      return next(err);
    }
  },

  /**
   * DELETE /api/students/:id  (soft delete / deactivate)
   */
  deleteStudent: async (req, res, next) => {
    try {
      await studentService.deleteStudent(req.params.id);
      return sendSuccess(res, HTTP_STATUS.OK, 'Student deactivated successfully');
    } catch (err) {
      return next(err);
    }
  },

  /**
   * PATCH /api/students/:id/toggle-status
   * Toggle Active ↔ Inactive.
   */
  toggleStatus: async (req, res, next) => {
    try {
      const student = await studentService.toggleStudentStatus(req.params.id);
      return sendSuccess(
        res,
        HTTP_STATUS.OK,
        `Student status changed to ${student.status}`,
        student
      );
    } catch (err) {
      return next(err);
    }
  },
};

module.exports = studentController;
