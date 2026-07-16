import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'yoyo_jwt_secret_change_in_prod';

const protect = async (req, res, next) => {
    try {
        const header = req.headers.authorization;
        if (!header || !header.startsWith('Bearer '))
            return res.json({ success: false, message: 'Not authenticated' });

        const token = header.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('[Protect] decoded id:', decoded.id, '| route:', req.originalUrl);

        // Guard against legacy Clerk-format IDs in old JWTs (e.g. "user_35Sr3...")
        // User.findById will throw a CastError for non-ObjectId strings
        let user;
        try {
            user = await User.findById(decoded.id);
        } catch (castErr) {
            console.warn('[Protect] CastError for id:', decoded.id);
            return res.json({ success: false, message: 'Invalid or expired token' });
        }

        if (!user) {
            console.warn('[Protect] User.findById returned null for id:', decoded.id);
            return res.json({ success: false, message: 'User not found' });
        }

        console.log('[Protect] user found — _id:', user._id.toString(), 'role:', user.role);
        req.user = user;
        next();
    } catch (err) {
        console.warn('[Protect] JWT error:', err.message);
        return res.json({ success: false, message: 'Invalid or expired token' });
    }
};

// Support both: import protect from '...' AND import { protect } from '...'
export { protect };
export default protect;