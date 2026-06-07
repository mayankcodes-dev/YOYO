import Hotel from '../models/Hotel.js';
import User  from '../models/User.js';

// ── POST /api/hotels/  (protected) ───────────────────────────
export const registerHotel = async (req, res) => {
    try {
        const { name, address, contact, city } = req.body;
        if (!req.user) return res.json({ success: false, message: 'Authentication required' });

        const owner = req.user._id.toString();
        const existing = await Hotel.findOne({ owner });
        if (existing) return res.json({ success: false, message: 'Hotel already registered' });

        await Hotel.create({ name, address, contact, city, owner });
        await User.findByIdAndUpdate(owner, { role: 'hotelOwner' });

        res.json({ success: true, message: 'Hotel registered successfully' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ── PATCH /api/hotels/  (protected hotelOwner) ───────────────
export const updateHotel = async (req, res) => {
    try {
        const owner = req.user._id.toString();
        const { name, address, contact, city, description } = req.body;

        const hotel = await Hotel.findOneAndUpdate(
            { owner },
            { ...(name && { name }), ...(address && { address }), ...(contact && { contact }), ...(city && { city }), ...(description && { description }) },
            { new: true }
        );
        if (!hotel) return res.json({ success: false, message: 'Hotel not found' });

        res.json({ success: true, message: 'Hotel updated', hotel });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ── GET /api/hotels/owner  (protected hotelOwner) ─────────────
export const getOwnerHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findOne({ owner: req.user._id.toString() });
        if (!hotel) return res.json({ success: false, message: 'No hotel registered' });
        res.json({ success: true, hotel });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};