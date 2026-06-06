import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';

const JWT_SECRET  = process.env.JWT_SECRET;
const JWT_EXPIRES = '7d';
const PEPPER      = process.env.PASSWORD_PEPPER; // Server-side secret added before hashing
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// ─── Helpers ──────────────────────────────────────────────────
const signToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

const formatUser = (u) => ({
    id: u._id, username: u.username, email: u.email,
    role: u.role, image: u.image,
});

// Pepper: concatenate server secret BEFORE bcrypt (which adds its own random salt)
const pepperPassword = (raw) => raw + PEPPER;

// ─── POST /api/auth/register ──────────────────────────────────
export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation (express-validator handles extra sanitization in route)
        if (!username?.trim() || !email?.trim() || !password)
            return res.status(400).json({ success: false, message: 'All fields required' });

        if (password.length < 8)
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });

        // Case-insensitive duplicate check (email already lowercased by mongoose)
        if (await User.findOne({ email: email.toLowerCase().trim() }))
            return res.status(409).json({ success: false, message: 'Email already registered' });

        // Salt (12 rounds) + Pepper before hashing
        const hashed = await bcrypt.hash(pepperPassword(password), 12);
        const user   = await User.create({
            username: username.trim(),
            email:    email.toLowerCase().trim(),
            password: hashed,
        });

        const token = signToken(user._id);
        res.status(201).json({ success: true, token, user: formatUser(user) });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
};

// ─── POST /api/auth/login ─────────────────────────────────────
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email?.trim() || !password)
            return res.status(400).json({ success: false, message: 'Email and password required' });

        // Select password explicitly (it's not selected by default if we add `select:false`)
        const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
        if (!user || !user.password)
            return res.status(401).json({ success: false, message: 'Invalid email or password' });

        // Verify with pepper
        const valid = await bcrypt.compare(pepperPassword(password), user.password);
        if (!valid)
            return res.status(401).json({ success: false, message: 'Invalid email or password' });

        const token = signToken(user._id);
        res.json({ success: true, token, user: formatUser(user) });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Login failed' });
    }
};

// ─── POST /api/auth/google ────────────────────────────────────
// Frontend sends the Google ID token; we verify it and issue our JWT
export const googleAuth = async (req, res) => {
    try {
        const { credential } = req.body; // Google ID token from @react-oauth/google
        if (!credential)
            return res.status(400).json({ success: false, message: 'Google credential required' });

        // Verify Google ID token
        const ticket = await googleClient.verifyIdToken({
            idToken:  credential,
            audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, picture, sub: googleId } = payload;

        if (!email)
            return res.status(400).json({ success: false, message: 'Google account has no email' });

        // Find or create user (Google users have no password)
        let user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            user = await User.create({
                username: name || email.split('@')[0],
                email:    email.toLowerCase(),
                password: await bcrypt.hash(`google_oauth_${googleId}_${PEPPER}`, 10), // placeholder hash
                image:    picture || '',
                googleId,
            });
        } else if (!user.googleId) {
            // Link Google to existing account
            user.googleId = googleId;
            if (!user.image && picture) user.image = picture;
            await user.save();
        }

        const token = signToken(user._id);
        res.json({ success: true, token, user: formatUser(user) });
    } catch (err) {
        console.error('Google auth error:', err.message);
        res.status(401).json({ success: false, message: 'Google authentication failed' });
    }
};

// ─── POST /api/auth/google/access ────────────────────────────
// Implicit flow: frontend sends Google userinfo (verified via access token)
export const googleAccess = async (req, res) => {
    try {
        const { googleId, email, name, picture } = req.body;
        if (!email || !googleId)
            return res.status(400).json({ success: false, message: 'Google account data required' });

        let user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            user = await User.create({
                username: name || email.split('@')[0],
                email:    email.toLowerCase(),
                password: await bcrypt.hash(`google_${googleId}_${PEPPER}`, 10),
                image:    picture || '',
                googleId,
            });
        } else if (!user.googleId) {
            user.googleId = googleId;
            if (!user.image && picture) user.image = picture;
            await user.save();
        }

        const token = signToken(user._id);
        res.json({ success: true, token, user: formatUser(user) });
    } catch (err) {
        console.error('Google access error:', err.message);
        res.status(500).json({ success: false, message: 'Google sign-in failed' });
    }
};

// ─── GET /api/auth/me (protected) ────────────────────────────
export const getMe = async (req, res) => {
    try {
        res.json({
            success: true,
            user: {
                ...formatUser(req.user),
                recentSearchedCities: req.user.recentSearchedCities,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
