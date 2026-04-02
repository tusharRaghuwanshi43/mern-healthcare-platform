const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const { protect } = require('../middleware/authMiddleware');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_now');
// @desc    Create Stripe payment intent
// @route   POST /api/payments/create-intent
// @access  Private (Patient only ideally)
router.post('/create-intent', protect, async (req, res) => {
    try {
        const { amount, currency = 'usd' } = req.body;
        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Stripe expects amounts in cents
            currency: currency,
            automatic_payment_methods: {
                enabled: true,
            },
        });
        res.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
module.exports = router;