/**
 * redis.js — Upstash Redis via REST API (@upstash/redis)
 *
 * Why REST instead of ioredis (TCP)?
 *   Lambda cold starts + ioredis TLS TCP handshake = 30s+ timeout.
 *   Upstash REST client uses plain HTTPS — connects in ~50ms, no persistent
 *   socket, perfect for serverless.
 *
 * Used by:
 *   • viewersController.js — live viewer counts per room
 */

import { Redis } from '@upstash/redis';

let _client = null;

/**
 * Returns a singleton Upstash Redis REST client.
 * Returns null (gracefully) when env vars are missing.
 */
export const getRedisClient = () => {
    if (_client) return _client;

    const url   = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
        console.warn('[Redis] ⚠️  UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set — Redis disabled');
        return null;
    }

    _client = new Redis({ url, token });
    return _client;
};

export default { getRedisClient };
