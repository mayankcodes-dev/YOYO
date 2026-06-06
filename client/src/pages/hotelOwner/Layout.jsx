import Sidebar from '../../components/hotelOwner/Sidebar';
import OwnerNavbar from '../../components/hotelOwner/Navbar';
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const Layout = () => {
  const { isOwner, navigate } = useAppContext();

  React.useEffect(() => {
    if (!isOwner) navigate('/');
  }, [isOwner]);

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
