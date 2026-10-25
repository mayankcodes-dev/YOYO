import Hotel from '../models/Hotel.js';
import Room  from '../models/Room.js';
import { v2 as cloudinary } from 'cloudinary';
import { ok, fail } from '../utils/respond.js';

// ── POST /api/rooms/  (protected hotelOwner) ──────────────────
// C-2 FIX: images are now uploaded from the in-memory buffer (memoryStorage),
// not from a disk path. This works on AWS Lambda where /tmp is ephemeral and
// diskStorage writes are never cleaned up, risking OOM.
const uploadBufferToCloudinary = (buffer) =>
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'yoyo' },
            (error, result) => (error ? reject(error) : resolve(result.secure_url))
        );
        stream.end(buffer);
    });

export const createRoom = async (req, res) => {
    try {
        const { roomType, pricePerNight, amenities, category } = req.body;
        const hotel = await Hotel.findOne({ owner: req.user._id });
        if (!hotel) return fail(res, 'No hotel found for this owner', 404);

        if (!req.files?.length) return fail(res, 'Please upload at least one image');

        // C-2 FIX: use buffer (memoryStorage) → upload_stream instead of f.path (diskStorage)
        const images = await Promise.all(req.files.map(f => uploadBufferToCloudinary(f.buffer)));

        await Room.create({
            hotel: hotel._id,
            roomType,
            pricePerNight: +pricePerNight,
            amenities: typeof amenities === 'string' ? JSON.parse(amenities) : amenities,
            images,
            category: category || 'Budget',
        });

        ok(res, { message: 'Room created successfully' });
    } catch (error) {
        fail(res, error.message);
    }
};

// ── GET /api/rooms/  (public) ─────────────────────────────────
// Query params:
//   ?page=1&limit=12   — paginated response
//   (no params)        — returns all rooms (backward-compat for AppContext cache)
export const getRooms = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const paginate = page !== undefined || limit !== undefined;
        const p = Math.max(1, parseInt(page)  || 1);
        const l = Math.min(50, parseInt(limit) || 12);
        const skip = paginate ? (p - 1) * l : 0;

        const query = { isAvailable: true, isDeleted: { $ne: true } };

        const [allRooms, total] = await Promise.all([
            Room.find(query)
                .populate({ path: 'hotel', options: { strictPopulate: false } })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(paginate ? l : 0) // 0 = no limit
                .lean(),
            paginate ? Room.countDocuments(query) : Promise.resolve(null),
        ]);

        // Filter out rooms where hotel failed to resolve
        const rooms = allRooms.filter(r => r.hotel && r.hotel._id);

        const resp = { rooms };
        if (paginate) {
            resp.pagination = { page: p, limit: l, total, pages: Math.ceil(total / l) };
        }
        ok(res, resp);
    } catch (error) {
        // Last-resort: return rooms without hotel details
        try {
            const rooms = await Room.find({ isAvailable: true, isDeleted: { $ne: true } })
                .sort({ createdAt: -1 })
                .lean();
            ok(res, { rooms });
        } catch (err2) {
            fail(res, err2.message);
        }
    }
};


// ── GET /api/rooms/owner  (protected hotelOwner) ──────────────
export const getOwnerRooms = async (req, res) => {
    try {
        const hotel = await Hotel.findOne({ owner: req.user._id });
        if (!hotel) return fail(res, 'No hotel found for this owner', 404);

        const rooms = await Room.find({ hotel: hotel._id, isDeleted: { $ne: true } }).populate('hotel');
        ok(res, { rooms });
    } catch (error) {
        fail(res, error.message);
    }
};

// ── POST /api/rooms/toggle-availability  (protected hotelOwner) ─
export const toggleRoomAvailability = async (req, res) => {
    try {
        // C-3 FIX: verify the room belongs to the requesting owner's hotel.
        // Without this check any hotelOwner could toggle a competitor's room.
        const hotel = await Hotel.findOne({ owner: req.user._id });
        if (!hotel) return fail(res, 'No hotel found for this owner', 404);

        const room = await Room.findOne({ _id: req.body.roomId, hotel: hotel._id });
        if (!room) return fail(res, 'Room not found or unauthorized', 404);

        room.isAvailable = !room.isAvailable;
        await room.save();
        ok(res, { message: 'Availability updated' });
    } catch (error) {
        fail(res, error.message);
    }
};

// ── PATCH /api/rooms/:id  (protected hotelOwner) ──────────────
export const updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { roomType, pricePerNight, amenities, category } = req.body;

        const hotel = await Hotel.findOne({ owner: req.user._id });
        if (!hotel) return fail(res, 'Hotel not found', 404);

        const room = await Room.findOne({ _id: id, hotel: hotel._id });
        if (!room) return fail(res, 'Room not found or unauthorized', 404);

        if (roomType)      room.roomType      = roomType;
        if (pricePerNight) room.pricePerNight = +pricePerNight;
        if (amenities)     room.amenities     = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;
        if (category)      room.category      = category;

        if (req.files?.length) {
            // C-2 FIX: use buffer (memoryStorage) → upload_stream instead of f.path
            const newImages = await Promise.all(req.files.map(f => uploadBufferToCloudinary(f.buffer)));
            room.images = [...room.images, ...newImages].slice(0, 4);
        }

        await room.save();
        ok(res, { message: 'Room updated', room });
    } catch (error) {
        fail(res, error.message);
    }
};

// ── DELETE /api/rooms/:id  (protected hotelOwner) ─────────────
export const deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const hotel  = await Hotel.findOne({ owner: req.user._id });
        if (!hotel) return fail(res, 'Hotel not found', 404);

        const room = await Room.findOneAndUpdate(
            { _id: id, hotel: hotel._id },
            { isAvailable: false, isDeleted: true },
            { new: true }
        );
        if (!room) return fail(res, 'Room not found or unauthorized', 404);

        ok(res, { message: 'Room deleted' });
    } catch (error) {
        fail(res, error.message);
    }
};
