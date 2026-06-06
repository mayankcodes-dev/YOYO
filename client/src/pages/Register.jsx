import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.09 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const sanitize = (str) => str.replace(/<[^>]*>/g, '').trim();

const PASSWORD_RULES = /^(?=.*[A-Z])(?=.*[0-9]).{8,}$/;

const Register = () => {
  const { register, googleLogin, navigate } = useAppContext();
  const [form, setForm]       = useState({ username: '', email: '', password: '', confirm: '' });
  const [loading, setLoading]  = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirm)     return toast.error('Passwords do not match');
    if (!PASSWORD_RULES.test(form.password)) return toast.error('Password needs 8+ chars, 1 uppercase, 1 number');

    setLoading(true);
    try {
      await register(sanitize(form.username), sanitize(form.email), form.password);
      toast.success('Account created! Welcome to YoYo 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Google sign-up / sign-in (same endpoint — finds or creates)
  const handleGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGLoading(true);
      try {
        const { data: gUser } = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );
        const { data } = await axios.post('/api/auth/google/access', {
          googleId: gUser.sub,
          email:    gUser.email,
          name:     gUser.name,
          picture:  gUser.picture,
        });
        if (data.success) {
          await googleLogin(null, data);
          toast.success(`Welcome, ${gUser.name}! 🎉`);
          navigate('/');
        } else {
          toast.error(data.message || 'Google sign-up failed');
        }
      } catch {
        toast.error('Google sign-up failed. Try again.');
      } finally {
        setGLoading(false);
      }
    },
    onError: () => toast.error('Google sign-up cancelled'),
    flow: 'implicit',
  });

  const fields = [
    { name: 'username', type: 'text',     label: 'Full Name',        placeholder: 'Mayank Kumar', autoComplete: 'name',           maxLength: 60 },
    { name: 'email',    type: 'email',    label: 'Email',            placeholder: 'you@example.com', autoComplete: 'email',        maxLength: 254 },
    { name: 'password', type: showPass ? 'text' : 'password', label: 'Password', placeholder: '8+ chars, 1 uppercase, 1 number', autoComplete: 'new-password', maxLength: 128 },
    { name: 'confirm',  type: 'password', label: 'Confirm Password', placeholder: '••••••••',      autoComplete: 'new-password', maxLength: 128 },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: 'var(--color-surface)' }}>
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #E8003D 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 -left-32 w-80 h-80 rounded-full opacity-8 blur-3xl"
          style={{ background: 'radial-gradient(circle, #6C3BD5 0%, transparent 70%)' }} />
        <div className="absolute top-2/4 right-1/4 w-64 h-64 rounded-full opacity-5 blur-3xl"
          style={{ background: 'radial-gradient(circle, #10B981 0%, transparent 70%)' }} />
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
          <div className="flex justify-center mb-7">
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

          <h1 className="text-2xl font-bold text-white text-center mb-1">Create your account</h1>
          <p className="text-center text-sm mb-6" style={{ color: 'rgba(255,255,255,0.40)' }}>Join YoYo — book smarter, stay better</p>

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
            {gLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <GoogleIcon />}
            {gLoading ? 'Connecting…' : 'Sign up with Google'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.30)' }}>or fill in your details</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
            {fields.map(f => (
              <div key={f.name}>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.50)' }}>{f.label}</label>
                <div className="relative">
                  <input
                    name={f.name} type={f.type} required
                    value={form[f.name]} onChange={handleChange}
                    placeholder={f.placeholder}
                    autoComplete={f.autoComplete}
                    maxLength={f.maxLength}
                    className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.09)',
                      caretColor: '#E8003D',
                      paddingRight: f.name === 'password' ? '56px' : '16px',
                    }}
                    onFocus={e => { e.target.style.border = '1px solid rgba(232,0,61,0.60)'; e.target.style.boxShadow = '0 0 0 3px rgba(232,0,61,0.10)'; }}
                    onBlur={e =>  { e.target.style.border = '1px solid rgba(255,255,255,0.09)'; e.target.style.boxShadow = 'none'; }}
                  />
                  {f.name === 'password' && (
                    <button type="button" onClick={() => setShowPass(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                      style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {showPass ? 'Hide' : 'Show'}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Password strength hint */}
            {form.password && (
              <p className="text-xs" style={{ color: PASSWORD_RULES.test(form.password) ? '#10B981' : 'rgba(255,255,255,0.30)' }}>
                {PASSWORD_RULES.test(form.password) ? '✓ Strong password' : '→ Add uppercase letter and number'}
              </p>
            )}

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
                    Creating account…
                  </span>
                : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold transition hover:opacity-80" style={{ color: '#E8003D' }}>
              Sign in
            </Link>
          </p>

          {/* Security badges */}
          <div className="flex items-center justify-center gap-4 mt-5">
            {['🔐 Encrypted', '🛡 Secure', '🔒 Private'].map(b => (
              <span key={b} className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>{b}</span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
