const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: [
      'Diyas', 
      'Dhoop & Agarbatti', 
      'Puja Essentials', 
      'Malas & Rudraksha', 
      'Idols & Murtis', 
      'Puja Kits', 
      'Holy Books', 
      'Decorations & Festivals'
    ]
  },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  image: { type: String, default: '' },
  rating: { type: Number, default: 5 },
  reviewsCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
