const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  size: { type: String, default: '' },
  color: { type: String, default: '' },
  price: { type: Number, required: true },
});

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

cartSchema.virtual('totalItems').get(function () {
  return this.items.reduce((acc, item) => acc + item.quantity, 0);
});

cartSchema.virtual('totalPrice').get(function () {
  return this.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
});

module.exports = mongoose.model('Cart', cartSchema);
