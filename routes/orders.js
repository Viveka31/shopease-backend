const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');
const { sendEmail, emailTemplates } = require('../utils/email');

// @POST /api/orders — create order
router.post('/', protect, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, notes } = req.body;

    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Build order items
    const items = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      image: item.product.images[0] || '',
      price: item.price,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      seller: item.product.seller,
    }));

    const itemsPrice = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const shippingPrice = itemsPrice > 999 ? 0 : 99;
    const taxPrice = Math.round(itemsPrice * 0.18 * 100) / 100;
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    const order = await Order.create({
      buyer: req.user.id,
      items,
      shippingAddress,
      paymentMethod: paymentMethod || 'stripe',
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      notes,
    });

    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity, sold: item.quantity },
      });
    }

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });

    // Send confirmation email
    try {
      const { subject, html } = emailTemplates.orderConfirmation(order, req.user.name);
      await sendEmail({ to: req.user.email, subject, html });
    } catch (e) {
      console.error('Order email failed:', e.message);
    }

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/orders/myorders — buyer's orders
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id })
      .sort('-createdAt')
      .populate('items.product', 'name images');
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/orders/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name email')
      .populate('items.product', 'name images');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.buyer._id.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'seller') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/orders/:id/status — seller/admin update status
router.put('/:id/status', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    const { orderStatus, trackingNumber } = req.body;
    const update = { orderStatus };
    if (trackingNumber) update.trackingNumber = trackingNumber;
    if (orderStatus === 'delivered') update.deliveredAt = Date.now();

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/orders — admin/seller get all orders
router.get('/', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.orderStatus = status;

    // Sellers see only their products' orders
    if (req.user.role === 'seller') {
      query['items.seller'] = req.user.id;
    }

    const orders = await Order.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('buyer', 'name email');

    const total = await Order.countDocuments(query);
    res.json({ success: true, orders, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
