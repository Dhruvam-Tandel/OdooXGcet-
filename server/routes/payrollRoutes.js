const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/admin/payrollController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/my', payrollController.getMyPayroll);
router.post('/generate', payrollController.generatePayroll); // Admin only
router.put('/structure', payrollController.updateSalaryStructure); // Admin only

module.exports = router;
