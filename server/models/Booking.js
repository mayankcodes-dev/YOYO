import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    room:          { type: mongoose.Schema.Types.ObjectId, ref: 'Room',  required: true },
    hotel:         { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    checkInDate:   { type: Date, required: true },
    checkOutDate:  { type: Date, required: true },
    totalPrice:    { type: Number, required: true },   // base price (nights × pricePerNight)
    taxAmount:     { type: Number, default: 0 },       // 12% GST
    serviceFee:    { type: Number, default: 99 },      // ₹99 flat
    couponCode:    { type: String, default: '' },
    discountAmount:{ type: Number, default: 0 },
    guests:        { type: Number, required: true },
    status:        { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
    paymentMethod: { type: String, required: true, default: 'pay at hotel' },
    isPaid:        { type: Boolean, default: false },
    cancelledAt:   { type: Date },
    refundStatus:  { type: String, enum: ['none', 'pending', 'done'], default: 'none' },
    // H-4 FIX: reminderSent was queried/updated by the scheduler cron but absent
    // from the schema — Mongoose strict mode silently dropped the update, causing
    // duplicate check-in reminder emails every day.
    reminderSent:  { type: Boolean, default: false },
    // C-5 FIX: storing the Stripe checkout session ID allows verifyStripePayment
    // to retrieve the session directly (O(1)) instead of listing the last 100
    // sessions and doing a linear scan, which exhausts Stripe rate limits at scale.
    stripeSessionId: { type: String, default: '' },
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
