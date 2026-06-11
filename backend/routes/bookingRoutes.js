const express = require('express');
const router = express.Router();
const {
  createBookingCheckout,
  verifyBookingPayment,
  getMyBookings,
  cancelBooking
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createBookingCheckout);
router.post('/verify', verifyBookingPayment);
router.get('/my-bookings', getMyBookings);
router.put('/:id/cancel', cancelBooking);

module.exports = router;
