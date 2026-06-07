import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    checkAvailibilityAPI,
    createBooking,
    getUserBookings,
    getHotelBookings,
    cancelBooking,
    updateBookingStatus,
    stripePayment,
    verifyStripePayment,
    createRazorpayOrder,
    verifyRazorpayPayment,
    validateCoupon,
} from '../controllers/bookingController.js';

const bookingRouter = express.Router();

// Public
bookingRouter.post('/check-availability', checkAvailibilityAPI);
bookingRouter.post('/validate-coupon',     protect, validateCoupon);

// Booking lifecycle
bookingRouter.post('/book',                protect, createBooking);
bookingRouter.get('/user',                 protect, getUserBookings);
bookingRouter.get('/hotel',                protect, getHotelBookings);
bookingRouter.patch('/:id/cancel',         protect, cancelBooking);
bookingRouter.patch('/:id/status',         protect, updateBookingStatus);

// Payments
bookingRouter.post('/stripe-payment',      protect, stripePayment);
bookingRouter.post('/verify-payment',      protect, verifyStripePayment);
bookingRouter.post('/razorpay-order',      protect, createRazorpayOrder);
bookingRouter.post('/verify-razorpay',     protect, verifyRazorpayPayment);

export default bookingRouter;