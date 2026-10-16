const express = require('express');
const router = express.Router();
const {
  getSuppliers,
  createSupplier,
  getPurchaseOrders,
  createPurchaseOrder,
  receivePurchaseOrder
} = require('../controllers/supplierController');

router.get('/', getSuppliers);
router.post('/', createSupplier);
router.get('/purchases', getPurchaseOrders);
router.post('/purchases', createPurchaseOrder);
router.put('/purchases/:id/receive', receivePurchaseOrder);

module.exports = router;
