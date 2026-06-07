import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hotel:  { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    room:   { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment:{ type: String, maxlength: 1000 },
    photos: [{ type: String }],  // Cloudinary URLs
    ownerResponse:   { type: String, maxlength: 1000 },
    ownerResponseAt: { type: Date },
}, { timestamps: true });

// Prevent duplicate review for same user+hotel
reviewSchema.index({ user: 1, hotel: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
