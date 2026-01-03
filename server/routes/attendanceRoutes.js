const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/employee/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/checkin', authMiddleware, attendanceController.checkIn);
router.post('/checkout', authMiddleware, attendanceController.checkOut);
router.get('/today', authMiddleware, attendanceController.getTodayStatus);
router.get('/my', authMiddleware, attendanceController.getMyAttendance);
router.get('/stats', authMiddleware, attendanceController.getStats);
router.get('/heatmap', authMiddleware, attendanceController.getHeatmapData);
router.get('/employee-status', authMiddleware, attendanceController.getEmployeeStatus);

module.exports = router;
