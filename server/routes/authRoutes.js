const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/verify-email', authController.verifyEmail);
router.post('/login', authController.login);
router.post('/create-employee', authMiddleware, authController.createEmployee); // Admin Only
router.get('/me', authMiddleware, authController.getMe);
router.get('/users', authMiddleware, authController.getAllUsers);
const upload = require('../middleware/uploadMiddleware');

router.put('/profile', authMiddleware, upload.single('profileImage'), authController.updateProfile);
router.post('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
