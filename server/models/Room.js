import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    roomType: { type: String, required: true },
    pricePerNight: { type: Number, required: true },
    amenities: { type: Array, default: [] },
    images: [{ type: String }],
    isAvailable: { type: Boolean, default: true },
    // YoYo — category field for filtering (Budget | Premium | Luxury | Villa | Business)
    category: {
        type: String,
        enum: ['Budget', 'Premium', 'Luxury', 'Villa', 'Business'],
        default: 'Budget',
    },

}, { timestamps: true });

const Room = mongoose.model("Room", roomSchema);

export default Room;