const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host:   process.env.EMAIL_HOST || 'smtp.gmail.com',
    port:   Number(process.env.EMAIL_PORT) || 587,  // ✅ must be Number, not string
    secure: Number(process.env.EMAIL_PORT) === 465,  // true only for port 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Increase timeout for slow connections (Render cold start)
    connectionTimeout: 10000,
    greetingTimeout:   10000,
    socketTimeout:     15000,
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  // Guard: don't crash if env vars missing
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ EMAIL_USER or EMAIL_PASS not set in .env');
    throw new Error('Email service not configured. Please set EMAIL_USER and EMAIL_PASS in your environment variables.');
  }

  const transporter = createTransporter();

  // Verify connection before sending (helps catch config errors early)
  await transporter.verify().catch(err => {
    console.error('❌ SMTP verify failed:', err.message);
    throw new Error('Cannot connect to email server. Check EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS.');
  });

  const info = await transporter.sendMail({
    from:    process.env.EMAIL_FROM || `ShopEase <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    text,
  });

  console.log(`✅ Email sent to ${to} — MessageID: ${info.messageId}`);
  return info;
};

// ─── Email Templates ──────────────────────────────────────────────────────────
const emailTemplates = {
  welcome: (name) => ({
    subject: 'Welcome to ShopEase! 🛍️',
    html: `
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
        <div style="background:linear-gradient(135deg,#2C3E50,#1a252f);padding:40px;text-align:center;">
          <h1 style="color:#00C2A8;margin:0;font-size:32px;letter-spacing:-1px;">ShopEase</h1>
          <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:14px;">Fashion. Delivered.</p>
        </div>
        <div style="padding:40px;background:#f8f9fa;">
          <h2 style="color:#2C3E50;margin:0 0 16px;">Welcome, ${name}! 🎉</h2>
          <p style="color:#555;line-height:1.7;margin:0 0 24px;">
            Your ShopEase account has been created. Explore the latest fashion and enjoy seamless shopping.
          </p>
          <a href="${process.env.CLIENT_URL}" style="display:inline-block;background:#00C2A8;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
            Start Shopping →
          </a>
        </div>
        <div style="padding:24px 40px;text-align:center;border-top:1px solid #eee;">
          <p style="color:#aaa;font-size:13px;margin:0;">© ${new Date().getFullYear()} ShopEase. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  orderConfirmation: (order, userName) => ({
    subject: `Order Confirmed #${order._id.toString().slice(-8).toUpperCase()} 🛍️`,
    html: `
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
        <div style="background:linear-gradient(135deg,#2C3E50,#1a252f);padding:40px;text-align:center;">
          <h1 style="color:#00C2A8;margin:0;font-size:32px;">ShopEase</h1>
        </div>
        <div style="padding:40px;">
          <h2 style="color:#2C3E50;">Hi ${userName}, your order is confirmed! ✅</h2>
          <p style="color:#555;">Order ID: <strong>#${order._id.toString().slice(-8).toUpperCase()}</strong></p>
          <p style="color:#555;">Total: <strong>₹${order.totalPrice}</strong></p>
          <p style="color:#555;">We'll send you a shipping update soon.</p>
          <a href="${process.env.CLIENT_URL}/orders/${order._id}" style="display:inline-block;background:#00C2A8;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;">
            View Order →
          </a>
        </div>
        <div style="padding:24px 40px;text-align:center;border-top:1px solid #eee;">
          <p style="color:#aaa;font-size:13px;">© ${new Date().getFullYear()} ShopEase. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  resetPassword: (resetUrl, expiryMinutes = 30) => ({
    subject: 'Reset Your ShopEase Password 🔐',
    html: `
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
        <div style="background:linear-gradient(135deg,#2C3E50,#1a252f);padding:40px;text-align:center;">
          <h1 style="color:#00C2A8;margin:0;font-size:32px;">ShopEase</h1>
          <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:14px;">Fashion. Delivered.</p>
        </div>
        <div style="padding:40px;background:#f8f9fa;">
          <h2 style="color:#2C3E50;margin:0 0 12px;">Reset Your Password</h2>
          <p style="color:#555;line-height:1.7;margin:0 0 8px;">
            We received a request to reset your password. Click the button below to choose a new one.
          </p>
          <p style="color:#e67e22;font-size:13px;font-weight:600;margin:0 0 24px;">
            ⏰ This link expires in ${expiryMinutes} minutes.
          </p>
          <a href="${resetUrl}"
             style="display:inline-block;background:#e74c3c;color:white;padding:16px 36px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px;letter-spacing:0.02em;">
            Reset My Password →
          </a>
          <p style="color:#aaa;font-size:13px;margin-top:28px;">
            If you didn't request a password reset, you can safely ignore this email. Your password won't change.
          </p>
          <p style="color:#bbb;font-size:12px;margin-top:8px;word-break:break-all;">
            Or copy this link: ${resetUrl}
          </p>
        </div>
        <div style="padding:24px 40px;text-align:center;border-top:1px solid #eee;">
          <p style="color:#aaa;font-size:13px;margin:0;">© ${new Date().getFullYear()} ShopEase. All rights reserved.</p>
        </div>
      </div>
    `,
  }),
};

module.exports = { sendEmail, emailTemplates };
