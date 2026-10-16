const express = require('express');
const router = express.Router();
const { getDashboardMetrics, getGstReport } = require('../controllers/reportController');

router.get('/dashboard', getDashboardMetrics);
router.get('/gst', getGstReport);

module.exports = router;
