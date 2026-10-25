import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    createReview,
    getHotelReviews,
    ownerResponse,
    deleteReview,
} from '../controllers/reviewController.js';

const reviewRouter = express.Router();

reviewRouter.post('/',                     protect, createReview);
reviewRouter.get('/hotel/:hotelId',        getHotelReviews);         // public
reviewRouter.patch('/:id/response',        protect, ownerResponse);
reviewRouter.delete('/:id',               protect, deleteReview);

export default reviewRouter;
