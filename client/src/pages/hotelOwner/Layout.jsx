import Sidebar from '../../components/hotelOwner/Sidebar';
import OwnerNavbar from '../../components/hotelOwner/Navbar';
import React from 'react';
import { Outlet } from 'react-router-dom';

// Auth guard is handled by <ProtectedRoute requiredRole="hotelOwner"> in App.jsx.
// This component only renders when the user is already verified as hotelOwner.
const Layout = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "var(--color-surface)" }}>
      <OwnerNavbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
