import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username:             { type: String, required: true, trim: true },
    email:                { type: String, required: true, unique: true, lowercase: true, trim: true },
    // password is optional — Google-only users are created without one.
    // select: false ensures it is NEVER returned in API responses.
    password:             { type: String, required: false, select: false },
    image:                { type: String, default: '' },
    role:                 { type: String, enum: ['user', 'hotelOwner', 'admin'], default: 'user' },
    // googleId: sparse index for fast OAuth lookups; null for JWT-only users
    googleId:             { type: String, default: null, index: { sparse: true } },
    phone:                { type: String, default: '' },
    wishlist:             [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }],
    recentSearchedCities: [{ type: String }],
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;