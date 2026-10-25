import express from 'express';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import {
  register,
  login,
  googleAuth,
  googleAccess,
  refreshToken,
  logout,
  getMe,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const authRouter = express.Router();

// ─── Auth rate limiter — 10 attempts per 15 min per IP ────────
const authLimit = rateLimit({
  windowMs:      15 * 60 * 1000,
  max:           10,
  message:       { success: false, message: 'Too many requests, please try again in 15 minutes' },
  standardHeaders: true,
  legacyHeaders:   false,
});

// ─── Validation rules ─────────────────────────────────────────
const registerRules = [
  body('username').trim().notEmpty().withMessage('Name required').isLength({ max: 60 }),
  body('email').normalizeEmail().isEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be ≥ 8 characters')
    .matches(/[A-Z]/).withMessage('Must contain an uppercase letter')
    .matches(/[0-9]/).withMessage('Must contain a number'),
];

const loginRules = [
  body('email').normalizeEmail().isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
];

// Returns 422 with the first validation error message
const validate = (req, res, next) => {
  const errs = validationResult(req);
  if (!errs.isEmpty())
    return res.status(422).json({ success: false, message: errs.array()[0].msg });
  next();
};

// ─── Routes ───────────────────────────────────────────────────
authRouter.post('/register',      authLimit, registerRules, validate, register);
authRouter.post('/login',         authLimit, loginRules,    validate, login);
authRouter.post('/google',        authLimit, googleAuth);          // ID-token flow
authRouter.post('/google/access', authLimit, googleAccess);        // Implicit / access-token flow
authRouter.post('/refresh',       refreshToken);                   // Refresh access token (uses httpOnly cookie)
authRouter.post('/logout',        logout);                         // Clear refresh cookie
authRouter.get('/me',             protect, getMe);                 // Fetch current user

export default authRouter;
