const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getOrders, getOrder, createOrder, updateOrder,
  updateOrderStatus, updatePayment, deleteOrder,
  getKitchenOrders, getActiveOrders
} = require('../controllers/orderController');

router.use(protect);

router.get('/', getOrders);
router.get('/kitchen', getKitchenOrders);
router.get('/active', getActiveOrders);
router.get('/:id', getOrder);
router.post('/', createOrder);
router.put('/:id', updateOrder);
router.patch('/:id/status', updateOrderStatus);
router.patch('/:id/payment', updatePayment);
router.delete('/:id', deleteOrder);

module.exports = router;
