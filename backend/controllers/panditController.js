const Pandit = require('../models/Pandit');
const Booking = require('../models/Booking');

// @desc    Register/Create Pandit profile
// @route   POST /api/pandits/profile
// @access  Private (Pandit role)
exports.createPanditProfile = async (req, res) => {
  try {
    const { specialization, experience, city } = req.body;

    const existingProfile = await Pandit.findOne({ userId: req.user._id });
    if (existingProfile) {
      return res.status(400).json({ message: 'Pandit profile already exists for this user' });
    }

    let kycDocPath = '';
    if (req.file) {
      kycDocPath = `/uploads/${req.file.filename}`;
    }

    // Specialization could come as a JSON string or array
    const specs = Array.isArray(specialization) 
      ? specialization 
      : JSON.parse(specialization || '[]');

    const newPandit = new Pandit({
      userId: req.user._id,
      name: req.user.name,
      specialization: specs,
      experience,
      city,
      kycDoc: kycDocPath,
      verificationStatus: 'pending', // Requires admin verification
      availability: []
    });

    const pandit = await newPandit.save();
    res.status(201).json(pandit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Pandit profile
// @route   GET /api/pandits/profile
// @access  Private (Pandit role)
exports.getPanditProfile = async (req, res) => {
  try {
    const pandit = await Pandit.findOne({ userId: req.user._id });
    if (!pandit) {
      return res.status(404).json({ message: 'Pandit profile not found' });
    }
    res.json(pandit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Pandit profile / availability
// @route   PUT /api/pandits/profile
// @access  Private (Pandit role)
exports.updatePanditProfile = async (req, res) => {
  try {
    const pandit = await Pandit.findOne({ userId: req.user._id });
    if (!pandit) {
      return res.status(404).json({ message: 'Pandit profile not found' });
    }

    pandit.specialization = req.body.specialization || pandit.specialization;
    pandit.experience = req.body.experience !== undefined ? req.body.experience : pandit.experience;
    pandit.city = req.body.city || pandit.city;
    if (req.body.image) pandit.image = req.body.image;
    if (req.body.availability) pandit.availability = req.body.availability;

    const updatedPandit = await pandit.save();
    res.json(updatedPandit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Pandit bookings
// @route   GET /api/pandits/bookings
// @access  Private (Pandit role)
exports.getPanditBookings = async (req, res) => {
  try {
    const pandit = await Pandit.findOne({ userId: req.user._id });
    if (!pandit) {
      return res.status(404).json({ message: 'Pandit profile not found' });
    }

    const bookings = await Booking.find({ panditId: pandit._id })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Pandit booking status (Confirm/Complete/Cancel)
// @route   PUT /api/pandits/bookings/:id
// @access  Private (Pandit role)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const pandit = await Pandit.findOne({ userId: req.user._id });
    if (!pandit) {
      return res.status(404).json({ message: 'Pandit profile not found' });
    }

    const booking = await Booking.findOne({ _id: req.params.id, panditId: pandit._id });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status || booking.status;

    // If booking is completed, update Pandit's earnings (e.g. add the amount)
    if (status === 'completed' && booking.paymentStatus === 'paid' && booking.status !== 'completed') {
      pandit.earnings += booking.totalAmount * 0.8; // 80% to Pandit, 20% platform commission
      await pandit.save();
    }

    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all verified Pandits for booking (Public filter)
// @route   GET /api/pandits
// @access  Public
exports.getAllPandits = async (req, res) => {
  try {
    const { city, specialty } = req.query;
    let query = { verificationStatus: 'verified' };

    if (city) {
      query.city = new RegExp(city, 'i');
    }
    if (specialty) {
      query.specialization = { $in: [specialty] };
    }

    const pandits = await Pandit.find(query).select('name specialization experience city image rating reviewsCount availability');
    res.json(pandits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
