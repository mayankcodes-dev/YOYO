import bcrypt    from 'bcryptjs';
import jwt        from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User       from '../models/User.js';
import { ok, fail } from '../utils/respond.js';

// ─── Config ───────────────────────────────────────────────────
const {
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  PASSWORD_PEPPER,
  GOOGLE_CLIENT_ID,
  NODE_ENV,
} = process.env;

// SESSION POLICY:
//   Access token  → 6 hours (hard session duration)
//   Refresh token → 7 days  (stored in httpOnly cookie for silent re-login)
//   Client-side   → also tracks issuedAt so it can hard-expire at 6h even
//                   if the server refresh cookie is still valid.
const ACCESS_EXPIRES  = '6h';
const REFRESH_EXPIRES = '7d';
const REFRESH_COOKIE  = 'yoyo_refresh';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// ─── Token helpers ─────────────────────────────────────────────
const signAccess  = (id) => jwt.sign({ id }, JWT_SECRET,         { expiresIn: ACCESS_EXPIRES });
const signRefresh = (id) => jwt.sign({ id }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });

const setRefreshCookie = (res, token) =>
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure:   NODE_ENV === 'production',
    sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path:     '/api/auth',
  });

const clearRefreshCookie = (res) =>
  res.clearCookie(REFRESH_COOKIE, { httpOnly: true, path: '/api/auth' });

// ─── Public user shape — never leak password/googleId ─────────
const fmt = (u) => ({
  _id:      u._id,
  username: u.username,
  email:    u.email,
  role:     u.role,
  image:    u.image,
  phone:    u.phone,
});

// ─── Google OAuth — find, create, or merge user ────────────────
//
// Logic:
//   1. Look up user by googleId first (fastest path — returning Google user)
//   2. Look up by email (handles: JWT user logging in via Google for first time)
//      → If found, link the googleId to their account (account merging)
//   3. If no match at all → create a new Google-only user (no password needed)
//
const _googleFindOrCreate = async ({ email, name, picture, googleId }) => {
  const emailLower = email.toLowerCase().trim();

  // Fast path — already linked Google user
  let user = await User.findOne({ googleId });
  if (user) return user;

  // Merge path — existing JWT account with same email
  user = await User.findOne({ email: emailLower });
  if (user) {
    let dirty = false;
    if (!user.googleId)         { user.googleId = googleId; dirty = true; }
    if (!user.image && picture) { user.image    = picture;  dirty = true; }
    if (dirty) await user.save({ validateModifiedOnly: true });
    return user;
  }

  // New Google-only user — no password required (schema now allows it)
  return User.create({
    username: name || emailLower.split('@')[0],
    email:    emailLower,
    // No password — Google-only account. The login controller checks
    // user?.password before comparing, so this user simply can't log in via
    // the email+password flow (which is correct and intentional).
    image:    picture || '',
    googleId,
  });
};

// ─── POST /api/auth/register ───────────────────────────────────
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username?.trim() || !email?.trim() || !password)
      return fail(res, 'All fields required');

    if (password.length < 8)
      return fail(res, 'Password must be at least 8 characters');

    const emailLower = email.toLowerCase().trim();
    const exists = await User.findOne({ email: emailLower });
    if (exists) return fail(res, 'Email already registered', 409);

    const hashed = await bcrypt.hash(password + PASSWORD_PEPPER, 12);
    const user   = await User.create({
      username: username.trim(),
      email:    emailLower,
      password: hashed,
    });

    const accessToken  = signAccess(user._id);
    const refreshToken = signRefresh(user._id);
    setRefreshCookie(res, refreshToken);

    return res.status(201).json({ success: true, token: accessToken, user: fmt(user) });
  } catch (err) {
    console.error('[register]', err.message);
    return fail(res, 'Registration failed', 500);
  }
};

// ─── POST /api/auth/login ──────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) return fail(res, 'Email and password required');

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    // user.password may be null/undefined if this is a Google-only account
    if (!user?.password) {
      return fail(res, 'This account was created with Google. Please sign in with Google.', 401);
    }

    const valid = await bcrypt.compare(password + PASSWORD_PEPPER, user.password);
    if (!valid) return fail(res, 'Invalid credentials', 401);

    const accessToken  = signAccess(user._id);
    const refreshToken = signRefresh(user._id);
    setRefreshCookie(res, refreshToken);

    return ok(res, { token: accessToken, user: fmt(user) });
  } catch (err) {
    console.error('[login]', err.message);
    return fail(res, 'Login failed', 500);
  }
};

// ─── POST /api/auth/google ─────────────────────────────────────
// Receives a Google ID token from @react-oauth/google credential flow
export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return fail(res, 'Google credential required');

    const ticket  = await googleClient.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload?.email) return fail(res, 'Google account has no email');

    const { email, name, picture, sub: googleId } = payload;
    const user = await _googleFindOrCreate({ email, name, picture, googleId });

    const accessToken  = signAccess(user._id);
    const refreshToken = signRefresh(user._id);
    setRefreshCookie(res, refreshToken);

    return ok(res, { token: accessToken, user: fmt(user) });
  } catch (err) {
    console.error('[googleAuth]', err.message);
    return fail(res, 'Google authentication failed', 401);
  }
};

// ─── POST /api/auth/google/access ─────────────────────────────
// Receives raw Google userinfo from the implicit / access-token flow.
// Used by the client's useGoogleLogin hook.
export const googleAccess = async (req, res) => {
  try {
    const { googleId, email, name, picture } = req.body;
    if (!email || !googleId) return fail(res, 'Google account data required');

    const user = await _googleFindOrCreate({ email, name, picture, googleId });
    if (!user?._id) return fail(res, 'Google sign-in failed', 500);

    const accessToken  = signAccess(user._id);
    const refreshToken = signRefresh(user._id);
    setRefreshCookie(res, refreshToken);

    return ok(res, { token: accessToken, user: fmt(user) });
  } catch (err) {
    console.error('[googleAccess]', err.message, err.stack);
    return fail(res, 'Google sign-in failed', 500);
  }
};

// ─── POST /api/auth/refresh ────────────────────────────────────
// Client sends the httpOnly cookie; we verify and issue a new 6h access token.
// Note: the client hard-expires the session at 6h via localStorage issuedAt,
// so this endpoint is only reachable if the user's tab is still open and active.
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) return fail(res, 'No refresh token', 401);

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    } catch {
      clearRefreshCookie(res);
      return fail(res, 'Refresh token invalid or expired', 401);
    }

    const user = await User.findById(decoded.id).lean();
    if (!user) {
      clearRefreshCookie(res);
      return fail(res, 'User not found', 401);
    }

    // Rotate refresh token on every use (refresh token rotation)
    const newAccess  = signAccess(user._id);
    const newRefresh = signRefresh(user._id);
    setRefreshCookie(res, newRefresh);

    return ok(res, { token: newAccess, user: fmt(user) });
  } catch (err) {
    console.error('[refreshToken]', err.message);
    return fail(res, 'Token refresh failed', 500);
  }
};

// ─── POST /api/auth/logout ─────────────────────────────────────
export const logout = (_req, res) => {
  clearRefreshCookie(res);
  return ok(res, { message: 'Signed out' });
};

// ─── GET /api/auth/me  (protected) ────────────────────────────
export const getMe = async (req, res) => {
  try {
    return ok(res, { user: { ...fmt(req.user), recentSearchedCities: req.user.recentSearchedCities } });
  } catch (err) {
    return fail(res, err.message, 500);
  }
};
