import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema({
    name:        { type: String, required: true },
    address:     { type: String, required: true },
    contact:     { type: String, required: true },
    // M-8 FIX: owner was typed as Schema.Types.Mixed which breaks .populate() and
    // owner-scoped queries. Changed to ObjectId so Mongoose can cast, populate, and
    // index properly. Legacy Clerk string IDs ("user_35Sr3…") were only present
    // during the early development phase and are no longer in production data.
    owner:       { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    city:        { type: String, required: true },
    image:       { type: String, default: '' },
    description: { type: String, default: '' },
}, { timestamps: true });

const Hotel = mongoose.model("Hotel", hotelSchema);

export default Hotel;
