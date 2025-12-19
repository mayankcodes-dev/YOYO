import stripe from 'stripe';
import Booking from '../models/Booking.js';
import connectDB from '../configs/db.js';

// API to handle stripe webhooks
export const stripeWebhooks = async (req, res) => {
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (error) {
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    // Ensure DB connection for webhook
    try {
        await connectDB();
    } catch (dbError) {
        return res.status(500).send('Database connection failed');
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { bookingId } = session.metadata;

        if (bookingId) {
            await Booking.findByIdAndUpdate(bookingId, {
                isPaid: true,
                paymentMethod: 'Stripe',
            });
        }
    } else if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;

        const sessions = await stripeInstance.checkout.sessions.list({
            payment_intent: paymentIntentId,
        });

        if (sessions.data.length > 0 && sessions.data[0].metadata?.bookingId) {
            const { bookingId } = sessions.data[0].metadata;
            await Booking.findByIdAndUpdate(bookingId, {
                isPaid: true,
                paymentMethod: 'Stripe',
            });
        }
    }
    
    res.json({ received: true });
}