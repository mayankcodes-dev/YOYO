import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import {
    getUserData,
    storeRecentSearchedCities,
    updateProfile,
    toggleWishlist,
    getWishlist,
} from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.get('/',                          protect, getUserData);
userRouter.post('/store-recent-search',      protect, storeRecentSearchedCities);
userRouter.patch('/profile',                 protect, upload.single('image'), updateProfile);
userRouter.post('/wishlist/:roomId',         protect, toggleWishlist);
userRouter.get('/wishlist',                  protect, getWishlist);

export default userRouter;