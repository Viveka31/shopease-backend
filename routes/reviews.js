const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// @POST /api/reviews/:productId
router.post('/:productId', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const alreadyReviewed = product.reviews.find((r) => r.user.toString() === req.user.id);
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'Already reviewed this product' });
    }

    const review = {
      user: req.user.id,
      name: req.user.name,
      rating: Number(req.body.rating),
      comment: req.body.comment,
    };

    product.reviews.push(review);
    product.updateRating();
    await product.save();

    res.status(201).json({ success: true, message: 'Review added' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @DELETE /api/reviews/:productId/:reviewId
router.delete('/:productId/:reviewId', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const review = product.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    product.reviews.pull(req.params.reviewId);
    product.updateRating();
    await product.save();

    res.json({ success: true, message: 'Review removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
