const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const razorpayInstance = require('../config/razorpay');
const crypto = require('crypto');

// @desc    Create Order checkout and generate Razorpay Order
// @route   POST /api/orders
// @access  Private
exports.createOrderCheckout = async (req, res) => {
  try {
    const { products, shippingAddress, couponCode, paymentMethod } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: 'No products in order list' });
    }

    let totalAmount = 0;
    const checkoutProducts = [];

    // 1. Verify products stock and calculate price from DB
    for (const item of products) {
      const dbProduct = await Product.findById(item.productId);
      if (!dbProduct) {
        return res.status(404).json({ message: `Product ${item.name || item.productId} not found` });
      }

      if (dbProduct.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product: ${dbProduct.name}` });
      }

      const itemCost = dbProduct.price * item.quantity;
      totalAmount += itemCost;

      checkoutProducts.push({
        productId: dbProduct._id,
        name: dbProduct.name,
        quantity: item.quantity,
        price: dbProduct.price
      });
    }

    // 2. Apply Coupon discounts
    let discountAmount = 0;
    if (couponCode) {
      const code = couponCode.trim().toUpperCase();
      if (code === 'FESTIVAL10' || code === 'SAN123') {
        discountAmount = Math.round(totalAmount * 0.1); // 10% discount
      } else if (code === 'SETU20') {
        discountAmount = Math.round(totalAmount * 0.2); // 20% discount
      }
    }

    const netAmount = Math.max(0, totalAmount - discountAmount);

    // Support Cash on Delivery (COD)
    if (paymentMethod === 'cod') {
      const order = new Order({
        userId: req.user._id,
        products: checkoutProducts,
        totalAmount: netAmount,
        discountAmount,
        shippingAddress,
        paymentStatus: 'pending',
        orderStatus: 'processing',
        razorpayOrderId: `cod_${Date.now()}`
      });

      await order.save();

      // Deduct stock levels immediately
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity }
        });
      }

      // Clear the user's cart immediately
      await Cart.findOneAndUpdate({ userId: req.user._id }, { products: [] });

      return res.status(201).json({
        order,
        isCod: true
      });
    }

    let razorpayOrderId = `order_mock_${Date.now()}`;
    let isMock = true;

    // 3. Generate Razorpay order if key is not dummy
    if (razorpayInstance && process.env.RAZORPAY_KEY_ID && !process.env.RAZORPAY_KEY_ID.includes('dummy')) {
      try {
        const options = {
          amount: Math.round(netAmount * 100), // in paise
          currency: 'INR',
          receipt: `receipt_ord_${Date.now()}`
        };
        const order = await razorpayInstance.orders.create(options);
        razorpayOrderId = order.id;
        isMock = false;
      } catch (err) {
        console.warn('Razorpay order creation failed, falling back to mock mode: ', err.message);
      }
    }

    // 4. Create Order with pending status
    const order = new Order({
      userId: req.user._id,
      products: checkoutProducts,
      totalAmount: netAmount,
      discountAmount,
      shippingAddress,
      paymentStatus: 'pending',
      orderStatus: 'processing',
      razorpayOrderId
    });

    await order.save();

    res.status(201).json({
      order,
      isMock,
      razorpayKeyId: isMock ? 'rzp_test_dummykey123' : process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Razorpay Order Payment
// @route   POST /api/orders/verify
// @access  Private
exports.verifyOrderPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const order = await Order.findOne({ razorpayOrderId });
    if (!order) {
      return res.status(404).json({ message: 'Order reference not found' });
    }

    const isDummyKey = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('dummy');
    const isMockOrder = razorpayOrderId.startsWith('order_mock_');

    const executePostPaymentSuccess = async () => {
      order.paymentStatus = 'paid';
      order.razorpayPaymentId = razorpayPaymentId || `pay_mock_${Date.now()}`;
      await order.save();

      // Deduct Stock levels
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity }
        });
      }

      // Clear the user's cart on successful checkout payment
      await Cart.findOneAndUpdate({ userId: order.userId }, { products: [] });
    };

    if (isDummyKey || isMockOrder) {
      await executePostPaymentSuccess();
      return res.json({ success: true, message: 'Simulated order payment verified successfully', order });
    }

    // Live Signature verification
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpayOrderId + "|" + razorpayPaymentId);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature === razorpaySignature) {
      await executePostPaymentSuccess();
      res.json({ success: true, message: 'Order payment verified successfully', order });
    } else {
      order.paymentStatus = 'failed';
      await order.save();
      res.status(400).json({ success: false, message: 'Payment signature verification failed' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in user's order history
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel an order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.orderStatus !== 'processing') {
      return res.status(400).json({ message: `Cannot cancel order with status: ${order.orderStatus}` });
    }

    order.orderStatus = 'cancelled';
    await order.save();

    // Restore stock levels
    if (order.paymentStatus === 'paid') {
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity }
        });
      }
    }

    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
