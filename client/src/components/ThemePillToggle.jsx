import { motion } from "framer-motion";

/**
 * Pill-style theme toggle  — matches the attached design reference.
 * The active icon gets a circular highlight; both sit inside a
 * rounded-pill container border.
 */
const ThemePillToggle = ({ darkMode, toggleDarkMode }) => (
  <div
    role="group"
    aria-label="Toggle theme"
    className="flex items-center"
    style={{
      borderRadius: "999px",
      border: darkMode
        ? "1.5px solid rgba(255,255,255,0.13)"
        : "1.5px solid rgba(0,0,0,0.13)",
      padding: "3px",
      gap: "2px",
      background: darkMode
        ? "rgba(255,255,255,0.04)"
        : "rgba(0,0,0,0.03)",
      flexShrink: 0,
    }}
  >
    {/* ── Sun — light mode ─────────────── */}
    <motion.button
      onClick={() => darkMode && toggleDarkMode()}
      aria-label="Light mode"
      aria-pressed={!darkMode}
      whileTap={{ scale: 0.88 }}
      className="flex items-center justify-center w-9 h-9 rounded-full"
      style={{
        background: !darkMode ? "#fff" : "transparent",
        boxShadow: !darkMode ? "0 1px 4px rgba(0,0,0,0.14)" : "none",
        transition: "background 0.2s, box-shadow 0.2s",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        className="w-[18px] h-[18px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: !darkMode ? "#111" : "rgba(140,140,155,0.75)" }}
      >
        <circle
          cx="12" cy="12" r="4"
          fill={!darkMode ? "#111" : "none"}
          stroke={!darkMode ? "#111" : "currentColor"}
        />
        <line x1="12" y1="2"    x2="12" y2="4"    />
        <line x1="12" y1="20"   x2="12" y2="22"   />
        <line x1="4.93" y1="4.93"  x2="6.34" y2="6.34"  />
        <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
        <line x1="2"  y1="12"   x2="4"  y2="12"   />
        <line x1="20" y1="12"   x2="22" y2="12"   />
        <line x1="4.93" y1="19.07"  x2="6.34" y2="17.66"  />
        <line x1="17.66" y1="6.34"  x2="19.07" y2="4.93"  />
      </svg>
    </motion.button>

    {/* ── Moon — dark mode ─────────────── */}
    <motion.button
      onClick={() => !darkMode && toggleDarkMode()}
      aria-label="Dark mode"
      aria-pressed={darkMode}
      whileTap={{ scale: 0.88 }}
      className="flex items-center justify-center w-9 h-9 rounded-full"
      style={{
        background: darkMode ? "rgba(55,55,65,0.92)" : "transparent",
        boxShadow: darkMode ? "0 1px 6px rgba(0,0,0,0.32)" : "none",
        transition: "background 0.2s, box-shadow 0.2s",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        className="w-[17px] h-[17px]"
        fill="currentColor"
        style={{ color: darkMode ? "rgba(210,210,230,0.92)" : "rgba(130,130,155,0.6)" }}
      >
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    </motion.button>
  </div>
);

export default ThemePillToggle;
