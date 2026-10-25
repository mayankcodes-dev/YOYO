import mongoose from 'mongoose';

// ── Connection state cache (survives across serverless warm invocations) ───
let cached = global._mongooseConnection;
if (!cached) {
    cached = global._mongooseConnection = { conn: null, promise: null, retries: 0 };
}

// ── Mongoose global settings ────────────────────────────────────────────────
mongoose.set('strictQuery', false);

// ── Connection options optimised for MongoDB Atlas + Vercel serverless ──────
const MONGO_OPTIONS = {
    // Timeouts
    serverSelectionTimeoutMS: 10000,   // fail fast if Atlas is unreachable
    connectTimeoutMS:         10000,
    socketTimeoutMS:          45000,

    // Connection pool (keep alive across serverless warm requests)
    maxPoolSize:              10,
    minPoolSize:              1,
    maxIdleTimeMS:            270000,  // 4.5 min — below Atlas 5 min idle cutoff

    // Heartbeat — prevents idle connection drops
    heartbeatFrequencyMS:     10000,

    // Don't buffer ops while reconnecting (fail fast, don't hang)
    bufferCommands:           false,

    // Auto-reconnect
    retryWrites:              true,
    retryReads:               true,
};

const MAX_RETRIES = 5;

const connectDB = async () => {
    // ── 1. Reuse healthy existing connection ────────────────────
    if (cached.conn) {
        const state = mongoose.connection.readyState;
        // 1 = connected, 2 = connecting — both are usable
        if (state === 1 || state === 2) return cached.conn;
        // Otherwise fall through and reconnect
        cached.conn    = null;
        cached.promise = null;
    }

    // ── 2. Retry loop ───────────────────────────────────────────
    while (cached.retries <= MAX_RETRIES) {
        if (!cached.promise) {
            const uri = process.env.MONGODB_URL;
            if (!uri) throw new Error('MONGODB_URL environment variable is not set');

            console.log(`[DB] Connecting to MongoDB… (attempt ${cached.retries + 1}/${MAX_RETRIES + 1})`);

            cached.promise = mongoose
                .connect(uri, MONGO_OPTIONS)
                .then((m) => {
                    cached.retries = 0;
                    console.log('[DB] ✅ MongoDB connected successfully');

                    // ── Event listeners (attach once) ─────────────
                    const conn = m.connection;

                    conn.off('disconnected', onDisconnect); // prevent duplicate listeners
                    conn.on('disconnected', onDisconnect);

                    conn.off('error', onError);
                    conn.on('error', onError);

                    conn.off('reconnected', onReconnect);
                    conn.on('reconnected', onReconnect);

                    return m;
                });
        }

        try {
            cached.conn = await cached.promise;
            return cached.conn;
        } catch (err) {
            cached.promise = null;
            cached.retries += 1;

            if (cached.retries > MAX_RETRIES) {
                cached.retries = 0;
                console.error('[DB] ❌ All reconnect attempts failed:', err.message);
                throw err;
            }

            const delay = Math.min(1000 * 2 ** cached.retries, 16000); // exponential back-off, max 16s
            console.warn(`[DB] ⚠️  Connection failed. Retrying in ${delay / 1000}s… (${err.message})`);
            await new Promise((r) => setTimeout(r, delay));
        }
    }
};

// ── Event handlers ──────────────────────────────────────────────────────────
function onDisconnect() {
    console.warn('[DB] ⚡ MongoDB disconnected. Clearing cache so next request reconnects.');
    cached.conn    = null;
    cached.promise = null;
}

function onError(err) {
    console.error('[DB] MongoDB error:', err.message);
    cached.conn    = null;
    cached.promise = null;
}

function onReconnect() {
    console.log('[DB] ✅ MongoDB reconnected successfully');
}

export default connectDB;