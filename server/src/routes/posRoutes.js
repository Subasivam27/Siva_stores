const express = require('express');
const router = express.Router();
const { createPosSale, getPosDaySummary } = require('../controllers/posController');

router.post('/checkout', createPosSale);
router.get('/day-summary', getPosDaySummary);

module.exports = router;
