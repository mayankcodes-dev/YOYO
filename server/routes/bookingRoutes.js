import express from 'express';
import { checkAvailibilityAPI, createBooking, getHotelBookings, getUserBookings, stripePayment, verifyStripePayment } from '../controllers/bookingController.js';
import protect from '../middleware/authMiddleware.js';

const bookingRouter = express.Router();

bookingRouter.post('/check-availability', checkAvailibilityAPI);
bookingRouter.post('/book', protect, createBooking);
bookingRouter.get('/user', protect, getUserBookings);
bookingRouter.get('/hotel', protect, getHotelBookings);
bookingRouter.post('/stripe-payment', protect, stripePayment);
bookingRouter.post('/verify-payment', protect, verifyStripePayment);

export default bookingRouter;