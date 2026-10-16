const express = require('express');
const router = express.Router();
const { getInventoryTransactions, adjustStock } = require('../controllers/inventoryController');

router.get('/transactions', getInventoryTransactions);
router.post('/adjust', adjustStock);

module.exports = router;
