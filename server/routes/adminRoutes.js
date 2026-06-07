import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    requireAdmin,
    getStats,
    getUsers,
    updateUserRole,
    getHotels,
    getAllBookings,
    getReviews,
    adminDeleteReview,
} from '../controllers/adminController.js';

const adminRouter = express.Router();

// All admin routes require auth + admin role
adminRouter.use(protect, requireAdmin);

adminRouter.get('/stats',          getStats);
adminRouter.get('/users',          getUsers);
adminRouter.patch('/users/:id',    updateUserRole);
adminRouter.get('/hotels',         getHotels);
adminRouter.get('/bookings',       getAllBookings);
adminRouter.get('/reviews',        getReviews);
adminRouter.delete('/reviews/:id', adminDeleteReview);

export default adminRouter;
