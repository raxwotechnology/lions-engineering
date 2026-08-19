const express = require('express');
const router = express.Router();
const { updateUserProfile, getCustomers, getCustomerById } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.put('/profile', protect, updateUserProfile);
router.get('/customers', protect, authorize('admin', 'manager'), getCustomers);
router.get('/customer/:id', protect, getCustomerById);

module.exports = router;
