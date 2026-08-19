const express = require('express');
const router = express.Router();
const { getReservations, createReservation } = require('../controllers/reservationController');

router.route('/')
  .get(getReservations)
  .post(createReservation);

module.exports = router;
