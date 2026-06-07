import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import connectDB from './configs/db.js';
import connectCloudinary from './configs/cloudinary.js';
import { stripeWebhooks } from './controllers/stripeWebhooks.js';
import authRouter    from './routes/authRoutes.js';
import userRouter    from './routes/userRoutes.js';
import hotelRouter   from './routes/hotelRoutes.js';
import roomRouter    from './routes/roomRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import reviewRouter  from './routes/reviewRoutes.js';
import adminRouter   from './routes/adminRoutes.js';

const app = express();

connectCloudinary();

// ═══════════════════════════════════════════════════════════
// SECURITY LAYER — applied before all routes
// ═══════════════════════════════════════════════════════════

// 1. Helmet: sets 14+ security HTTP headers (X-Content-Type, CSP, HSTS, etc.)
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow Cloudinary images
    contentSecurityPolicy: false, // disabled — we use a React SPA served separately
}));

// 2. CORS — restrict to known origins
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',');
app.use(cors({
    origin: (origin, cb) => {
        if (!origin || allowedOrigins.some(o => origin.startsWith(o.trim()))) cb(null, true);
        else cb(new Error('CORS: Origin not allowed'));
    },
    credentials: true,
}));

// 3. Global rate limiter — 200 req / 15 min per IP
app.use('/api', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Rate limit exceeded. Please slow down.' },
}));

// 4. Stripe webhook — must receive RAW body before json() middleware
app.post('/api/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// 5. Body parsing with size limit (prevents DoS via huge payloads)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 6. NoSQL Injection prevention — strips $ and . from req.body / query / params
app.use(mongoSanitize({
    replaceWith: '_', // replace operators instead of stripping completely (helps debug)
}));

// 7. HTTP Parameter Pollution prevention
app.use(hpp({
    whitelist: ['sort', 'filter', 'city', 'category', 'amenities'], // allow array params for filtering
}));

// ═══════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════
app.get('/api/health', async (_req, res) => {
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    res.json({
        status: 'ok',
        db: states[mongoose.connection.readyState],
        uptime: Math.floor(process.uptime()) + 's',
        timestamp: new Date().toISOString(),
    });
});

// ═══════════════════════════════════════════════════════════
// DATABASE — ensure connected before any /api route
// ═══════════════════════════════════════════════════════════
app.use('/api', async (_req, res, next) => {
    try { await connectDB(); next(); }
    catch { res.status(503).json({ success: false, message: 'Database temporarily unavailable' }); }
});

// ═══════════════════════════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════════════════════════
app.use('/api/auth',     authRouter);
app.use('/api/user',     userRouter);
app.use('/api/hotels',   hotelRouter);
app.use('/api/rooms',    roomRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/reviews',  reviewRouter);
app.use('/api/admin',    adminRouter);

// 404
app.use((_req, res) => res.status(404).json({ success: false, message: 'Endpoint not found' }));

// Global error handler — never leaks stack traces
app.use((err, _req, res, _next) => {
    console.error('[ERROR]', err.message);
    res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});

// ═══════════════════════════════════════════════════════════
// START
// ═══════════════════════════════════════════════════════════
const PORT = process.env.PORT || 3000;
connectDB()
    .then(() => app.listen(PORT, () => console.log(`🚀 YoYo server on port ${PORT}`)))
    .catch(() => process.exit(1));

export default app;