import Review  from '../models/Review.js';
import Booking from '../models/Booking.js';

// ── POST /api/reviews  (protected user) ──────────────────────
export const createReview = async (req, res) => {
    try {
        const { hotel, room, rating, comment } = req.body;
        const userId = req.user._id;

        // Must have a completed booking for this hotel
        const booking = await Booking.findOne({
            user:   userId.toString(),
            hotel,
            status: { $in: ['confirmed', 'cancelled'] },
            checkOutDate: { $lte: new Date() },
        });
        if (!booking)
            return res.json({ success: false, message: 'You can only review hotels you have stayed at' });

        // Check for duplicate
        const existing = await Review.findOne({ user: userId, hotel });
        if (existing)
            return res.json({ success: false, message: 'You have already reviewed this hotel' });

        const review = await Review.create({
            user: userId, hotel, room, rating: +rating, comment,
        });

        await review.populate('user', 'username image');
        res.json({ success: true, review });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ── GET /api/reviews/hotel/:hotelId  (public) ─────────────────
export const getHotelReviews = async (req, res) => {
    try {
        const { hotelId } = req.params;
        const reviews = await Review.find({ hotel: hotelId })
            .populate('user', 'username image')
            .sort({ createdAt: -1 });

        const avgRating = reviews.length
            ? +(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
            : 0;

        const distribution = [5, 4, 3, 2, 1].map(star => ({
            star,
            count: reviews.filter(r => r.rating === star).length,
        }));

        res.json({ success: true, reviews, avgRating, totalReviews: reviews.length, distribution });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ── PATCH /api/reviews/:id/response  (protected hotelOwner) ──
export const ownerResponse = async (req, res) => {
    try {
        const { id }       = req.params;
        const { response } = req.body;

        const review = await Review.findByIdAndUpdate(
            id,
            { ownerResponse: response, ownerResponseAt: new Date() },
            { new: true }
        ).populate('user', 'username image');

        if (!review) return res.json({ success: false, message: 'Review not found' });
        res.json({ success: true, review });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ── DELETE /api/reviews/:id  (protected admin or own review) ──
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findById(id);
        if (!review) return res.json({ success: false, message: 'Review not found' });

        const isOwn   = review.user.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwn && !isAdmin)
            return res.json({ success: false, message: 'Unauthorized' });

        await review.deleteOne();
        res.json({ success: true, message: 'Review deleted' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
