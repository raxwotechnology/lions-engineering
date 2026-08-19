const express = require('express');
const router = express.Router();
const { registerUser, loginUser, loginAdmin, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public Auth Endpoints
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/admin/login', loginAdmin);

// Protected Profile Endpoint
router.get('/me', protect, getMe);

module.exports = router;
