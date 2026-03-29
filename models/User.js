const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: [true, 'Name is required'], trim: true },
    email:    { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
    password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
    role:     { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
    avatar:   { type: String, default: '' },
    phone:    { type: String, default: '' },
    address: {
      street:  String,
      city:    String,
      state:   String,
      zipCode: String,
      country: { type: String, default: 'India' },
    },
    // Seller-specific store info
    storeInfo: {
      storeName:   { type: String, default: '' },
      storeDesc:   { type: String, default: '' },
      storePhone:  { type: String, default: '' },
      storeEmail:  { type: String, default: '' },
      storeCity:   { type: String, default: '' },
    },
    wishlist:               [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    isVerified:             { type: Boolean, default: false },
    isActive:               { type: Boolean, default: true },
    resetPasswordToken:     String,
    resetPasswordExpire:    Date,
    emailVerificationToken: String,
  },
  { timestamps: true }
);

// Hash password before saving — cost 10 is fast enough and secure
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken  = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
