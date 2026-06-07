import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon, color }) => (
  <div className="rounded-2xl p-5 flex items-center gap-4"
    style={{ background: 'var(--color-surface-2)', boxShadow: 'var(--shadow-md)' }}>
    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
      style={{ background: `${color}22` }}>{icon}</div>
    <div>
      <p className="text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--color-text-muted)' }}>{title}</p>
      <p className="text-2xl font-bold font-display" style={{ color }}>{value}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { axios } = useAppContext();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get('/api/admin/stats')
      .then(({ data }) => { if (data.success) setStats(data.stats); })
      .catch(() => toast.error('Failed to load stats'));
  }, []);

  return (
    <div>
      <Helmet><title>Admin Dashboard — YoYo Rooms</title></Helmet>
      <h1 className="text-2xl font-bold font-display mb-6" style={{ color: 'var(--color-text-primary)' }}>Platform Overview</h1>
      {stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <StatCard title="Total Users"    value={stats.users}                                 icon="👥" color="#7C3AED" />
          <StatCard title="Hotels"         value={stats.hotels}                                icon="🏨" color="#E8003D" />
          <StatCard title="Rooms"          value={stats.rooms}                                 icon="🛏️" color="#D97706" />
          <StatCard title="Total Bookings" value={stats.bookings}                              icon="📋" color="#0284C7" />
          <StatCard title="Reviews"        value={stats.reviews}                               icon="⭐" color="#16A34A" />
          <StatCard title="Total Revenue"  value={`₹${(stats.totalRevenue||0).toLocaleString('en-IN')}`} icon="💰" color="#16A34A" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
