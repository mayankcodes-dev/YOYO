import { useAppContext } from '../../context/AppContext';
import { Link } from 'react-router-dom';
import DarkModeToggle from '../DarkModeToggle';
import Logo from '../Logo';

const OwnerNavbar = () => {
  const { user, logout, darkMode } = useAppContext();

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
      {/* Brand — Logo + wordmark on top, "Owner Portal" label below */}
      <a href="/" aria-label="YoYo home — go to homepage" className="flex flex-col gap-0.5 group">
        <Logo size="md" darkMode={darkMode} />
        <span
          className="text-[10px] font-semibold tracking-widest uppercase pl-0.5"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Owner Portal
        </span>
      </a>

      {/* Right */}
      <div className="flex items-center gap-3">
        <DarkModeToggle />
        {user && (
          <div className="flex items-center gap-2">
            {/* Avatar — no navigation, just shows username tooltip */}
            <div
              className="w-8 h-8 rounded-full font-bold text-sm text-white flex items-center justify-center select-none cursor-default"
              style={{ background: 'linear-gradient(135deg,#E8003D,#9B001F)' }}
              title={user.username}
            >
              {user.image
                ? <img src={user.image} alt={user.username} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                : initial}
            </div>
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
