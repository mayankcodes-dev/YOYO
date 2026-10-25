/**
 * LiveViewers.jsx — "X people viewing this room right now" badge
 *
 * Option B: Upstash Redis HTTP polling (Lambda-compatible, no WebSocket)
 *
 * Lifecycle:
 *   1. On mount    → POST /api/rooms/:id/viewers/join  (INCR in Redis, TTL 90s)
 *      BUT only if this browser tab has not already joined this room in this session.
 *      sessionStorage key prevents double-counting on in-app navigations / React
 *      StrictMode double-mount. If the user hard-refreshes, sessionStorage is cleared
 *      so the join fires exactly once per actual page load — which is correct.
 *   2. Every 10 s  → GET  /api/rooms/:id/viewers       (refresh count)
 *   3. On unmount  → POST /api/rooms/:id/viewers/leave (DECR in Redis, clamped ≥ 0)
 *
 * If the backend is unavailable, the badge silently shows "Be the first to book"
 * — it never throws or breaks the page.
 */
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const POLL_MS  = 10_000; // 10 seconds
const SK = (id) => `viewers_joined_${id}`; // sessionStorage key

const LiveViewers = ({ roomId }) => {
    const [count, setCount] = useState(0);
    const intervalRef = useRef(null);
    const joinedRef   = useRef(false);

    useEffect(() => {
        if (!roomId) return;

        // ── 1. Join: only once per tab session ───────────────────────
        const alreadyJoined = sessionStorage.getItem(SK(roomId));
        if (!alreadyJoined) {
            axios.post(`/api/rooms/${roomId}/viewers/join`)
                .then(({ data }) => {
                    if (data?.success) setCount(data.count ?? 0);
                    joinedRef.current = true;
                    sessionStorage.setItem(SK(roomId), '1');
                })
                .catch(() => {}); // graceful — badge stays at 0
        } else {
            // Tab already joined — just fetch current count without incrementing
            joinedRef.current = true;
            axios.get(`/api/rooms/${roomId}/viewers`)
                .then(({ data }) => { if (data?.success) setCount(data.count ?? 0); })
                .catch(() => {});
        }

        // ── 2. Poll: refresh count every 10 s ────────────────────────
        const fetchCount = () =>
            axios.get(`/api/rooms/${roomId}/viewers`)
                .then(({ data }) => { if (data?.success) setCount(data.count ?? 0); })
                .catch(() => {});

        intervalRef.current = setInterval(fetchCount, POLL_MS);

        // ── 3. Leave: decrement on tab/window close ───────────────────
        return () => {
            clearInterval(intervalRef.current);
            if (joinedRef.current) {
                sessionStorage.removeItem(SK(roomId));
                // Use sendBeacon so the request survives page unload
                const base = axios.defaults.baseURL || '';
                const url  = `${base}/api/rooms/${roomId}/viewers/leave`;
                if (navigator.sendBeacon) {
                    navigator.sendBeacon(url);
                } else {
                    axios.post(url).catch(() => {});
                }
            }
        };
    }, [roomId]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold select-none"
            style={{
                background: count > 0
                    ? 'rgba(232,0,61,0.10)'
                    : 'rgba(120,120,160,0.09)',
                border: count > 0
                    ? '1px solid rgba(232,0,61,0.22)'
                    : '1px solid rgba(120,120,160,0.18)',
                color: count > 0
                    ? '#E8003D'
                    : 'var(--color-text-muted)',
            }}
            title="Live viewers on this page right now"
        >
            {/* Pulsing live dot — animated only when viewers > 0 */}
            <span className="relative flex h-2 w-2 shrink-0">
                {count > 0 && (
                    <span
                        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                        style={{ background: '#E8003D' }}
                    />
                )}
                <span
                    className="relative inline-flex rounded-full h-2 w-2"
                    style={{ background: count > 0 ? '#E8003D' : 'var(--color-text-muted)' }}
                />
            </span>

            {count === 0
                ? 'Be the first to book'
                : count === 1
                    ? '1 person viewing right now'
                    : `${count} people viewing right now`
            }
        </motion.div>
    );
};

export default LiveViewers;
