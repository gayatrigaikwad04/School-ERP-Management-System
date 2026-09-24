/**
 * Student Routes
 *
 * GET    /api/students                       – paginated list with filters
 * GET    /api/students/by-class/:classId     – active students in a class
 * GET    /api/students/:id                   – student detail
 * POST   /api/students                       – create student
 * PUT    /api/students/:id                   – update student
 * DELETE /api/students/:id                   – soft delete
 * PATCH  /api/students/:id/toggle-status     – toggle Active/Inactive
 *
 * All routes require a valid JWT.
 */

const { Router } = require('express');
const studentController = require('../controllers/student.controller');
const {
  createStudentValidator,
  updateStudentValidator,
  idParamValidator,
  classIdParamValidator,
  listStudentValidator,
} = require('../validators/student.validator');
const { protect } = require('../middleware/authMiddleware');

const router = Router();

router.use(protect);

// Static sub-routes BEFORE /:id
router.get('/by-class/:classId', classIdParamValidator,   studentController.getStudentsByClass);

router.get('/',                  listStudentValidator,     studentController.getStudents);
router.get('/:id',               idParamValidator,         studentController.getStudentById);
router.post('/',                 createStudentValidator,   studentController.createStudent);
router.put('/:id',               updateStudentValidator,   studentController.updateStudent);
router.delete('/:id',            idParamValidator,         studentController.deleteStudent);
router.patch('/:id/toggle-status', idParamValidator,       studentController.toggleStatus);

module.exports = router;
