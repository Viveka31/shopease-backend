const https = require('https');

/**
 * ShopEase Email — uses Brevo REST API (not SMTP)
 * Render blocks ALL outbound SMTP ports (587, 465, 25)
 * Brevo's HTTPS API works perfectly on Render — no port issues
 * Free: 300 emails/day, real inbox delivery
 */

const sendEmail = async ({ to, subject, html, text }) => {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    throw new Error(
      'BREVO_API_KEY not set. Get it free: brevo.com → SMTP & API → API Keys tab → Create API Key'
    );
  }

  const payload = JSON.stringify({
    sender:   { name: 'ShopEase', email: process.env.BREVO_SENDER || process.env.EMAIL_USER || 'noreply@shopease.com' },
    to:       [{ email: to }],
    subject,
    htmlContent: html || `<p>${text || subject}</p>`,
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.brevo.com',
      path:     '/v3/smtp/email',
      method:   'POST',
      headers: {
        'accept':       'application/json',
        'content-type': 'application/json',
        'api-key':      apiKey,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const result = JSON.parse(data);
          console.log(`✅ Email sent to ${to} | MessageID: ${result.messageId}`);
          resolve(result);
        } else {
          console.error(`❌ Brevo API error ${res.statusCode}: ${data}`);
          reject(new Error(`Brevo API error ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (err) => {
      console.error(`❌ Email request failed: ${err.message}`);
      reject(err);
    });

    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Brevo API request timed out'));
    });

    req.write(payload);
    req.end();
  });
};

// ─── Templates ────────────────────────────────────────────────────────────────
const emailTemplates = {
  welcome: (name) => ({
    subject: 'Welcome to ShopEase! 🛍️',
    html: `
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
        <div style="background:linear-gradient(135deg,#2C3E50,#1a252f);padding:40px;text-align:center;">
          <h1 style="color:#00C2A8;margin:0;font-size:32px;">ShopEase</h1>
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
