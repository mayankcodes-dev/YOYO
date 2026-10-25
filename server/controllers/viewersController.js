/**
 * viewersController.js — Live viewer count per room via Upstash Redis
 *
 * Strategy: HTTP polling (Option B)
 *   • Each browser tab calls POST /join on mount  → Redis INCR roomId TTL 90s
 *   • Each browser tab calls POST /leave on unmount → Redis DECR (floor 0)
 *   • Client polls GET /count every 10 s to refresh badge
 *
 * Key design choices:
 *   1. TTL auto-expires stale counts when tabs crash without firing /leave
 *   2. DECR is clamped to 0 — no negative counts
 *   3. No auth required — anonymous viewers count too
 *   4. On Redis unavailability, falls back to count=0 gracefully (never 500)
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
        res.json({ success: true, count: 0 }); // degrade gracefully
    }
};

/** POST /api/rooms/:id/viewers/join — increment (called on component mount) */
export const joinRoom = async (req, res) => {
    try {
        const redis = getRedisClient();
        if (!redis) return res.json({ success: true, count: 0 });

        const key = KEY(req.params.id);
        // INCR + EXPIRE in a pipeline — atomic, no race
        const [[, count]] = await redis.pipeline()
            .incr(key)
            .expire(key, TTL_S)
            .exec();

        res.json({ success: true, count: Math.max(0, count) });
    } catch (err) {
        console.warn('[Viewers] joinRoom error:', err.message);
        res.json({ success: true, count: 0 });
    }
};

/** POST /api/rooms/:id/viewers/leave — decrement (called on component unmount) */
export const leaveRoom = async (req, res) => {
    try {
        const redis = getRedisClient();
        if (!redis) return res.json({ success: true, count: 0 });

        const key = KEY(req.params.id);
        // Lua script: DECR but clamp to 0
        const script = `
            local v = redis.call('get', KEYS[1])
            if not v or tonumber(v) <= 0 then return 0 end
            return redis.call('decr', KEYS[1])
        `;
        const count = await redis.eval(script, 1, key);
        res.json({ success: true, count: Math.max(0, count) });
    } catch (err) {
        console.warn('[Viewers] leaveRoom error:', err.message);
        res.json({ success: true, count: 0 });
    }
};
