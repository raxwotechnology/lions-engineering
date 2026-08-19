const express = require('express');
const router = express.Router();
const { getFinancialReport } = require('../controllers/reportController');

router.get('/financial', getFinancialReport);

module.exports = router;
