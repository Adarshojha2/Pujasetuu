const User = require('../models/User');
const Pandit = require('../models/Pandit');
const Product = require('../models/Product');
const Booking = require('../models/Booking');
const Order = require('../models/Order');

// @desc    Get dashboard metrics, analytics charts and reports
// @route   GET /api/admin/dashboard
// @access  Private (Admin role)
exports.getAnalyticsDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalPandits = await User.countDocuments({ role: 'pandit' });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalBookings = await Booking.countDocuments();

    // Calculate Paid Revenue
    const paidOrders = await Order.find({ paymentStatus: 'paid' });
    const paidBookings = await Booking.find({ paymentStatus: 'paid' });

    const productSalesRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const bookingTotalRevenue = paidBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    
    // Platform commission is 20% of booking revenue + 100% of product sales
    const platformCommission = bookingTotalRevenue * 0.2;
    const totalRevenue = productSalesRevenue + platformCommission;

    // Inventory warning
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } }).select('name stock price category');

    // Recent orders
    const recentOrders = await Order.find({})
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent bookings
    const recentBookings = await Booking.find({})
      .populate('userId', 'name email')
      .populate('panditId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Sales by Category
    const categoriesSales = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $unwind: '$products' },
      {
        $lookup: {
          from: 'products',
          localField: 'products.productId',
          foreignField: '_id',
          as: 'prodDetails'
        }
      },
      { $unwind: '$prodDetails' },
      {
        $group: {
          _id: '$prodDetails.category',
          totalSold: { $sum: '$products.quantity' },
          totalRevenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } }
        }
      }
    ]);

    res.json({
      metrics: {
        totalUsers,
        totalPandits,
        totalProducts,
        totalOrders,
        totalBookings,
        productSalesRevenue,
        bookingTotalRevenue,
        platformCommission,
        totalRevenue
      },
      lowStockProducts,
      recentOrders,
      recentBookings,
      categoriesSales
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pending Pandit KYC applications
// @route   GET /api/admin/pandits/pending-kyc
// @access  Private (Admin role)
exports.getKYCPendingPandits = async (req, res) => {
  try {
    const pendits = await Pandit.find({ verificationStatus: 'pending' }).populate('userId', 'name email phone');
    res.json(pendits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve/Reject Pandit KYC status
// @route   PUT /api/admin/pandits/:id/verify
// @access  Private (Admin role)
exports.verifyPanditKYC = async (req, res) => {
  try {
    const { status } = req.body; // 'verified' or 'rejected'
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid verification status' });
    }

    const pandit = await Pandit.findById(req.params.id);
    if (!pandit) {
      return res.status(404).json({ message: 'Pandit not found' });
    }

    pandit.verificationStatus = status;
    await pandit.save();

    res.json({ message: `Pandit status updated to ${status}`, pandit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Fetch all users
// @route   GET /api/admin/users
// @access  Private (Admin role)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Create new product
// @route   POST /api/admin/products
// @access  Private (Admin role)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, category, price, stock, image } = req.body;

    const product = new Product({
      name,
      description,
      category,
      price,
      stock,
      image: image || 'https://images.unsplash.com/photo-1609137144813-911d087b32d2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Update product details / inventory
// @route   PUT /api/admin/products/:id
// @access  Private (Admin role)
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, category, price, stock, image } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.description = description || product.description;
      product.category = category || product.category;
      product.price = price !== undefined ? price : product.price;
      product.stock = stock !== undefined ? stock : product.stock;
      if (image) product.image = image;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private (Admin role)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await Product.findByIdAndDelete(req.params.id);
      res.json({ message: 'Product removed successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Get all marketplace orders
// @route   GET /api/admin/orders
// @access  Private (Admin role)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Update shipping/order status
// @route   PUT /api/admin/orders/:id
// @access  Private (Admin role)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
      order.orderStatus = orderStatus || order.orderStatus;
      order.paymentStatus = paymentStatus || order.paymentStatus;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Get all booking logs
// @route   GET /api/admin/bookings
// @access  Private (Admin role)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('userId', 'name email phone')
      .populate('panditId', 'name city specialization rating')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Update Booking Details
// @route   PUT /api/admin/bookings/:id
// @access  Private (Admin role)
exports.updateBookingDetails = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (booking) {
      booking.status = status || booking.status;
      booking.paymentStatus = paymentStatus || booking.paymentStatus;
      const updatedBooking = await booking.save();
      res.json(updatedBooking);
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
