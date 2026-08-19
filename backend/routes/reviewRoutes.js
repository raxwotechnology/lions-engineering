const express = require('express');
const router = express.Router();
const { createReview, getToolReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createReview);
router.get('/tool/:toolId', getToolReviews);

module.exports = router;
