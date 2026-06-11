const express = require('express');
const router = express.Router();
const {
  createOrderCheckout,
  verifyOrderPayment,
  getMyOrders,
  cancelOrder
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createOrderCheckout);
router.post('/verify', verifyOrderPayment);
router.get('/my-orders', getMyOrders);
router.put('/:id/cancel', cancelOrder);

module.exports = router;
