const Cart = require('../models/Cart');

// @desc    Get logged-in user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id }).populate('products.productId');
    if (!cart) {
      cart = new Cart({ userId: req.user._id, products: [] });
      await cart.save();
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add product to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      cart = new Cart({ userId: req.user._id, products: [] });
    }

    // Check if product exists in cart
    const itemIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      // Product exists, update quantity
      cart.products[itemIndex].quantity += Number(quantity || 1);
    } else {
      // Product does not exist, add new item
      cart.products.push({ productId, quantity: Number(quantity || 1) });
    }

    cart.updatedAt = Date.now();
    await cart.save();

    const populatedCart = await Cart.findOne({ userId: req.user._id }).populate('products.productId');
    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update item quantity in cart
// @route   PUT /api/cart
// @access  Private
exports.updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      cart.products[itemIndex].quantity = Number(quantity);
      cart.updatedAt = Date.now();
      await cart.save();
      const populatedCart = await Cart.findOne({ userId: req.user._id }).populate('products.productId');
      return res.json(populatedCart);
    } else {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove product from cart
// @route   DELETE /api/cart/:productId
// @access  Private
exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.products = cart.products.filter(
      (item) => item.productId.toString() !== req.params.productId
    );

    cart.updatedAt = Date.now();
    await cart.save();

    const populatedCart = await Cart.findOne({ userId: req.user._id }).populate('products.productId');
    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (cart) {
      cart.products = [];
      cart.updatedAt = Date.now();
      await cart.save();
    }
    res.json({ message: 'Cart cleared', products: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
