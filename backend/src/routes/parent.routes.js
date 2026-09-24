/**
 * Parent Routes
 *
 * GET    /api/parents           – paginated list with search
 * GET    /api/parents/list      – lightweight list for dropdowns
 * GET    /api/parents/:id       – single parent
 * POST   /api/parents           – create
 * PUT    /api/parents/:id       – update
 * DELETE /api/parents/:id       – soft delete
 *
 * All routes require a valid JWT.
 */

const { Router } = require('express');
const parentController = require('../controllers/parent.controller');
const {
  createParentValidator,
  updateParentValidator,
  idParamValidator,
  listParentValidator,
} = require('../validators/parent.validator');
const { protect } = require('../middleware/authMiddleware');

const router = Router();

router.use(protect);

// Static sub-routes BEFORE /:id to avoid capture
router.get('/list',  parentController.getAllParentsList);

router.get('/',      listParentValidator,    parentController.getParents);
router.get('/:id',   idParamValidator,       parentController.getParentById);
router.post('/',     createParentValidator,  parentController.createParent);
router.put('/:id',   updateParentValidator,  parentController.updateParent);
router.delete('/:id', idParamValidator,      parentController.deleteParent);

module.exports = router;
