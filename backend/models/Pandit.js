const mongoose = require('mongoose');

const panditSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true }, // Cached name for quick queries
  specialization: [{ type: String, required: true }],
  experience: { type: Number, required: true },
  city: { type: String, required: true },
  image: { type: String, default: '' },
  verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  kycDoc: { type: String, default: '' }, // Path or link to uploaded file
  availability: [{
    date: { type: String, required: true }, // Format YYYY-MM-DD
    slots: [{ type: String }] // e.g. ['09:00 AM', '12:00 PM', '04:00 PM']
  }],
  rating: { type: Number, default: 5 },
  reviewsCount: { type: Number, default: 0 },
  earnings: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pandit', panditSchema);
