const express      = require('express');
const mongoose     = require('mongoose');
const cors         = require('cors');
const cookieParser = require('cookie-parser');
const morgan       = require('morgan');
const dotenv       = require('dotenv');

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
    emailProvider: process.env.BREVO_PASS ? 'Brevo ✅' : 'Gmail (may timeout on Render)',
    env: {
      NODE_ENV:    process.env.NODE_ENV,
      BREVO_USER:  process.env.BREVO_USER  ? `${process.env.BREVO_USER.slice(0,4)}****` : '❌ NOT SET',
      BREVO_PASS:  process.env.BREVO_PASS  ? `set (${process.env.BREVO_PASS.length} chars)` : '❌ NOT SET',
      EMAIL_USER:  process.env.EMAIL_USER  ? `${process.env.EMAIL_USER.slice(0,4)}****` : '❌ NOT SET',
      EMAIL_PASS:  process.env.EMAIL_PASS  ? `set (${process.env.EMAIL_PASS.length} chars)` : '❌ NOT SET',
      CLIENT_URL:  process.env.CLIENT_URL  || '❌ NOT SET',
      MONGO_URI:   process.env.MONGO_URI   ? '✅ set' : '❌ NOT SET',
      STRIPE_KEY:  process.env.STRIPE_SECRET_KEY ? '✅ set' : '❌ NOT SET',
    },
  });
});

// ── Email test ── GET /api/test-email?to=your@gmail.com ──────────────────────
app.get('/api/test-email', async (req, res) => {
  const nodemailer = require('nodemailer');
  const to = req.query.to || process.env.BREVO_USER || process.env.EMAIL_USER;

  if (!to) {
    return res.status(400).json({ success: false, message: 'Add ?to=your@email.com to the URL' });
  }

  // Decide which transport to use
  let transportConfig;
  let providerName;

  if (process.env.BREVO_PASS) {
    providerName = 'Brevo';
    transportConfig = {
      host: 'smtp-relay.brevo.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.BREVO_USER || process.env.EMAIL_USER,
        pass: process.env.BREVO_PASS,
      },
    };
  } else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    providerName = 'Gmail';
    transportConfig = {
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    };
  } else {
    return res.status(500).json({
      success: false,
      message: '❌ No email credentials set. Add BREVO_USER + BREVO_PASS in Render env vars.',
      howTo: 'Sign up free at https://app.brevo.com → SMTP & API → SMTP tab → copy credentials',
    });
  }

  try {
    const transporter = nodemailer.createTransport(transportConfig);
    const from = process.env.EMAIL_FROM
      || (process.env.BREVO_USER ? `ShopEase <${process.env.BREVO_USER}>` : `ShopEase <${process.env.EMAIL_USER}>`);

    const info = await transporter.sendMail({
      from,
      to,
      subject: `✅ ShopEase Email Test via ${providerName}`,
      html: `<h2 style="color:#00C2A8">Email is working! ✅</h2>
             <p>Provider: <strong>${providerName}</strong></p>
             <p>This confirms your email config on Render is correct.</p>`,
    });

    res.json({
      success:  true,
      provider: providerName,
      message:  `✅ Test email sent to ${to} via ${providerName}`,
      messageId: info.messageId,
    });
  } catch (err) {
    res.status(500).json({
      success:  false,
      provider: providerName,
      error:    err.message,
      fix: providerName === 'Brevo'
        ? '👉 Check BREVO_USER (your Brevo login email) and BREVO_PASS (SMTP key from brevo.com → SMTP & API → SMTP tab) in Render env vars'
        : '👉 Gmail is blocked on Render. Switch to Brevo: sign up free at https://app.brevo.com',
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
      console.log(`📧 Email provider: ${process.env.BREVO_PASS ? 'Brevo ✅' : 'Gmail (may fail on Render)'}`);
      console.log(`📧 Email user: ${process.env.BREVO_USER || process.env.EMAIL_USER || '❌ NOT SET'}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB failed:', err.message);
    process.exit(1);
  });

module.exports = app;
