/**
 * Attendance Routes
 *
 * GET    /api/attendance                              – filtered list
 * GET    /api/attendance/class/:classId/date/:date   – full sheet for class+date
 * GET    /api/attendance/student/:studentId          – student history
 * POST   /api/attendance                             – mark single
 * POST   /api/attendance/bulk                        – bulk mark whole class
 * PUT    /api/attendance/:id                         – update record
 *
 * All routes require a valid JWT.
 */

const { Router } = require('express');
const attendanceController = require('../controllers/attendance.controller');
const {
  markAttendanceValidator,
  bulkMarkAttendanceValidator,
  updateAttendanceValidator,
  classDateParamValidator,
  studentParamValidator,
  listAttendanceValidator,
} = require('../validators/attendance.validator');
const { protect } = require('../middleware/authMiddleware');

const router = Router();

router.use(protect);

// Static / parametrised routes before generic /:id
router.get('/class/:classId/date/:date', classDateParamValidator,      attendanceController.getByClassAndDate);
router.get('/student/:studentId',         studentParamValidator,        attendanceController.getStudentAttendance);
router.post('/bulk',                       bulkMarkAttendanceValidator,  attendanceController.bulkMarkAttendance);

router.get('/',    listAttendanceValidator,    attendanceController.getAttendance);
router.post('/',   markAttendanceValidator,    attendanceController.markAttendance);
router.put('/:id', updateAttendanceValidator,  attendanceController.updateAttendance);

module.exports = router;
