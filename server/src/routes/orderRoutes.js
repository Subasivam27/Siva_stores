const express = require('express');
const router = express.Router();
const {
  createOnlineOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  deleteOrder
} = require('../controllers/orderController');

router.post('/', createOnlineOrder);
router.get('/', getAllOrders);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', updateOrderStatus);
router.put('/:id/cancel', cancelOrder);
router.delete('/:id', deleteOrder);

module.exports = router;
