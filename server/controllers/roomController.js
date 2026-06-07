import Hotel from '../models/Hotel.js';
import Room  from '../models/Room.js';
import { v2 as cloudinary } from 'cloudinary';

// ── POST /api/rooms/  (protected hotelOwner) ──────────────────
export const createRoom = async (req, res) => {
    try {
        const { roomType, pricePerNight, amenities, category } = req.body;
        const hotel = await Hotel.findOne({ owner: req.user._id.toString() });
        if (!hotel) return res.json({ success: false, message: 'No hotel found for this owner' });

        if (!req.files || req.files.length === 0)
            return res.json({ success: false, message: 'Please upload at least one image' });

        const images = await Promise.all(
            req.files.map(f => cloudinary.uploader.upload(f.path, { folder: 'yoyo' }).then(r => r.secure_url))
        );

        await Room.create({
            hotel: hotel._id,
            roomType,
            pricePerNight: +pricePerNight,
            amenities: typeof amenities === 'string' ? JSON.parse(amenities) : amenities,
            images,
            category: category || 'Budget',
        });

        res.json({ success: true, message: 'Room created successfully' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ── GET /api/rooms/  (public) ─────────────────────────────────
export const getRooms = async (req, res) => {
    try {
        const rooms = await Room.find({ isAvailable: true, isDeleted: { $ne: true } })
            .populate({ path: 'hotel', populate: { path: 'owner', select: 'image username' } })
            .sort({ createdAt: -1 });
        res.json({ success: true, rooms });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ── GET /api/rooms/owner  (protected hotelOwner) ──────────────
export const getOwnerRooms = async (req, res) => {
    try {
        const hotelData = await Hotel.findOne({ owner: req.user._id.toString() });
        if (!hotelData) return res.json({ success: false, message: 'No hotel found for this owner' });

        const rooms = await Room.find({ hotel: hotelData._id, isDeleted: { $ne: true } }).populate('hotel');
        res.json({ success: true, rooms });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ── POST /api/rooms/toggle-availability  (protected hotelOwner) ─
export const toggleRoomAvailability = async (req, res) => {
    try {
        const { roomId } = req.body;
        const room = await Room.findById(roomId);
        if (!room) return res.json({ success: false, message: 'Room not found' });
        room.isAvailable = !room.isAvailable;
        await room.save();
        res.json({ success: true, message: 'Availability updated' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ── PATCH /api/rooms/:id  (protected hotelOwner) ──────────────
export const updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { roomType, pricePerNight, amenities, category } = req.body;

        const hotel = await Hotel.findOne({ owner: req.user._id.toString() });
        if (!hotel) return res.json({ success: false, message: 'Hotel not found' });

        const room = await Room.findOne({ _id: id, hotel: hotel._id });
        if (!room) return res.json({ success: false, message: 'Room not found or unauthorized' });

        if (roomType)      room.roomType      = roomType;
        if (pricePerNight) room.pricePerNight = +pricePerNight;
        if (amenities)     room.amenities     = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;
        if (category)      room.category      = category;

        // If new images uploaded
        if (req.files && req.files.length > 0) {
            const newImages = await Promise.all(
                req.files.map(f => cloudinary.uploader.upload(f.path, { folder: 'yoyo' }).then(r => r.secure_url))
            );
            room.images = [...room.images, ...newImages].slice(0, 4);
        }

        await room.save();
        res.json({ success: true, message: 'Room updated', room });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ── DELETE /api/rooms/:id  (protected hotelOwner) ─────────────
export const deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const hotel = await Hotel.findOne({ owner: req.user._id.toString() });
        if (!hotel) return res.json({ success: false, message: 'Hotel not found' });

        const room = await Room.findOneAndUpdate(
            { _id: id, hotel: hotel._id },
            { isAvailable: false, isDeleted: true },
            { new: true }
        );
        if (!room) return res.json({ success: false, message: 'Room not found or unauthorized' });

        res.json({ success: true, message: 'Room deleted' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
