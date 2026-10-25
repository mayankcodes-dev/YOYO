/**
 * redis.js — Upstash Redis connection via ioredis
 *
 * Used by:
 *   • Socket.IO Redis adapter (pub/sub across instances)
 *   • Future: rate limiting, caching, session store
 *
 * Upstash requires TLS — we use rediss:// protocol.
 * Two separate clients are needed for the Socket.IO adapter (pub + sub).
 */

import Redis from 'ioredis';

const REDIS_URL = process.env.UPSTASH_REDIS_URL;

if (!REDIS_URL) {
    console.warn('[Redis] ⚠️  UPSTASH_REDIS_URL not set — Redis features disabled');
}

/**
 * Create a new ioredis client connected to Upstash.
 * Each call returns a FRESH client (needed for pub/sub — subscriber
 * client can't be shared with command client).
 */
export const createRedisClient = () => {
    if (!REDIS_URL) return null;

    const client = new Redis(REDIS_URL, {
        tls: { rejectUnauthorized: false },
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => Math.min(times * 200, 5000),
        lazyConnect: true,           // don't connect until first command / .connect()
        enableReadyCheck: true,
    });

    client.on('connect', () => console.log('[Redis] ✅ Connected'));
    client.on('error',   (err) => console.error('[Redis] ❌ Error:', err.message));

    return client;
};

/**
 * Singleton client for general commands (non pub/sub).
 * Lazy-inited on first import.
 */
let _defaultClient = null;

export const getRedisClient = () => {
    if (!_defaultClient) _defaultClient = createRedisClient();
    return _defaultClient;
};

export default { createRedisClient, getRedisClient };
