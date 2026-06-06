import express from 'express';
import { register, login, googleAuth, googleAccess, getMe } from '../controllers/authController.js';
import protect from '../middleware/authMiddleware.js';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';

const authRouter = express.Router();

// ─── Rate limiter — 10 auth attempts per 15 min per IP ────────
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { success: false, message: 'Too many requests, please try again in 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

// ─── Input validation chains ──────────────────────────────────
const registerRules = [
    body('username').trim().notEmpty().withMessage('Name required').isLength({ max: 60 }),
    body('email').normalizeEmail().isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be ≥ 8 characters')
        .matches(/[A-Z]/).withMessage('Must contain uppercase')
        .matches(/[0-9]/).withMessage('Must contain a number'),
];

const loginRules = [
    body('email').normalizeEmail().isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
];

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(422).json({ success: false, message: errors.array()[0].msg });
    next();
};

// ─── Routes ───────────────────────────────────────────────────
authRouter.post('/register',      authLimiter, registerRules, validate, register);
authRouter.post('/login',         authLimiter, loginRules,    validate, login);
authRouter.post('/google',        authLimiter, googleAuth);        // ID-token flow
authRouter.post('/google/access', authLimiter, googleAccess);      // access_token flow (implicit)
authRouter.get('/me',             protect, getMe);

export default authRouter;
