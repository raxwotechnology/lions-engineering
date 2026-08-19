const express = require('express');
const router = express.Router();
const { getTools, getToolById, createTool, updateTool, deleteTool } = require('../controllers/toolController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(getTools)
  .post(protect, authorize('owner', 'admin', 'Customer', 'Manager', 'Admin'), createTool);

router.route('/:id')
  .get(getToolById)
  .put(protect, updateTool)
  .delete(protect, deleteTool);

module.exports = router;
