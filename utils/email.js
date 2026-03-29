const nodemailer = require('nodemailer');

/**
 * Email Transport Strategy:
 * 
 * Render free tier BLOCKS port 587 (STARTTLS).
 * Gmail port 465 (SSL/TLS) works fine on Render.
 * 
 * Required env vars:
 *   EMAIL_USER = yourname@gmail.com
 *   EMAIL_PASS = 16-char Gmail App Password (NOT your Gmail login password)
 *               Get it: Google Account → Security → 2-Step Verification → App Passwords
 */

const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error(
      'EMAIL_USER and EMAIL_PASS must be set in environment variables. ' +
      'EMAIL_PASS must be a Gmail App Password (16 chars), not your regular Gmail password.'
    );
  }

  return nodemailer.createTransport({
    service: 'gmail',   // ← use "service" instead of host/port — nodemailer knows Gmail's settings
    auth: {
      user,
      pass,
    },
    // Extended timeouts for Render cold starts
    connectionTimeout: 30000,
    greetingTimeout:   15000,
    socketTimeout:     30000,
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter(); // throws if env vars missing

  try {
    const info = await transporter.sendMail({
      from:    process.env.EMAIL_FROM || `ShopEase <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || subject,
    });
    console.log(`✅ Email sent to ${to} | MessageID: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`❌ Email to ${to} failed: ${err.message}`);

    // Give a helpful error message based on the error type
    if (err.message.includes('Invalid login') || err.message.includes('Username and Password')) {
      throw new Error(
        'Gmail authentication failed. Make sure EMAIL_PASS is a Gmail App Password ' +
        '(16 characters, no spaces), not your regular Gmail password. ' +
        'Generate one at: Google Account → Security → 2-Step Verification → App Passwords'
      );
    }
    if (err.message.includes('timeout') || err.message.includes('ETIMEDOUT')) {
      throw new Error(
        'Email server connection timed out. This sometimes happens on the first request ' +
        'after Render cold start. Please try again in a few seconds.'
      );
    }
    if (err.message.includes('self signed') || err.message.includes('certificate')) {
      throw new Error('SSL certificate error connecting to Gmail. Contact support.');
    }
    throw err;
  }
};

// ─── Templates ───────────────────────────────────────────────────────────────
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
            Your ShopEase account is ready. Explore thousands of fashion items and enjoy seamless shopping.
          </p>
          <a href="${process.env.CLIENT_URL || '#'}" style="display:inline-block;background:#00C2A8;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
            Start Shopping →
          </a>
        </div>
        <div style="padding:24px 40px;text-align:center;border-top:1px solid #eee;">
          <p style="color:#aaa;font-size:13px;margin:0;">© ${new Date().getFullYear()} ShopEase. All rights reserved.</p>
        </div>
      </div>`,
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
          <p style="color:#555;">We'll notify you when it ships.</p>
          <a href="${process.env.CLIENT_URL || '#'}/orders/${order._id}"
             style="display:inline-block;background:#00C2A8;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;">
            View Order →
          </a>
        </div>
        <div style="padding:24px 40px;text-align:center;border-top:1px solid #eee;">
          <p style="color:#aaa;font-size:13px;">© ${new Date().getFullYear()} ShopEase. All rights reserved.</p>
        </div>
      </div>`,
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
            We received a request to reset your ShopEase password.
          </p>
          <p style="color:#e67e22;font-size:13px;font-weight:600;margin:0 0 28px;">
            ⏰ This link expires in ${expiryMinutes} minutes.
          </p>
          <a href="${resetUrl}"
             style="display:inline-block;background:#e74c3c;color:white;padding:16px 36px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px;">
            Reset My Password →
          </a>
          <p style="color:#aaa;font-size:13px;margin-top:28px;">
            Didn't request this? Ignore this email — your password won't change.
          </p>
          <p style="color:#bbb;font-size:12px;margin-top:8px;word-break:break-all;">
            Link: ${resetUrl}
          </p>
        </div>
        <div style="padding:24px 40px;text-align:center;border-top:1px solid #eee;">
          <p style="color:#aaa;font-size:13px;margin:0;">© ${new Date().getFullYear()} ShopEase. All rights reserved.</p>
        </div>
      </div>`,
  }),
};

module.exports = { sendEmail, emailTemplates };
