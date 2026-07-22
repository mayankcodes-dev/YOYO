import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import Logo from '../../components/Logo';

// Auth guard is handled by <ProtectedRoute requiredRole="admin"> in App.jsx.
// This component only renders when the user is already verified as admin.
const AdminLayout = () => {
  const { darkMode } = useAppContext();

  const links = [
    { to: '/admin',          label: '📊 Dashboard', end: true },
    { to: '/admin/hotels',   label: '🏨 Hotels'              },
    { to: '/admin/users',    label: '👥 Users'               },
    { to: '/admin/bookings', label: '📋 Bookings'            },
  ];

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-surface)' }}>
      {/* Sidebar */}
      <aside className="w-60 shrink-0 flex flex-col pt-5 pb-4 px-4"
        style={{ background: 'var(--color-surface-2)', borderRight: '1px solid var(--color-border)' }}>

        {/* Logo + label */}
        <div className="mb-8 px-2">
          <a href="/" aria-label="Go to homepage" className="flex flex-col gap-0.5 group w-fit">
            <Logo size="md" darkMode={darkMode} />
            <span className="text-[10px] font-semibold tracking-widest uppercase pl-0.5"
              style={{ color: 'var(--color-text-muted)' }}>
              Admin
            </span>
          </a>
        </div>

        <nav className="flex flex-col gap-1">
          {links.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? 'font-bold' : ''}`}
              style={({ isActive }) => ({
                background: isActive ? 'var(--color-primary)' : 'transparent',
                color:      isActive ? '#fff' : 'var(--color-text-secondary)',
              })}>
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
