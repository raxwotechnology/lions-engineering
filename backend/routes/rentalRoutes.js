const express = require('express');
const router = express.Router();
const { createRental, getRentals, getRentalById, updateRentalStatus } = require('../controllers/rentalController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createRental)
  .get(protect, getRentals);

router.route('/:id')
  .get(protect, getRentalById);

router.route('/:id/status')
  .put(protect, updateRentalStatus);

module.exports = router;
