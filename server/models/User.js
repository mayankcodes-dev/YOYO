import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username:             { type: String, required: true, trim: true },
    email:                { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:             { type: String, required: true, select: false },
    image:                { type: String, default: '' },
    role:                 { type: String, enum: ['user', 'hotelOwner', 'admin'], default: 'user' },
    googleId:             { type: String, default: null },
    phone:                { type: String, default: '' },
    wishlist:             [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }],
    recentSearchedCities: [{ type: String }],
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;