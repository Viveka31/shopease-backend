const nodemailer = require('nodemailer');

/**
 * ShopEase Email Utility
 *
 * Uses Brevo (formerly Sendinblue) SMTP — free 300 emails/day
 * Works perfectly on Render (no port blocking unlike Gmail SMTP)
 * Emails arrive in real Gmail/any inbox ✅
 *
 * Required env vars:
 *   BREVO_USER  = your Brevo login email (the email you signed up with)
 *   BREVO_PASS  = your Brevo SMTP key (from Brevo dashboard → SMTP & API → SMTP)
 *   EMAIL_FROM  = ShopEase <your@email.com>
 *
 * Signup free: https://app.brevo.com
 */

const createTransporter = () => {
  // ── Brevo SMTP (recommended for Render — no port blocking) ──────────────────
  if (process.env.BREVO_PASS) {
    return nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_USER || process.env.EMAIL_USER,
        pass: process.env.BREVO_PASS,
      },
    });
  }

  // ── Gmail fallback (may timeout on Render free tier) ────────────────────────
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.warn('⚠️  Using Gmail SMTP — may timeout on Render. Consider switching to Brevo.');
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 30000,
      socketTimeout:     30000,
    });
  }

  throw new Error(
    'No email transport configured. Set BREVO_PASS (recommended) or EMAIL_USER + EMAIL_PASS in env vars.'
  );
};

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  const from = process.env.EMAIL_FROM
    || (process.env.BREVO_USER ? `ShopEase <${process.env.BREVO_USER}>` : null)
    || (process.env.EMAIL_USER ? `ShopEase <${process.env.EMAIL_USER}>` : 'ShopEase <noreply@shopease.com>');

  try {
    const info = await transporter.sendMail({ from, to, subject, html, text: text || subject });
    console.log(`✅ Email sent to ${to} | ID: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`❌ Email failed: ${err.message}`);

    if (err.message.includes('Invalid login') || err.message.includes('Username and Password') || err.message.includes('535')) {
      throw new Error(
        'Email authentication failed. ' +
        (process.env.BREVO_PASS
          ? 'Check BREVO_USER and BREVO_PASS in Render env vars.'
          : 'EMAIL_PASS must be a Gmail App Password (16 chars). Get it: Google Account → Security → App Passwords.')
      );
    }
    if (err.message.includes('timeout') || err.message.includes('ETIMEDOUT') || err.message.includes('ECONNREFUSED')) {
      throw new Error(
        'Email server connection timed out. ' +
        (process.env.BREVO_PASS
          ? 'Check that BREVO_USER and BREVO_PASS are correct in Render.'
          : 'Render is blocking Gmail SMTP. Switch to Brevo (free): https://app.brevo.com')
      );
    }
    throw err;
  }
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
            Your ShopEase account is ready. Explore thousands of fashion items and enjoy seamless shopping.
          </p>
          <a href="${process.env.CLIENT_URL || '#'}"
             style="display:inline-block;background:#00C2A8;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
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
            Or paste this link: ${resetUrl}
          </p>
        </div>
        <div style="padding:24px 40px;text-align:center;border-top:1px solid #eee;">
          <p style="color:#aaa;font-size:13px;margin:0;">© ${new Date().getFullYear()} ShopEase. All rights reserved.</p>
        </div>
      </div>`,
  }),
};

module.exports = { sendEmail, emailTemplates };
