/**
 * usePWAInstall.js
 *
 * Singleton hook for the PWA install prompt.
 *
 * The browser fires `beforeinstallprompt` once. If multiple components each try
 * to capture it with their own event listeners, only the first one wins and the
 * others get nothing. This hook solves that by storing the deferred prompt in
 * a module-level singleton (`window.__yoyoPwaPrompt`) so every subscriber
 * gets the same reference.
 *
 * Usage:
 *   const { isInstalled, isIOS, isAndroid, deferredPrompt, triggerInstall } = usePWAInstall();
 *
 * Returns:
 *   isInstalled    — true if running in standalone PWA mode
 *   isIOS          — true if on iOS Safari (needs manual install steps)
 *   isAndroid      — true if on Android Chrome / Samsung Browser
 *   deferredPrompt — the BeforeInstallPromptEvent or null
 *   triggerInstall — async fn; calls prompt() and returns 'accepted'|'dismissed'|'ios'|'unavailable'
 */

import { useState, useEffect, useCallback } from 'react';

// ── Module-level singleton ────────────────────────────────────────
// Stores the deferred prompt so it survives component unmounts and
// is shared across every usePWAInstall() subscriber.
let _deferredPrompt = null;
const _listeners    = new Set();

function _notify() {
  _listeners.forEach(fn => fn(_deferredPrompt));
}

// Attach the beforeinstallprompt listener once at module load time
// (before any component mounts) so we never miss it.
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    _deferredPrompt = e;
    _notify();
  });

  // When the user installs the app via the browser's own UI (e.g. address bar),
  // clear the prompt so we don't show a stale "Install" button.
  window.addEventListener('appinstalled', () => {
    _deferredPrompt = null;
    _notify();
  });
}

// ── Detectors ────────────────────────────────────────────────────
const _isStandalone = () =>
  ('standalone' in window.navigator && window.navigator.standalone) ||
  window.matchMedia('(display-mode: standalone)').matches;

const _isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) &&
  !window.MSStream &&
  !/CriOS|FxiOS|EdgiOS/.test(navigator.userAgent); // Exclude Chrome/Firefox/Edge on iOS

const _isAndroid = () => /android/i.test(navigator.userAgent);

// ── Hook ─────────────────────────────────────────────────────────
const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(_deferredPrompt);
  const [isInstalled,    setIsInstalled]    = useState(_isStandalone);

  // Subscribe to prompt updates (e.g. when the event fires after mount)
  useEffect(() => {
    const handler = (prompt) => setDeferredPrompt(prompt);
    _listeners.add(handler);
    // Sync immediately in case the event already fired
    setDeferredPrompt(_deferredPrompt);
    return () => _listeners.delete(handler);
  }, []);

  // Listen for standalone mode change (install completed)
  useEffect(() => {
    const mq = window.matchMedia('(display-mode: standalone)');
    const handler = (e) => setIsInstalled(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const triggerInstall = useCallback(async () => {
    // iOS — can't trigger programmatically; caller should show manual steps
    if (_isIOS()) return 'ios';

    if (!_deferredPrompt) return 'unavailable';

    _deferredPrompt.prompt();
    const { outcome } = await _deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
      _deferredPrompt = null;
      _notify();
    }
    return outcome; // 'accepted' | 'dismissed'
  }, []);

  return {
    isInstalled,
    isIOS:          _isIOS(),
    isAndroid:      _isAndroid(),
    deferredPrompt,
    triggerInstall,
  };
};

export default usePWAInstall;
