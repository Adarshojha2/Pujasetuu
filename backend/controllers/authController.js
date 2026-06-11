const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper: Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'pujasetu_super_secure_jwt_secret_key_987654321', {
    expiresIn: '30d',
  });
};

// Helper: Generate referral code
const generateReferralCode = (name) => {
  const cleanName = name.replace(/\s+/g, '').toUpperCase().slice(0, 5);
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${cleanName}${randomNum}`;
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role, referredByCode } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    let referredByUser = null;
    if (referredByCode) {
      referredByUser = await User.findOne({ referralCode: referredByCode.trim().toUpperCase() });
    }

    const newUser = new User({
      name,
      email,
      password,
      phone,
      role: role || 'user',
      referralCode: generateReferralCode(name),
      referredBy: referredByUser ? referredByUser._id : undefined
    });

    const user = await newUser.save();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      referralCode: user.referralCode,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        referralCode: user.referralCode,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        referralCode: updatedUser.referralCode,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add address
// @route   POST /api/auth/addresses
// @access  Private
exports.addAddress = async (req, res) => {
  try {
    const { title, street, city, state, zipCode, country } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
      user.savedAddresses.push({ title, street, city, state, zipCode, country });
      const updatedUser = await user.save();
      res.json(updatedUser.savedAddresses);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete address
// @route   DELETE /api/auth/addresses/:id
// @access  Private
exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.savedAddresses = user.savedAddresses.filter(
        (addr) => addr._id.toString() !== req.params.id
      );
      const updatedUser = await user.save();
      res.json(updatedUser.savedAddresses);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Validate referral code
// @route   GET /api/auth/referral/:code
// @access  Public
exports.validateReferral = async (req, res) => {
  try {
    const code = req.params.code.trim().toUpperCase();
    const referrer = await User.findOne({ referralCode: code });
    if (referrer) {
      res.json({ valid: true, referrerName: referrer.name });
    } else {
      res.status(400).json({ valid: false, message: 'Invalid referral code' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
