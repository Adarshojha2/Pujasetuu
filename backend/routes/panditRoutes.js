const express = require('express');
const router = express.Router();
const {
  createPanditProfile,
  getPanditProfile,
  updatePanditProfile,
  getPanditBookings,
  updateBookingStatus,
  getAllPandits
} = require('../controllers/panditController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public route to search pandits
router.get('/', getAllPandits);

// Private Pandit routes
router.route('/profile')
  .post(protect, restrictTo('pandit'), upload.single('kycDoc'), createPanditProfile)
  .get(protect, restrictTo('pandit'), getPanditProfile)
  .put(protect, restrictTo('pandit'), updatePanditProfile);

router.get('/bookings', protect, restrictTo('pandit'), getPanditBookings);
router.put('/bookings/:id', protect, restrictTo('pandit'), updateBookingStatus);

module.exports = router;
