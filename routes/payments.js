const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// @POST /api/payments/create-payment-intent
router.post('/create-payment-intent', protect, async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.buyer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalPrice * 100), // paise
      currency: 'inr',
      metadata: { orderId: order._id.toString(), userId: req.user.id },
    });

    res.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/payments/webhook — Stripe webhook
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ success: false, message: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata.orderId;

    await Order.findByIdAndUpdate(orderId, {
      isPaid: true,
      paidAt: Date.now(),
      orderStatus: 'confirmed',
      paymentResult: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        update_time: new Date().toISOString(),
      },
    });
  }

  res.json({ received: true });
});

// @PUT /api/payments/:orderId/pay — mark as paid (for COD or manual)
router.put('/:orderId/pay', protect, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      {
        isPaid: true,
        paidAt: Date.now(),
        orderStatus: 'confirmed',
        paymentResult: req.body.paymentResult,
      },
      { new: true }
    );
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
