const express = require('express');
const router  = express.Router();
const Product = require('../models/Product');
const Order   = require('../models/Order');
const User    = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// ─── Dashboard ────────────────────────────────────────────────────────────────
// GET /api/seller/dashboard
router.get('/dashboard', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    const sellerId = req.user.id;

    const [totalProducts, activeProducts, allOrders] = await Promise.all([
      Product.countDocuments({ seller: sellerId }),
      Product.countDocuments({ seller: sellerId, isActive: true }),
      Order.find({ 'items.seller': sellerId }).populate('buyer', 'name email'),
    ]);

    // Revenue from paid orders only
    const totalRevenue = allOrders
      .filter(o => o.isPaid)
      .reduce((acc, o) => {
        const mine = o.items.filter(i => i.seller?.toString() === sellerId);
        return acc + mine.reduce((s, i) => s + i.price * i.quantity, 0);
      }, 0);

    const pendingOrders   = allOrders.filter(o => o.orderStatus === 'pending').length;
    const completedOrders = allOrders.filter(o => o.orderStatus === 'delivered').length;

    // ── Monthly sales chart — last 6 months ──────────────────────────────────
    const monthlyMap = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthlyMap[key] = 0;
    }

    allOrders
      .filter(o => o.isPaid)
      .forEach(o => {
        const d   = new Date(o.paidAt || o.createdAt);
        const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
        if (monthlyMap[key] !== undefined) {
          const mine = o.items.filter(i => i.seller?.toString() === sellerId);
          monthlyMap[key] += mine.reduce((s, i) => s + i.price * i.quantity, 0);
        }
      });

    const monthlySales = Object.entries(monthlyMap).map(([month, revenue]) => ({ month, revenue }));

    // ── Top selling products ─────────────────────────────────────────────────
    const topProducts = await Product.find({ seller: sellerId, isActive: true })
      .sort('-sold')
      .limit(5)
      .select('name sold price images');

    // ── Recent 10 orders ─────────────────────────────────────────────────────
    const recentOrders = allOrders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    res.json({
      success: true,
      stats: {
        totalProducts,
        activeProducts,
        totalOrders:    allOrders.length,
        pendingOrders,
        completedOrders,
        totalRevenue,
      },
      monthlySales,
      topProducts,
      recentOrders,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Seller Products ──────────────────────────────────────────────────────────
// GET /api/seller/products
router.get('/products', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { seller: req.user.id };
    if (search) query.name = { $regex: search, $options: 'i' };

    const total    = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, products, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Seller Orders ────────────────────────────────────────────────────────────
// GET /api/seller/orders
router.get('/orders', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { 'items.seller': req.user.id };
    if (status) query.orderStatus = status;

    const total  = await Order.countDocuments(query);
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

// ─── Store Profile ────────────────────────────────────────────────────────────
// GET /api/seller/store-profile
router.get('/store-profile', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    const seller = await User.findById(req.user.id).select('name email phone storeInfo');
    res.json({ success: true, seller });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/seller/store-profile
router.put('/store-profile', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    const { name, phone, storeInfo } = req.body;
    const seller = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, storeInfo },
      { new: true, runValidators: true }
    ).select('name email phone storeInfo');
    res.json({ success: true, seller });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
