const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// @GET /api/cart
router.get('/', protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product', 'name images price stock isActive');
    if (!cart) cart = await Cart.create({ user: req.user.id, items: [] });

    const totalPrice = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);

    res.json({ success: true, cart, totalPrice, totalItems });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/cart — add item
router.post('/', protect, async (req, res) => {
  try {
    const { productId, quantity = 1, size, color } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) cart = new Cart({ user: req.user.id, items: [] });

    const existingIdx = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.size === size && item.color === color
    );

    const price = product.discountPrice > 0 ? product.discountPrice : product.price;

    if (existingIdx > -1) {
      cart.items[existingIdx].quantity += quantity;
      cart.items[existingIdx].price = price;
    } else {
      cart.items.push({ product: productId, quantity, size, color, price });
    }

    await cart.save();
    await cart.populate('items.product', 'name images price stock');

    const totalPrice = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    res.json({ success: true, cart, totalPrice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/cart/:itemId — update quantity
router.put('/:itemId', protect, async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    if (quantity <= 0) {
      cart.items.pull(req.params.itemId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    await cart.populate('items.product', 'name images price stock');

    const totalPrice = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    res.json({ success: true, cart, totalPrice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @DELETE /api/cart/:itemId — remove item
router.delete('/:itemId', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.items.pull(req.params.itemId);
    await cart.save();

    const totalPrice = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    res.json({ success: true, cart, totalPrice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @DELETE /api/cart — clear cart
router.delete('/', protect, async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
