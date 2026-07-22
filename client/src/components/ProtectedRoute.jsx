/**
 * ProtectedRoute.jsx
 *
 * A reusable route guard component that wraps React Router <Outlet />.
 *
 * States handled:
 *  1. `user` is still loading (token exists in localStorage but syncUser hasn't resolved yet)
 *     → render a centered spinner; do NOT redirect yet
 *  2. `user` is null / not authenticated
 *     → <Navigate to="/login" state={{ from: location.pathname }} />
 *  3. `user` is authenticated but wrong role
 *     → redirect to "/" with a toast error
 *  4. `user` is authenticated and has the correct role
 *     → render <Outlet />
 *
 * Usage in App.jsx:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/my-bookings" element={<MyBookings />} />
 *   </Route>
 *
 *   <Route element={<ProtectedRoute requiredRole="hotelOwner" redirectTo="/" />}>
 *     <Route path="/owner" element={<Layout />}>…</Route>
 *   </Route>
 *
 *   <Route element={<ProtectedRoute requiredRole="admin" redirectTo="/" />}>
 *     <Route path="/admin" element={<AdminLayout />}>…</Route>
 *   </Route>
 */

import React, { useEffect, useRef } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';

// ── Inline spinner — no dependency on any design system ──────────
const GuardSpinner = () => (
  <div
    className="min-h-screen flex flex-col items-center justify-center gap-4"
    style={{ background: 'var(--color-surface)' }}
    aria-label="Loading…"
  >
    <div
      className="w-10 h-10 rounded-full border-4 animate-spin"
      style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-primary)' }}
    />
    <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
      Verifying access…
    </p>
  </div>
);

/**
 * @param {string|null}  requiredRole  — 'hotelOwner' | 'admin' | null (any authenticated user)
 * @param {string}       redirectTo    — where to send unauthorized users (default: '/')
 */
const ProtectedRoute = ({ requiredRole = null, redirectTo = '/' }) => {
  const { user, token } = useAppContext();
  const location = useLocation();

  // Track if we've shown the "access denied" toast so we only show it once
  const toastShownRef = useRef(false);

  // ── Case 1: We have a token but user hasn't been synced from server yet ──
  // This happens in the brief gap between app boot and the GET /api/user response.
  // We must NOT redirect yet — let syncUser complete first.
  if (token && !user) return <GuardSpinner />;

  // ── Case 2: No token + no user → not authenticated ───────────────────────
  if (!token && !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // ── Case 3: Authenticated but wrong role ─────────────────────────────────
  if (requiredRole && user?.role !== requiredRole) {
    // Show toast once so the user knows why they were redirected
    if (!toastShownRef.current) {
      toastShownRef.current = true;
      const msg =
        requiredRole === 'admin'
          ? 'Admin access required.'
          : requiredRole === 'hotelOwner'
          ? 'Hotel owner access required. Register your hotel first.'
          : 'Access denied.';
      // Use setTimeout so the toast fires after the redirect render cycle
      setTimeout(() => toast.error(msg, { id: 'access-denied' }), 50);
    }
    return <Navigate to={redirectTo} replace />;
  }

  // ── Case 4: All checks pass — render the protected content ───────────────
  return <Outlet />;
};

export default ProtectedRoute;
