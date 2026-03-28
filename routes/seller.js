const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');

// @GET /api/seller/dashboard
router.get('/dashboard', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    const sellerId = req.user.id;

    const [totalProducts, activeProducts, orders] = await Promise.all([
      Product.countDocuments({ seller: sellerId }),
      Product.countDocuments({ seller: sellerId, isActive: true }),
      Order.find({ 'items.seller': sellerId }),
    ]);

    const totalRevenue = orders
      .filter((o) => o.isPaid)
      .reduce((acc, o) => {
        const sellerItems = o.items.filter((i) => i.seller?.toString() === sellerId);
        return acc + sellerItems.reduce((s, i) => s + i.price * i.quantity, 0);
      }, 0);

    const pendingOrders = orders.filter((o) => o.orderStatus === 'pending').length;
    const completedOrders = orders.filter((o) => o.orderStatus === 'delivered').length;

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentOrders = await Order.find({
      'items.seller': sellerId,
      createdAt: { $gte: sixMonthsAgo },
    })
      .sort('-createdAt')
      .limit(10)
      .populate('buyer', 'name email');

    res.json({
      success: true,
      stats: {
        totalProducts,
        activeProducts,
        totalOrders: orders.length,
        pendingOrders,
        completedOrders,
        totalRevenue,
      },
      recentOrders,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/seller/products
router.get('/products', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { seller: req.user.id };
    if (search) query.name = { $regex: search, $options: 'i' };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, products, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/seller/orders
router.get('/orders', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { 'items.seller': req.user.id };
    if (status) query.orderStatus = status;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('buyer', 'name email phone');

    res.json({ success: true, orders, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
