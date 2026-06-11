const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true }, // Cached name for speed
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
  panditId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pandit', default: null },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', reviewSchema);
