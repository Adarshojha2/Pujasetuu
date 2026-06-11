const Booking = require('../models/Booking');
const Pandit = require('../models/Pandit');
const razorpayInstance = require('../config/razorpay');
const crypto = require('crypto');

// @desc    Create a booking and generate Razorpay Order
// @route   POST /api/bookings
// @access  Private
exports.createBookingCheckout = async (req, res) => {
  try {
    const { panditId, pujaType, date, time, address, totalAmount, paymentMethod } = req.body;

    // 1. Fetch Pandit and check availability
    const pandit = await Pandit.findById(panditId);
    if (!pandit) {
      return res.status(404).json({ message: 'Pandit not found' });
    }

    if (pandit.verificationStatus !== 'verified') {
      return res.status(400).json({ message: 'Pandit is not verified yet to accept bookings' });
    }

    // Check availability slot
    const dateAvailability = pandit.availability.find((a) => a.date === date);
    if (!dateAvailability || !dateAvailability.slots.includes(time)) {
      return res.status(400).json({ message: 'Selected time slot is not available for this Pandit' });
    }

    // Support Pay Cash (Offline)
    if (paymentMethod === 'cash') {
      const booking = new Booking({
        userId: req.user._id,
        panditId: pandit._id,
        pujaType,
        date,
        time,
        address,
        totalAmount,
        status: 'confirmed', // Immediately confirmed
        paymentStatus: 'pending',
        razorpayOrderId: `cash_${Date.now()}`
      });

      await booking.save();

      // Remove slot from Pandit's availability calendar
      pandit.availability = pandit.availability.map((avail) => {
        if (avail.date === date) {
          avail.slots = avail.slots.filter((s) => s !== time);
        }
        return avail;
      }).filter(a => a.slots.length > 0);

      await pandit.save();

      return res.status(201).json({
        booking,
        isCash: true
      });
    }

    let razorpayOrderId = `order_mock_${Date.now()}`;
    let isMock = true;

    // 2. Try to generate Razorpay order if key is not dummy
    if (razorpayInstance && process.env.RAZORPAY_KEY_ID && !process.env.RAZORPAY_KEY_ID.includes('dummy')) {
      try {
        const options = {
          amount: Math.round(Number(totalAmount) * 100), // in paise
          currency: 'INR',
          receipt: `receipt_bk_${Date.now()}`
        };
        const order = await razorpayInstance.orders.create(options);
        razorpayOrderId = order.id;
        isMock = false;
      } catch (err) {
        console.warn('Razorpay live order generation failed, falling back to mock mode: ', err.message);
      }
    }

    // 3. Create Booking in DB with pending payment status
    const booking = new Booking({
      userId: req.user._id,
      panditId: pandit._id,
      pujaType,
      date,
      time,
      address,
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
      razorpayOrderId
    });

    await booking.save();

    res.status(201).json({
      booking,
      isMock,
      razorpayKeyId: isMock ? 'rzp_test_dummykey123' : process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Razorpay Booking Payment
// @route   POST /api/bookings/verify
// @access  Private
exports.verifyBookingPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const booking = await Booking.findOne({ razorpayOrderId });
    if (!booking) {
      return res.status(404).json({ message: 'Booking reference not found' });
    }

    // Check if it was a simulated mock order or if keys are dummy
    const isDummyKey = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('dummy');
    const isMockOrder = razorpayOrderId.startsWith('order_mock_');

    if (isDummyKey || isMockOrder) {
      // Simulation mode payment verification
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      booking.razorpayPaymentId = razorpayPaymentId || `pay_mock_${Date.now()}`;
      
      // Remove slot from Pandit's availability calendar since it's booked
      const pandit = await Pandit.findById(booking.panditId);
      if (pandit) {
        pandit.availability = pandit.availability.map((avail) => {
          if (avail.date === booking.date) {
            avail.slots = avail.slots.filter((s) => s !== booking.time);
          }
          return avail;
        });
        await pandit.save();
      }

      await booking.save();
      return res.json({ success: true, message: 'Simulated payment verified successfully', booking });
    }

    // Live Signature verification
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpayOrderId + "|" + razorpayPaymentId);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature === razorpaySignature) {
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      booking.razorpayPaymentId = razorpayPaymentId;

      // Remove slot from Pandit's availability
      const pandit = await Pandit.findById(booking.panditId);
      if (pandit) {
        pandit.availability = pandit.availability.map((avail) => {
          if (avail.date === booking.date) {
            avail.slots = avail.slots.filter((s) => s !== booking.time);
          }
          return avail;
        });
        await pandit.save();
      }

      await booking.save();
      res.json({ success: true, message: 'Payment verified successfully', booking });
    } else {
      booking.paymentStatus = 'failed';
      await booking.save();
      res.status(400).json({ success: false, message: 'Payment signature verification failed' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in user bookings history
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('panditId', 'name specialization experience city image rating')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user._id });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({ message: `Cannot cancel booking with status: ${booking.status}` });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Restore Pandit slot
    const pandit = await Pandit.findById(booking.panditId);
    if (pandit) {
      let dateAvail = pandit.availability.find((a) => a.date === booking.date);
      if (dateAvail) {
        if (!dateAvail.slots.includes(booking.time)) {
          dateAvail.slots.push(booking.time);
        }
      } else {
        pandit.availability.push({
          date: booking.date,
          slots: [booking.time]
        });
      }
      await pandit.save();
    }

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
