const express = require('express');
const router = express.Router();
const { getCategories, createCategory } = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(getCategories)
  .post(protect, authorize('admin', 'manager', 'owner', 'employee'), createCategory);

module.exports = router;
