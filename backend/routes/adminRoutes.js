const express = require('express');
const router = express.Router();
const {
  getAnalyticsDashboard,
  getKYCPendingPandits,
  verifyPanditKYC,
  getAllUsers,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
  getAllBookings,
  updateBookingDetails
} = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect, restrictTo('admin'));

// Dashboard metrics
router.get('/dashboard', getAnalyticsDashboard);

// Pandit KYC approvals
router.get('/pandits/pending-kyc', getKYCPendingPandits);
router.put('/pandits/:id/verify', verifyPanditKYC);

// Users management
router.get('/users', getAllUsers);

// Products management
router.route('/products')
  .post(createProduct);
router.route('/products/:id')
  .put(updateProduct)
  .delete(deleteProduct);

// Orders logs
router.route('/orders')
  .get(getAllOrders);
router.route('/orders/:id')
  .put(updateOrderStatus);

// Bookings logs
router.route('/bookings')
  .get(getAllBookings);
router.route('/bookings/:id')
  .put(updateBookingDetails);

module.exports = router;
