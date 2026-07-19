import jwt  from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET;

// ─── protect — verifies Bearer JWT and attaches req.user ──────
export const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer '))
    return res.status(401).json({ success: false, message: 'Not authenticated' });

  const token = header.slice(7);

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }

  try {
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    req.user = user;
    next();
  } catch {
    // CastError — malformed id (e.g. legacy Clerk format)
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// ─── requireAdmin — must follow protect ───────────────────────
export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ success: false, message: 'Admin access required' });
  next();
};

// ─── requireOwner — must follow protect ───────────────────────
export const requireOwner = (req, res, next) => {
  if (req.user?.role !== 'hotelOwner' && req.user?.role !== 'admin')
    return res.status(403).json({ success: false, message: 'Hotel owner access required' });
  next();
};

export default protect;