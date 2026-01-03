const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/employee/leaveController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', leaveController.applyLeave);
router.get('/my', leaveController.getMyLeaves);
router.get('/all', leaveController.getAllLeaves); // Should be admin only protected ideally
router.put('/:id', leaveController.updateLeaveStatus); // Should be admin only

module.exports = router;
