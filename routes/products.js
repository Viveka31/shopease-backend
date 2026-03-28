const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// @GET /api/products — public, with search/filter
router.get('/', async (req, res) => {
  try {
    const {
      keyword, category, minPrice, maxPrice, rating,
      sort = '-createdAt', page = 1, limit = 12, seller,
    } = req.query;

    const query = { isActive: true };

    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { tags: { $in: [new RegExp(keyword, 'i')] } },
      ];
    }
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (rating) query.rating = { $gte: Number(rating) };
    if (seller) query.seller = seller;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('seller', 'name')
      .sort(sort)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      count: products.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      products,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// @GET /api/products/stats — public, homepage counters
router.get('/stats', async (req, res) => {
  try {
    const User = require('../models/User');
    const [totalProducts, totalCustomers, brands, sellers] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'buyer' }),
      Product.distinct('brand', { isActive: true, brand: { $ne: '' } }),
      Product.distinct('seller'),
    ]);
    res.json({
      success: true,
      products: totalProducts,
      customers: totalCustomers,
      brands: brands.length,
      sellers: sellers.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/products/featured
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true, isActive: true })
      .populate('seller', 'name')
      .limit(8);
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name email')
      .populate('reviews.user', 'name avatar');

    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/products — seller only
router.post('/', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    const product = await Product.create({ ...req.body, seller: req.user.id });
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @PUT /api/products/:id — seller only
router.put('/:id', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @DELETE /api/products/:id — seller only
router.delete('/:id', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Product removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
