import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";

// ─── YoYo logo pill ───────────────────────────────────────────
const YoYoLogo = () => (
  <div style={{
    background: "#E8003D",
    borderRadius: "8px",
    padding: "3px 12px 4px",
    boxShadow: "0 2px 12px rgba(232,0,61,0.45)",
    lineHeight: 1,
  }}>
    <span style={{
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontWeight: 900,
      fontSize: "19px",
      color: "#fff",
      letterSpacing: "-0.04em",
    }}>YoYo</span>
  </div>
);

// ─── Sun / Moon toggle ────────────────────────────────────────
const DarkToggle = ({ darkMode, toggleDarkMode }) => (
  <button
    onClick={toggleDarkMode}
    aria-label="Toggle theme"
    className="flex items-center justify-center w-8 h-8 rounded-full transition-all hover:scale-110"
    style={{ color: darkMode ? '#FBBF24' : '#6B7280' }}
  >
    {darkMode ? (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="5"/>
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
      </svg>
    ) : (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
      </svg>
    )}
  </button>
);

// ─── Avatar dropdown ──────────────────────────────────────────
const AvatarMenu = ({ user, logout, navigate, isOwner, isAdmin, setShowHotelReg }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const initial = user?.username?.[0]?.toUpperCase() || '?';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm text-white transition hover:opacity-90"
        style={{ background: 'linear-gradient(135deg,#E8003D,#9B001F)' }}
      >
        {user.image
          ? <img src={user.image} alt={user.username} className="w-8 h-8 rounded-full object-cover" />
          : initial}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-10 w-52 rounded-2xl overflow-hidden shadow-2xl z-50"
            style={{
              background: 'rgba(18,18,28,0.96)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* User info */}
            <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <p className="text-sm font-semibold text-white truncate">{user.username}</p>
              <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.40)' }}>{user.email}</p>
            </div>

            <div className="py-1.5">
              <MenuItem onClick={() => { navigate('/profile');     setOpen(false); }}>My Profile</MenuItem>
              <MenuItem onClick={() => { navigate('/my-bookings'); setOpen(false); }}>My Bookings</MenuItem>
              {isAdmin && (
                <MenuItem onClick={() => { navigate('/admin'); setOpen(false); }}>Admin Panel</MenuItem>
              )}
              <MenuItem onClick={() => {
                setOpen(false);
                isOwner ? navigate('/owner') : setShowHotelReg(true);
              }}>
                {isOwner ? 'Owner Dashboard' : 'List My Property'}
              </MenuItem>
              <div className="mx-3 my-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />
              <MenuItem onClick={() => { logout(); setOpen(false); }} danger>Sign Out</MenuItem>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MenuItem = ({ onClick, children, danger }) => (
  <button
    onClick={onClick}
    className="w-full text-left px-4 py-2 text-sm font-medium transition-colors hover:bg-white/5"
    style={{ color: danger ? '#F87171' : 'rgba(255,255,255,0.70)' }}
  >
    {children}
  </button>
);

// ─── Nav link ─────────────────────────────────────────────────
const NavLink = ({ to, children, active }) => (
  <Link
    to={to}
    className="relative px-3 py-1 text-sm font-semibold transition-colors duration-150"
    style={{ color: active ? '#ffffff' : 'rgba(255,255,255,0.55)' }}
  >
    {children}
    {active && (
      <motion.span
        layoutId="nav-pill"
        className="absolute inset-0 rounded-full -z-10"
        style={{ background: 'rgba(255,255,255,0.10)' }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />
    )}
  </Link>
);

// ─── MAIN NAVBAR ──────────────────────────────────────────────
const Navbar = () => {
  const location = useLocation();
  const { user, darkMode, toggleDarkMode, logout, navigate, isOwner, isAdmin, setShowHotelReg } = useAppContext();
  const isActive = p => p === '/' ? location.pathname === '/' : location.pathname.startsWith(p);

  const links = [
    { name: 'Home',        path: '/' },
    { name: 'Hotels',      path: '/rooms' },
    { name: 'My Bookings', path: '/my-bookings' },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center" style={{ paddingTop: '12px' }}>
      {/* ── Floating pill ──────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-2 px-4"
        style={{
          height: '48px',
          borderRadius: '40px',
          background: 'rgba(14, 14, 22, 0.72)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.40), 0 0 0 0.5px rgba(255,255,255,0.06) inset',
          maxWidth: '820px',
          width: 'calc(100% - 48px)',
        }}
      >
        {/* Logo */}
        <Link to="/" className="flex-shrink-0 mr-2">
          <YoYoLogo />
        </Link>

        {/* Nav links — hidden on mobile */}
        <div className="hidden sm:flex items-center gap-0.5 flex-1">
          {links.map(l => (
            <NavLink key={l.path} to={l.path} active={isActive(l.path)}>{l.name}</NavLink>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto">
          <DarkToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

          {user ? (
            <AvatarMenu
              user={user}
              logout={logout}
              navigate={navigate}
              isOwner={isOwner}
              isAdmin={isAdmin}
              setShowHotelReg={setShowHotelReg}
            />
          ) : (
            <Link
              to="/login"
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-bold text-white transition-all hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg,#E8003D 0%,#B5002E 100%)',
                boxShadow: '0 2px 12px rgba(232,0,61,0.35)',
              }}
            >
              Sign In
            </Link>
          )}
        </div>
      </motion.nav>

      {/* Mobile bottom nav bar */}
      <div className="sm:hidden fixed bottom-4 left-4 right-4 z-50">
        <div className="flex items-center justify-around py-3 px-4 rounded-2xl"
          style={{
            background: 'rgba(14,14,22,0.85)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}>
          {links.map(l => (
            <Link
              key={l.path}
              to={l.path}
              className="flex flex-col items-center gap-0.5 text-xs font-semibold transition-colors"
              style={{ color: isActive(l.path) ? '#E8003D' : 'rgba(255,255,255,0.45)' }}
            >
              <span>{l.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Navbar;