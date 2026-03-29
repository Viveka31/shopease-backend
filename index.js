const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const cookieParser = require('cookie-parser');
const morgan     = require('morgan');
const dotenv     = require('dotenv');

dotenv.config();

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(morgan('dev'));
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://darling-axolotl-779482.netlify.app',
    process.env.CLIENT_URL,
  ].filter(Boolean),
  credentials: true,
}));
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Health check ── GET /api/health ──────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    env: {
      NODE_ENV:   process.env.NODE_ENV,
      EMAIL_USER: process.env.EMAIL_USER ? `${process.env.EMAIL_USER.slice(0,4)}****` : '❌ NOT SET',
      EMAIL_PASS: process.env.EMAIL_PASS ? `set (${process.env.EMAIL_PASS.length} chars)` : '❌ NOT SET',
      CLIENT_URL: process.env.CLIENT_URL || '❌ NOT SET',
      MONGO_URI:  process.env.MONGO_URI  ? '✅ set' : '❌ NOT SET',
      STRIPE_KEY: process.env.STRIPE_SECRET_KEY ? '✅ set' : '❌ NOT SET',
    },
  });
});

// ── Email test ── GET /api/test-email?to=your@gmail.com ──────────────────────
app.get('/api/test-email', async (req, res) => {
  const nodemailer = require('nodemailer');
  const to = req.query.to || process.env.EMAIL_USER;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return res.status(500).json({
      success: false,
      message: '❌ EMAIL_USER or EMAIL_PASS not set in Render environment variables',
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from:    `ShopEase <${process.env.EMAIL_USER}>`,
      to,
      subject: '✅ ShopEase Email Test',
      html:    '<h2 style="color:#00C2A8">Email is working on Render!</h2><p>Gmail SMTP is correctly configured.</p>',
    });

    res.json({ success: true, message: `✅ Email sent to ${to}`, messageId: info.messageId });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
      fix: err.message.includes('Invalid login') || err.message.includes('Username and Password')
        ? '👉 Wrong App Password. Go to myaccount.google.com/apppasswords → generate new → paste in Render (no spaces)'
        : err.message.includes('timeout') || err.message.includes('ETIMEDOUT')
        ? '👉 Timeout — hit this URL again in 10 seconds (Render cold start)'
        : '👉 Check Render logs',
    });
  }
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart',     require('./routes/cart'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/reviews',  require('./routes/reviews'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/users',    require('./routes/users'));
app.use('/api/seller',   require('./routes/seller'));
app.use('/api/payments', require('./routes/payments'));

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

// ── Connect & Start ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server on port ${PORT}`);
      console.log(`📧 Email: ${process.env.EMAIL_USER || '❌ NOT SET'}`);
      console.log(`🔑 Pass:  ${process.env.EMAIL_PASS ? `set (${process.env.EMAIL_PASS.length} chars)` : '❌ NOT SET'}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB failed:', err.message);
    process.exit(1);
  });

module.exports = app;

