/**
 * viewersController.js — Live viewer count per room via Upstash Redis REST
 *
 * Uses @upstash/redis (HTTP) instead of ioredis (TCP) for Lambda compatibility.
 * TCP connections time out on cold start; REST calls complete in ~50ms.
 *
 * Strategy: HTTP polling (Option B)
 *   • Each browser tab calls POST /join on mount  → Redis INCR + EXPIRE 90s
 *   • Each browser tab calls POST /leave on unmount → Redis DECR clamped ≥ 0
 *   • Client polls GET /count every 10 s to refresh badge
 *
 * All endpoints degrade gracefully to count=0 when Redis is unavailable.
 */

import { getRedisClient } from '../configs/redis.js';

const KEY   = (roomId) => `viewers:${roomId}`;
const TTL_S = 90; // seconds — refreshed on each /join heartbeat

/** GET /api/rooms/:id/viewers — return current live count */
export const getViewerCount = async (req, res) => {
    try {
        const redis = getRedisClient();
        if (!redis) return res.json({ success: true, count: 0 });

        const raw = await redis.get(KEY(req.params.id));
        const count = Math.max(0, parseInt(raw ?? '0', 10));
        res.json({ success: true, count });
    } catch (err) {
        console.warn('[Viewers] getViewerCount error:', err.message);
        res.json({ success: true, count: 0 });
    }
};

/** POST /api/rooms/:id/viewers/join — increment (called on component mount) */
export const joinRoom = async (req, res) => {
    try {
        const redis = getRedisClient();
        if (!redis) return res.json({ success: true, count: 0 });

        const key   = KEY(req.params.id);
        // @upstash/redis: run INCR and EXPIRE in parallel (REST multi-call)
        const [count] = await Promise.all([
            redis.incr(key),
            redis.expire(key, TTL_S),
        ]);

        res.json({ success: true, count: Math.max(0, count) });
    } catch (err) {
        console.warn('[Viewers] joinRoom error:', err.message);
        res.json({ success: true, count: 0 });
    }
};

/** POST /api/rooms/:id/viewers/leave — decrement clamped ≥ 0 */
export const leaveRoom = async (req, res) => {
    try {
        const redis = getRedisClient();
        if (!redis) return res.json({ success: true, count: 0 });

        const key = KEY(req.params.id);
        // Lua script: DECR but clamp to 0 — @upstash/redis supports eval
        const count = await redis.eval(
            `local v = redis.call('get', KEYS[1])
             if not v or tonumber(v) <= 0 then return 0 end
             return redis.call('decr', KEYS[1])`,
            [key],   // KEYS
            [],      // ARGV
        );

        res.json({ success: true, count: Math.max(0, Number(count)) });
    } catch (err) {
        console.warn('[Viewers] leaveRoom error:', err.message);
        res.json({ success: true, count: 0 });
    }
};
