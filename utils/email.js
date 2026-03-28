const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'ShopEase <noreply@shopease.com>',
    to,
    subject,
    html,
    text,
  };
  const info = await transporter.sendMail(mailOptions);
  return info;
};

const emailTemplates = {
  welcome: (name) => ({
    subject: 'Welcome to ShopEase! 🛍️',
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #2C3E50 0%, #1a252f 100%); padding: 40px; text-align: center;">
          <h1 style="color: #00C2A8; margin: 0; font-size: 32px; letter-spacing: -1px;">ShopEase</h1>
          <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 14px;">Fashion. Delivered.</p>
        </div>
        <div style="padding: 40px; background: #f8f9fa;">
          <h2 style="color: #2C3E50; margin: 0 0 16px;">Welcome, ${name}! 🎉</h2>
          <p style="color: #555; line-height: 1.7; margin: 0 0 24px;">
            Your ShopEase account has been created. Explore thousands of fashion items and enjoy seamless shopping.
          </p>
          <a href="${process.env.CLIENT_URL}" style="display: inline-block; background: #00C2A8; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
            Start Shopping →
          </a>
        </div>
        <div style="padding: 24px 40px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #aaa; font-size: 13px; margin: 0;">© 2024 ShopEase. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  orderConfirmation: (order, userName) => ({
    subject: `Order Confirmed #${order._id.toString().slice(-8).toUpperCase()} 🛍️`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #2C3E50 0%, #1a252f 100%); padding: 40px; text-align: center;">
          <h1 style="color: #00C2A8; margin: 0; font-size: 32px;">ShopEase</h1>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #2C3E50;">Hi ${userName}, your order is confirmed! ✅</h2>
          <p style="color: #555;">Order ID: <strong>#${order._id.toString().slice(-8).toUpperCase()}</strong></p>
          <p style="color: #555;">Total: <strong>₹${order.totalPrice}</strong></p>
          <p style="color: #555;">We'll send you a shipping update soon.</p>
          <a href="${process.env.CLIENT_URL}/orders/${order._id}" style="display: inline-block; background: #00C2A8; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            View Order →
          </a>
        </div>
      </div>
    `,
  }),

  resetPassword: (resetUrl) => ({
    subject: 'Password Reset Request - ShopEase',
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2C3E50 0%, #1a252f 100%); padding: 40px; text-align: center;">
          <h1 style="color: #00C2A8; margin: 0; font-size: 32px;">ShopEase</h1>
        </div>
        <div style="padding: 40px; background: #f8f9fa;">
          <h2 style="color: #2C3E50;">Reset Your Password</h2>
          <p style="color: #555; line-height: 1.7;">
            You requested a password reset. Click the button below. This link expires in 10 minutes.
          </p>
          <a href="${resetUrl}" style="display: inline-block; background: #e74c3c; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Reset Password →
          </a>
          <p style="color: #aaa; font-size: 13px; margin-top: 24px;">If you didn't request this, ignore this email.</p>
        </div>
      </div>
    `,
  }),
};

module.exports = { sendEmail, emailTemplates };
