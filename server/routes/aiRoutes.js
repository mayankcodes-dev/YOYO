import express    from 'express';
import rateLimit  from 'express-rate-limit';
import { aiChat, parseSearch, reviewSummary } from '../controllers/aiController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

// 30 messages/min per IP — prevent Gemini credit abuse
const chatLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    message: { success: false, reply: 'Slow down! Too many messages. Please wait a moment.' },
});

// 20 NLP queries/min per IP
const searchLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    message: { success: false, message: 'Too many search requests.' },
});

const aiRouter = express.Router();

// M-7 FIX: optionalAuth sets req.user when a valid token is present (without
// rejecting anonymous visitors). The controller no longer reads userId from req.body.
aiRouter.post('/chat',                     chatLimiter,   optionalAuth, aiChat);
aiRouter.post('/parse-search',             searchLimiter, parseSearch);
aiRouter.get( '/review-summary/:hotelId',                reviewSummary);

export default aiRouter;
