/**
 * Class Routes
 *
 * GET    /api/classes             – list with pagination + filters
 * GET    /api/classes/all-active  – all active classes (dropdown)
 * GET    /api/classes/:id         – single class
 * POST   /api/classes             – create
 * PUT    /api/classes/:id         – update
 * DELETE /api/classes/:id         – soft delete
 *
 * All routes require a valid JWT (protect middleware).
 */

const { Router } = require('express');
const classController = require('../controllers/class.controller');
const {
  createClassValidator,
  updateClassValidator,
  idParamValidator,
  listClassValidator,
} = require('../validators/class.validator');
const { protect } = require('../middleware/authMiddleware');

const router = Router();

// Protect all class routes
router.use(protect);

router.get('/',            listClassValidator,    classController.getClasses);
router.get('/all-active',                         classController.getAllActiveClasses);
router.get('/:id',         idParamValidator,      classController.getClassById);
router.post('/',           createClassValidator,  classController.createClass);
router.put('/:id',         updateClassValidator,  classController.updateClass);
router.delete('/:id',      idParamValidator,      classController.deleteClass);

module.exports = router;
