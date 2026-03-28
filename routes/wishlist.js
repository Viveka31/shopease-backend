const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @GET /api/wishlist
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist', 'name images price discountPrice rating category');
    res.json({ success: true, wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/wishlist/:productId — toggle
router.post('/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const idx = user.wishlist.indexOf(req.params.productId);

    if (idx > -1) {
      user.wishlist.splice(idx, 1);
      await user.save();
      return res.json({ success: true, message: 'Removed from wishlist', added: false });
    }

    user.wishlist.push(req.params.productId);
    await user.save();
    res.json({ success: true, message: 'Added to wishlist', added: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
