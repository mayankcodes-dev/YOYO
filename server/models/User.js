import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false }, // never returned by default
    image:    { type: String, default: '' },
    role:     { type: String, enum: ['user', 'hotelOwner'], default: 'user' },
    googleId: { type: String, default: null },                // for Google OAuth accounts
    recentSearchedCities: [{ type: String }],
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;