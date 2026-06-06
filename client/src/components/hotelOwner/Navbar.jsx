import { useAppContext } from '../../context/AppContext';
import DarkModeToggle from '../DarkModeToggle';

const OwnerNavbar = () => {
  const { user, logout } = useAppContext();

  const initial = user?.username?.[0]?.toUpperCase() || '?';

  return (
    <header
      className="flex items-center justify-between px-5 md:px-8 py-3 border-b"
      style={{
        background: "var(--color-surface-2)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-xs)",
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div
          className="inline-flex items-center justify-center select-none"
          style={{ background: "#E8003D", borderRadius: "7px", padding: "4px 10px" }}
        >
          <span style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 900, fontSize: "18px",
            color: "#FFFFFF", letterSpacing: "-0.04em", lineHeight: 1,
          }}>YoYo</span>
        </div>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: "var(--color-surface-3)", color: "var(--color-text-secondary)" }}
        >
          Owner Portal
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <DarkModeToggle />
        {user && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.location.href = '/'}
              className="w-8 h-8 rounded-full font-bold text-sm text-white flex items-center justify-center transition hover:opacity-80"
              style={{ background: 'linear-gradient(135deg,#E8003D,#9B001F)' }}
              title={user.username}
            >
              {initial}
            </button>
            <button
              onClick={logout}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition hover:opacity-80"
              style={{ color: '#E8003D', border: '1px solid rgba(232,0,61,0.30)' }}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default OwnerNavbar;
