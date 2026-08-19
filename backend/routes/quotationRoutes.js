const express = require('express');
const router = express.Router();
const { getQuotations, createQuotation } = require('../controllers/quotationController');

router.route('/')
  .get(getQuotations)
  .post(createQuotation);

module.exports = router;
