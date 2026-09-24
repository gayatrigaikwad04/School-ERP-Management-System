/**
 * Root API router.
 * Mounts every module router under /api.
 * Routes are uncommented as each phase is completed.
 */

const { Router } = require('express');

const authRoutes       = require('./auth.routes');
const classRoutes      = require('./class.routes');
const parentRoutes     = require('./parent.routes');
const studentRoutes    = require('./student.routes');
const attendanceRoutes = require('./attendance.routes');
const feeRoutes        = require('./fee.routes');
const paymentRoutes    = require('./payment.routes');
const dashboardRoutes  = require('./dashboard.routes');
const reportRoutes     = require('./report.routes');
const settingsRoutes   = require('./settings.routes');

const router = Router();

router.use('/auth',       authRoutes);
router.use('/classes',    classRoutes);
router.use('/parents',    parentRoutes);
router.use('/students',   studentRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/fees',       feeRoutes);
router.use('/payments',   paymentRoutes);
router.use('/dashboard',  dashboardRoutes);
router.use('/reports',    reportRoutes);
router.use('/settings',   settingsRoutes);

module.exports = router;
