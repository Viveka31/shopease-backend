const express      = require('express');
const mongoose     = require('mongoose');
const cors         = require('cors');
const cookieParser = require('cookie-parser');
const morgan       = require('morgan');
const dotenv       = require('dotenv');
const https        = require('https');

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
    emailMethod: 'Brevo REST API (HTTPS) — no SMTP port issues',
    env: {
      NODE_ENV:      process.env.NODE_ENV,
      BREVO_API_KEY: process.env.BREVO_API_KEY ? `set (${process.env.BREVO_API_KEY.length} chars)` : '❌ NOT SET — get free at brevo.com → SMTP & API → API Keys',
      BREVO_SENDER:  process.env.BREVO_SENDER  || process.env.EMAIL_USER || '❌ NOT SET',
      CLIENT_URL:    process.env.CLIENT_URL     || '❌ NOT SET',
      MONGO_URI:     process.env.MONGO_URI      ? '✅ set' : '❌ NOT SET',
      STRIPE_KEY:    process.env.STRIPE_SECRET_KEY ? '✅ set' : '❌ NOT SET',
    },
  });
});

// ── Email test ── GET /api/test-email?to=your@gmail.com ──────────────────────
app.get('/api/test-email', async (req, res) => {
  const to = req.query.to || process.env.BREVO_SENDER || process.env.EMAIL_USER;

  if (!process.env.BREVO_API_KEY) {
    return res.status(500).json({
      success: false,
      message: '❌ BREVO_API_KEY not set in Render env vars',
      howTo: '1. Go to brevo.com → login → top right menu → SMTP & API → API Keys tab → Generate a new API key → copy it → paste in Render env vars as BREVO_API_KEY',
    });
  }

  const payload = JSON.stringify({
    sender:      { name: 'ShopEase', email: process.env.BREVO_SENDER || process.env.EMAIL_USER },
    to:          [{ email: to }],
    subject:     '✅ ShopEase Email Test — Working!',
    htmlContent: '<h2 style="color:#00C2A8">Email is working! ✅</h2><p>Brevo REST API is correctly configured on Render.</p>',
  });

  const options = {
    hostname: 'api.brevo.com',
    path:     '/v3/smtp/email',
    method:   'POST',
    headers: {
      'accept':       'application/json',
      'content-type': 'application/json',
      'api-key':      process.env.BREVO_API_KEY,
    },
  };

  const request = https.request(options, (response) => {
    let data = '';
    response.on('data', chunk => data += chunk);
    response.on('end', () => {
      if (response.statusCode >= 200 && response.statusCode < 300) {
        const result = JSON.parse(data);
        res.json({ success: true, message: `✅ Email sent to ${to}`, messageId: result.messageId });
      } else {
        res.status(500).json({
          success: false,
          status: response.statusCode,
          error: data,
          fix: response.statusCode === 401
            ? '👉 BREVO_API_KEY is invalid. Re-copy it from brevo.com → SMTP & API → API Keys'
            : response.statusCode === 400
            ? '👉 BREVO_SENDER email not set or not verified in Brevo. Add BREVO_SENDER=youremail@gmail.com in Render env vars'
            : '👉 Check Render logs',
        });
      }
    });
  });

  request.on('error', err => res.status(500).json({ success: false, error: err.message }));
  request.setTimeout(15000, () => { request.destroy(); res.status(500).json({ success: false, error: 'Request timed out' }); });
  request.write(payload);
  request.end();
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
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Server Error' });
});

// ── Connect & Start ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server on port ${PORT}`);
      console.log(`📧 Email method: Brevo REST API`);
      console.log(`🔑 Brevo API Key: ${process.env.BREVO_API_KEY ? `set (${process.env.BREVO_API_KEY.length} chars)` : '❌ NOT SET'}`);
      console.log(`📨 Sender: ${process.env.BREVO_SENDER || process.env.EMAIL_USER || '❌ NOT SET'}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB failed:', err.message);
    process.exit(1);
  });

module.exports = app;
