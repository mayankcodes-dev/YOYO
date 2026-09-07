/**
 * LiveViewers.jsx — "X people viewing this room right now" badge
 *
 * Currently hardcoded to 0 viewers.
 * TODO: Wire to Socket.IO when ready:
 *   - Connect to room:${roomId} channel
 *   - Listen for viewers:count events
 *   - Replace `count` state with live socket data
 */
import { motion } from 'framer-motion';

// ── HARDCODED — set to 0 until Socket.IO is wired up ─────────────────
const HARDCODED_COUNT = 0;

const LiveViewers = ({ roomId: _roomId }) => {
  const count = HARDCODED_COUNT;

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
      {/* Pulsing live dot — only animated when someone is watching */}
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
