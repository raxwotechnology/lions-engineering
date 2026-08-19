const express = require('express');
const router = express.Router();
const { getSupportSettings, updateSupportSettings } = require('../controllers/settingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/support', getSupportSettings);
router.put('/support', protect, authorize('admin', 'manager'), updateSupportSettings);

module.exports = router;
