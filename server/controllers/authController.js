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

const ACCESS_EXPIRES  = '15m';  // Short-lived access token
const REFRESH_EXPIRES = '7d';   // Long-lived refresh token (httpOnly cookie)
const REFRESH_COOKIE  = 'yoyo_refresh';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// ─── Token helpers ─────────────────────────────────────────────
const signAccess  = (id) => jwt.sign({ id }, JWT_SECRET,         { expiresIn: ACCESS_EXPIRES });
const signRefresh = (id) => jwt.sign({ id }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });

const setRefreshCookie = (res, token) =>
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure:   NODE_ENV === 'production',
    sameSite: NODE_ENV === 'production' ? 'strict' : 'lax',
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

// ─── Google OAuth — find or create user ───────────────────────
const _googleFindOrCreate = async ({ email, name, picture, googleId }) => {
  const emailLower = email.toLowerCase().trim();
  let user = await User.findOne({ email: emailLower });

  if (user) {
    let dirty = false;
    if (!user.googleId)         { user.googleId = googleId; dirty = true; }
    if (!user.image && picture) { user.image    = picture;  dirty = true; }
    if (dirty) await user.save({ validateModifiedOnly: true });
    return user;
  }

  // New Google user — generate a random secure password they will never use
  const gPass = await bcrypt.hash(`g_${googleId}_${PASSWORD_PEPPER}_${Date.now()}`, 10);
  return User.create({
    username: name || emailLower.split('@')[0],
    email:    emailLower,
    password: gPass,
    image:    picture || '',
    googleId,
  });
};

// ─── POST /api/auth/register ───────────────────────────────────
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Basic presence checks (express-validator handles format rules in route)
    if (!username?.trim() || !email?.trim() || !password)
      return fail(res, 'All fields required');

    if (password.length < 8)
      return fail(res, 'Password must be at least 8 characters');

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return fail(res, 'Email already registered', 409);

    const hashed = await bcrypt.hash(password + PASSWORD_PEPPER, 12);
    const user   = await User.create({
      username: username.trim(),
      email:    email.toLowerCase().trim(),
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
    if (!user?.password) return fail(res, 'Invalid credentials', 401);

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
// Receives raw Google userinfo from the implicit / access-token flow
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
// Client sends the httpOnly cookie; we verify and issue a new access token
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
