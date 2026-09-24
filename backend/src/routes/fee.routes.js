/**
 * Fee Routes
 *
 * GET    /api/fees             – all fee structures (with enrolled counts)
 * GET    /api/fees/pending     – students with pending fees
 * GET    /api/fees/:id         – single fee structure
 * POST   /api/fees             – create fee structure
 * PUT    /api/fees/:id         – update fee structure
 * DELETE /api/fees/:id         – soft delete fee structure
 *
 * All routes require a valid JWT.
 */

const { Router } = require('express');
const feeController = require('../controllers/fee.controller');
const {
  createFeeValidator,
  updateFeeValidator,
  idParamValidator,
  listFeeValidator,
  pendingFeeValidator,
} = require('../validators/fee.validator');
const { protect } = require('../middleware/authMiddleware');

const router = Router();

router.use(protect);

// Static sub-routes BEFORE /:id
router.get('/pending', pendingFeeValidator,  feeController.getPendingFees);

router.get('/',        listFeeValidator,     feeController.getFeeStructures);
router.get('/:id',     idParamValidator,     feeController.getFeeById);
router.post('/',       createFeeValidator,   feeController.createFeeStructure);
router.put('/:id',     updateFeeValidator,   feeController.updateFeeStructure);
router.delete('/:id',  idParamValidator,     feeController.deleteFeeStructure);

module.exports = router;
