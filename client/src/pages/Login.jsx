import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

// ── Google Icon ───────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// ── XSS-safe input sanitizer (strips HTML tags before send) ──
const sanitize = (str) => str.replace(/<[^>]*>/g, '').trim();

const Login = () => {
  const { login, googleLogin, navigate } = useAppContext();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // ── Email/password login ────────────────────────────────────
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(sanitize(form.email), form.password);
      toast.success('Welcome back! 👋');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Google OAuth login ──────────────────────────────────────
  // @react-oauth/google gives us the credential (ID token) directly
  const handleGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGLoading(true);
      try {
        // Exchange Google access_token for user info (implicit flow)
        // Then send to our backend which verifies and issues JWT
        const { data: gUser } = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );
        // Create a "credential" our backend can verify — we'll send sub as identifier
        // Backend uses /api/auth/google endpoint
        const { data } = await axios.post('/api/auth/google/access', {
          googleId: gUser.sub,
          email:    gUser.email,
          name:     gUser.name,
          picture:  gUser.picture,
        });
        if (data.success) {
          // Manually save session (same as googleLogin helper)
          await googleLogin(null, data); // pass pre-fetched data
          toast.success(`Welcome, ${gUser.name}! 🎉`);
          navigate('/');
        } else {
          toast.error(data.message || 'Google login failed');
        }
      } catch (err) {
        toast.error('Google sign-in failed. Try again.');
      } finally {
        setGLoading(false);
      }
    },
    onError: () => toast.error('Google sign-in cancelled'),
    flow: 'implicit',
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-surface)' }}>
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #E8003D 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full opacity-8 blur-3xl"
          style={{ background: 'radial-gradient(circle, #6C3BD5 0%, transparent 70%)' }} />
        <div className="absolute top-3/4 left-1/2 w-64 h-64 rounded-full opacity-5 blur-3xl"
          style={{ background: 'radial-gradient(circle, #0EA5E9 0%, transparent 70%)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="rounded-2xl p-8 shadow-2xl"
          style={{
            background: 'rgba(16,16,28,0.90)',
            backdropFilter: 'blur(28px)',
            border: '1px solid rgba(255,255,255,0.09)',
            boxShadow: '0 32px 64px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(255,255,255,0.05) inset',
          }}>

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link to="/">
              <span className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-white text-2xl"
                style={{
                  background: '#E8003D',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                  boxShadow: '0 4px 16px rgba(232,0,61,0.45)',
                }}>
                YoYo
              </span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-1">Welcome back</h1>
          <p className="text-center text-sm mb-6" style={{ color: 'rgba(255,255,255,0.40)' }}>Sign in to continue</p>

          {/* Google Button */}
          <button
            onClick={handleGoogle}
            disabled={gLoading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 mb-5"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.85)',
            }}
          >
            {gLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : <GoogleIcon />}
            {gLoading ? 'Connecting…' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.30)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Email/password form */}
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.50)' }}>
                Email
              </label>
              <input
                name="email" type="email" required
                value={form.email} onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                maxLength={254}
                className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  caretColor: '#E8003D',
                }}
                onFocus={e => { e.target.style.border = '1px solid rgba(232,0,61,0.60)'; e.target.style.boxShadow = '0 0 0 3px rgba(232,0,61,0.10)'; }}
                onBlur={e =>  { e.target.style.border = '1px solid rgba(255,255,255,0.09)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.50)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  name="password" type={showPass ? 'text' : 'password'} required
                  value={form.password} onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  maxLength={128}
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-white outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    caretColor: '#E8003D',
                  }}
                  onFocus={e => { e.target.style.border = '1px solid rgba(232,0,61,0.60)'; e.target.style.boxShadow = '0 0 0 3px rgba(232,0,61,0.10)'; }}
                  onBlur={e =>  { e.target.style.border = '1px solid rgba(255,255,255,0.09)'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                  style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg,#E8003D 0%,#B5002E 100%)',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(232,0,61,0.35)',
              }}
            >
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </span>
                : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            No account?{' '}
            <Link to="/register" className="font-semibold transition hover:opacity-80" style={{ color: '#E8003D' }}>
              Create one free
            </Link>
          </p>

          {/* Demo credentials */}
          <details className="mt-5">
            <summary className="text-xs cursor-pointer font-semibold" style={{ color: 'rgba(255,255,255,0.30)' }}>
              🔑 Demo owner credentials
            </summary>
            <div className="mt-2 rounded-xl p-3 text-xs space-y-1"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {[
                { name: 'Arjun — Udaipur', email: 'arjun@yoyo.in' },
                { name: 'Priya — Goa',     email: 'priya@yoyo.in' },
                { name: 'Vikram — Manali', email: 'vikram@yoyo.in' },
              ].map(o => (
                <button key={o.email}
                  onClick={() => setForm({ email: o.email, password: 'Password@123' })}
                  className="block w-full text-left px-2 py-1 rounded-lg hover:bg-white/5 transition"
                  style={{ color: 'rgba(255,255,255,0.55)' }}>
                  <span className="font-semibold">{o.name}</span>
                  <span className="ml-2 opacity-60">{o.email}</span>
                </button>
              ))}
              <p className="px-2 pt-1 opacity-50">Password: <strong>Password@123</strong></p>
            </div>
          </details>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
