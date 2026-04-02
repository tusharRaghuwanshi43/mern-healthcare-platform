const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// @desc    Create Payment Intent
// @route   POST /api/payments/create-intent
// @access  Private
const createPaymentIntent = async (req, res) => {
    try {
        const { amount } = req.body;
        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Convert to cents
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
        });
        res.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error("Stripe Error:", error);
        res.status(500).json({ message: error.message || 'Payment initiation failed' });
    }
};
module.exports = { createPaymentIntent };