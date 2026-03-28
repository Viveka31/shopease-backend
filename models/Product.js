const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    description: { type: String, required: [true, 'Description is required'] },
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    discountPrice: { type: Number, default: 0 },
    category: {
      type: String,
      required: true,
      enum: ["Men's Clothing", "Women's Clothing", "Kids' Clothing", 'Accessories', 'Footwear', 'Activewear'],
    },
    subCategory: { type: String, default: '' },
    images: [{ type: String }],
    sizes: [{ type: String, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'] }],
    colors: [{ type: String }],
    stock: { type: Number, required: true, default: 0, min: 0 },
    sold: { type: Number, default: 0 },
    brand: { type: String, default: '' },
    tags: [{ type: String }],
    reviews: [reviewSchema],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Update rating when reviews change
productSchema.methods.updateRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
  } else {
    this.numReviews = this.reviews.length;
    this.rating =
      this.reviews.reduce((acc, r) => acc + r.rating, 0) / this.reviews.length;
  }
};

productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
