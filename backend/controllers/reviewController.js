const Review = require('../models/Review');
const Tool = require('../models/Tool');

// @desc Create new review for a tool
// @route POST /api/reviews
const createReview = async (req, res) => {
  try {
    const { toolId, rating, comment, equipmentCondition } = req.body;

    if (!toolId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Please provide tool ID, rating, and comment' });
    }

    const review = await Review.create({
      tool: toolId,
      user: req.user._id,
      userName: req.user.name,
      rating: Number(rating),
      comment,
      equipmentCondition: equipmentCondition || 'Excellent'
    });

    // Update average rating on tool if model supports
    const reviews = await Review.find({ tool: toolId });
    const avg = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    await Tool.findByIdAndUpdate(toolId, { rating: Math.round(avg * 10) / 10 });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been submitted.',
      review
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get reviews for a specific tool
// @route GET /api/reviews/tool/:toolId
const getToolReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ tool: req.params.toolId }).sort({ createdAt: -1 });
    const avgRating = reviews.length > 0
      ? (reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length).toFixed(1)
      : 5.0;

    res.status(200).json({
      success: true,
      count: reviews.length,
      avgRating: Number(avgRating),
      reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createReview, getToolReviews };
