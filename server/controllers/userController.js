import User from '../models/User.js';
import { v2 as cloudinary } from 'cloudinary';

// ── GET /api/user/  (protected) ───────────────────────────────
export const getUserData = async (req, res) => {
    try {
        res.json({
            success: true,
            role:                req.user.role,
            recentSearchedCities:req.user.recentSearchedCities,
            wishlist:            req.user.wishlist || [],
            phone:               req.user.phone || '',
            username:            req.user.username,
            email:               req.user.email,
            image:               req.user.image,
        });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// ── POST /api/user/store-recent-search  (protected) ──────────
export const storeRecentSearchedCities = async (req, res) => {
    try {
        const { recentSearchedCity } = req.body;
        const user = req.user;

        if (user.recentSearchedCities.includes(recentSearchedCity))
            return res.json({ success: true, message: 'Already in recent searches' });

        if (user.recentSearchedCities.length < 3) {
            user.recentSearchedCities.push(recentSearchedCity);
        } else {
            user.recentSearchedCities.shift();
            user.recentSearchedCities.push(recentSearchedCity);
        }
        await user.save();
        res.json({ success: true, message: 'City added' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ── PATCH /api/user/profile  (protected) ─────────────────────
export const updateProfile = async (req, res) => {
    try {
        const { username, phone } = req.body;
        const user = req.user;

        if (username) user.username = username.trim().slice(0, 60);
        if (phone !== undefined) user.phone = phone.trim().slice(0, 15);

        // If avatar image uploaded
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'yoyo/avatars',
                width:  256, height: 256, crop: 'fill', gravity: 'face',
            });
            user.image = result.secure_url;
        }

        await user.save();
        res.json({
            success: true,
            message: 'Profile updated',
            user: {
                _id:      user._id,
                username: user.username,
                email:    user.email,
                image:    user.image,
                role:     user.role,
                phone:    user.phone,
            },
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ── POST /api/user/wishlist/:roomId  (protected) ──────────────
export const toggleWishlist = async (req, res) => {
    try {
        const { roomId } = req.params;
        const user = await User.findById(req.user._id);

        const idx = user.wishlist.findIndex(id => id.toString() === roomId);
        let added;
        if (idx === -1) {
            user.wishlist.push(roomId);
            added = true;
        } else {
            user.wishlist.splice(idx, 1);
            added = false;
        }
        await user.save();
        res.json({ success: true, added, wishlist: user.wishlist });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ── GET /api/user/wishlist  (protected) ───────────────────────
export const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate({ path: 'wishlist', populate: { path: 'hotel', select: 'name city' } });
        res.json({ success: true, wishlist: user.wishlist });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
