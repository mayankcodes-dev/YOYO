import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, Navigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const AdminLayout = () => {
  const { isAdmin, user, navigate } = useAppContext();

  useEffect(() => {
    if (user && !isAdmin) navigate('/');
  }, [user, isAdmin]);

  if (!user) return <Navigate to="/login" />;
  if (!isAdmin) return null;

  const links = [
    { to: '/admin',         label: '📊 Dashboard', end: true },
    { to: '/admin/hotels',  label: '🏨 Hotels'              },
    { to: '/admin/users',   label: '👥 Users'               },
    { to: '/admin/bookings',label: '📋 Bookings'            },
  ];

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-surface)' }}>
      {/* Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col pt-6 pb-4 px-4"
        style={{ background: 'var(--color-surface-2)', borderRight: '1px solid var(--color-border)' }}>
        <div className="mb-8 px-2">
          <span className="font-bold text-lg font-display" style={{ color: 'var(--color-primary)' }}>YoYo Admin</span>
        </div>
        <nav className="flex flex-col gap-1">
          {links.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? 'font-bold' : ''}`}
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
