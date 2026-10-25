/**
 * PWAInstallBanner.jsx
 *
 * A dismissible "Add to Home Screen" bottom-sheet banner.
 * Appears after a 3-second delay when the browser fires `beforeinstallprompt`.
 * Uses the shared `usePWAInstall` hook so it doesn't compete with AppBanner
 * for the deferred prompt event.
 *
 * Supports:
 *  - Android / Chrome / Edge / Samsung Browser → native install prompt
 *  - iOS Safari → manual instruction sheet
 *  - Already installed → hidden
 */
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import usePWAInstall from "../hooks/usePWAInstall";

const DISMISS_KEY = "yoyo_pwa_banner_dismissed";

const PWAInstallBanner = () => {
  const { isInstalled, isIOS, deferredPrompt, triggerInstall } = usePWAInstall();

  const [showBanner,   setShowBanner]   = useState(false);
  const [showIOSSheet, setShowIOSSheet] = useState(false);
  const [installing,   setInstalling]   = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    // Already installed or user dismissed this session
    if (isInstalled) return;
    if (sessionStorage.getItem(DISMISS_KEY)) return;

    if (isIOS) {
      // Show iOS banner after 4s delay so user can settle in
      timerRef.current = setTimeout(() => setShowBanner(true), 4000);
      return;
    }

    if (deferredPrompt) {
      // Show banner 3s after the prompt becomes available
      timerRef.current = setTimeout(() => setShowBanner(true), 3000);
    }

    return () => clearTimeout(timerRef.current);
  }, [isInstalled, isIOS, deferredPrompt]);

  const handleInstall = async () => {
    if (isIOS) { setShowIOSSheet(true); return; }
    setInstalling(true);
    try {
      const outcome = await triggerInstall();
      if (outcome === 'accepted') setShowBanner(false);
      if (outcome === 'unavailable') setShowIOSSheet(true); // Show manual hint as fallback
    } finally {
      setInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem(DISMISS_KEY, "1");
  };

  if (!showBanner) return null;

  return (
    <>
      {/* ── Main install banner ── */}
      <AnimatePresence>
        {showBanner && !showIOSSheet && (
          <motion.div
            key="install-banner"
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-[9990]"
          >
            <div
              className="rounded-2xl p-4 flex items-center gap-4"
              style={{
                background: "var(--color-surface-2)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.35), 0 4px 16px rgba(232,0,61,0.15)",
                border: "1px solid var(--color-border-strong)",
              }}
            >
              {/* App icon */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: "linear-gradient(135deg,#E8003D,#9B001F)" }}
              >
                🏨
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm leading-tight mb-0.5" style={{ color: "var(--color-text-primary)" }}>
                  Install YoYo Rooms
                </p>
                <p className="text-xs leading-snug" style={{ color: "var(--color-text-muted)" }}>
                  Add to home screen for fast, offline-ready access
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <button
                  onClick={handleDismiss}
                  aria-label="Dismiss install banner"
                  className="w-6 h-6 flex items-center justify-center rounded-full text-xs"
                  style={{ background: "var(--color-surface-3)", color: "var(--color-text-muted)" }}
                >
                  ✕
                </button>
                <button
                  onClick={handleInstall}
                  disabled={installing}
                  className="btn-primary text-xs py-2 px-4"
                >
                  {installing ? "Installing…" : isIOS ? "How to Install" : "Install"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── iOS instruction sheet ── */}
      <AnimatePresence>
        {showIOSSheet && (
          <motion.div
            key="ios-sheet"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9991] flex items-end justify-center"
            style={{ background: "rgba(0,0,0,0.60)", backdropFilter: "blur(6px)" }}
            onClick={() => setShowIOSSheet(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-t-3xl p-6 pb-10"
              style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}
            >
              {/* Handle */}
              <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: "var(--color-border-strong)" }} />

              <h2 className="font-bold text-xl mb-1" style={{ color: "var(--color-text-primary)" }}>
                Add to Home Screen
              </h2>
              <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
                Install YoYo Rooms on your iPhone/iPad in 2 steps:
              </p>

              {[
                { icon: "⬆️", text: "Tap the Share button at the bottom of Safari" },
                { icon: "➕", text: 'Scroll down and tap "Add to Home Screen"' },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-4 mb-4">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0"
                    style={{ background: "var(--color-surface-3)" }}
                  >
                    {step.icon}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                      Step {i + 1}
                    </p>
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                      {step.text}
                    </p>
                  </div>
                </div>
              ))}

              <button
                onClick={() => { setShowIOSSheet(false); setShowBanner(false); sessionStorage.setItem(DISMISS_KEY, "1"); }}
                className="btn-primary w-full justify-center mt-2"
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PWAInstallBanner;
