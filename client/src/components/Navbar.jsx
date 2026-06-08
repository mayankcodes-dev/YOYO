import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";

// ─── Sun / Moon toggle ────────────────────────────────────────
const DarkToggle = ({ darkMode, toggleDarkMode }) => (
  <button
    onClick={toggleDarkMode}
    aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    className="flex items-center justify-center w-9 h-9 rounded-full transition-all hover:scale-110"
    style={{ color: darkMode ? "#FBBF24" : "rgba(255,255,255,0.65)" }}
  >
    {darkMode ? (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <circle cx="12" cy="12" r="5"/>
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
      </svg>
    ) : (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
      </svg>
    )}
  </button>
);

// ─── Avatar dropdown ──────────────────────────────────────────
const AvatarMenu = ({ user, logout, navigate, isOwner, setShowHotelReg }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const initial = user?.username?.[0]?.toUpperCase() || "?";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Open account menu"
        aria-expanded={open}
        className="flex items-center justify-center w-9 h-9 rounded-full font-bold text-sm text-white transition hover:opacity-90 overflow-hidden"
        style={{ background: "linear-gradient(135deg,#E8003D,#9B001F)" }}
      >
        {user.image
          ? <img src={user.image} alt={user.username} className="w-9 h-9 rounded-full object-cover" />
          : initial}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label="Account menu"
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-11 w-56 rounded-2xl overflow-hidden shadow-2xl z-50"
            style={{
              background: "rgba(18,18,28,0.97)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* User info */}
            <div className="px-4 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <p className="text-sm font-semibold text-white truncate">{user.username}</p>
              <p className="text-xs mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.40)" }}>{user.email}</p>
            </div>

            <div className="py-2">
              <MenuItem role="menuitem" onClick={() => { navigate("/my-bookings"); setOpen(false); }}>My Bookings</MenuItem>
              <MenuItem role="menuitem" onClick={() => {
                setOpen(false);
                isOwner ? navigate("/owner") : setShowHotelReg(true);
              }}>
                {isOwner ? "Owner Dashboard" : "List My Property"}
              </MenuItem>
              <div className="mx-3 my-1.5 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }} />
              <MenuItem role="menuitem" onClick={() => { logout(); setOpen(false); }} danger>Sign Out</MenuItem>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MenuItem = ({ onClick, children, danger, role }) => (
  <button
    onClick={onClick}
    role={role}
    className="w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
    style={{ color: danger ? "#F87171" : "rgba(255,255,255,0.75)" }}
  >
    {children}
  </button>
);

// ─── Nav link ─────────────────────────────────────────────────
const NavLink = ({ to, children, active }) => (
  <Link
    to={to}
    aria-current={active ? "page" : undefined}
    className="relative px-3 py-1.5 text-sm font-semibold transition-colors duration-150"
    style={{ color: active ? "#ffffff" : "rgba(255,255,255,0.55)" }}
  >
    {children}
    {active && (
      <motion.span
        layoutId="nav-pill"
        className="absolute inset-0 rounded-full -z-10"
        style={{ background: "rgba(255,255,255,0.10)" }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />
    )}
  </Link>
);

// ─── Mobile nav icon ──────────────────────────────────────────
const MobileNavIcon = ({ name }) => {
  const icons = {
    Home: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    Hotels: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5" aria-hidden="true">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
        <line x1="12" y1="12" x2="12" y2="12.01"/>
      </svg>
    ),
    "My Bookings": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5" aria-hidden="true">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  };
  return icons[name] || null;
};

// ─── MAIN NAVBAR ──────────────────────────────────────────────
const Navbar = () => {
  const location = useLocation();
  const { user, darkMode, toggleDarkMode, logout, navigate, isOwner, setShowHotelReg } = useAppContext();
  const isActive = p => p === "/" ? location.pathname === "/" : location.pathname.startsWith(p);

  const links = [
    { name: "Home",        path: "/" },
    { name: "Hotels",      path: "/rooms" },
    { name: "My Bookings", path: "/my-bookings" },
  ];

  return (
    <>
      {/* ── Floating pill navbar ────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center" style={{ paddingTop: "12px" }}>
        <motion.nav
          aria-label="Main navigation"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2 px-4"
          style={{
            height: "52px",
            borderRadius: "40px",
            background: "rgba(14, 14, 22, 0.75)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.40), 0 0 0 0.5px rgba(255,255,255,0.06) inset",
            maxWidth: "840px",
            width: "calc(100% - 48px)",
          }}
        >
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 mr-3" aria-label="YoYo home">
            <Logo size="md" />
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
                setShowHotelReg={setShowHotelReg}
              />
            ) : (
              <Link
                to="/login"
                className="flex-shrink-0 px-5 py-2 rounded-full text-sm font-bold text-white transition-all hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg,#E8003D 0%,#B5002E 100%)",
                  boxShadow: "0 2px 12px rgba(232,0,61,0.35)",
                }}
              >
                Sign In
              </Link>
            )}
          </div>
        </motion.nav>
      </div>

      {/* ── Mobile bottom nav bar ───────────────────────────────── */}
      <nav
        aria-label="Mobile navigation"
        className="sm:hidden fixed bottom-4 left-4 right-4 z-50"
      >
        <div
          className="flex items-center justify-around py-3 px-6 rounded-2xl"
          style={{
            background: "rgba(14,14,22,0.92)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {links.map(l => {
            const active = isActive(l.path);
            return (
              <Link
                key={l.path}
                to={l.path}
                aria-current={active ? "page" : undefined}
                aria-label={l.name}
                className="flex flex-col items-center gap-1 transition-colors min-w-[44px]"
                style={{ color: active ? "#E8003D" : "rgba(255,255,255,0.55)" }}
              >
                <MobileNavIcon name={l.name} />
                <span className="text-[10px] font-semibold">{l.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Navbar;