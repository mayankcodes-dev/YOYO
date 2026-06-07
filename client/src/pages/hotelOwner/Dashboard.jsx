import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-2xl p-5 flex items-center gap-4"
    style={{ background: 'var(--color-surface-2)', boxShadow: 'var(--shadow-md)' }}
  >
    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
      style={{ background: `${color}20` }}>
      {icon}
    </div>
    <div>
      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{title}</p>
      <p className="text-2xl font-bold font-display" style={{ color }}>{value}</p>
    </div>
  </motion.div>
);

const statusColor = s => s === 'confirmed' ? '#16A34A' : s === 'cancelled' ? '#DC2626' : '#D97706';
const statusBg    = s => s === 'confirmed' ? '#DCFCE7' : s === 'cancelled' ? '#FEE2E2' : '#FEF3C7';

const Dashboard = () => {
  const { axios, getToken } = useAppContext();
  const [dash,    setDash]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchDash = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/bookings/hotel', {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) setDash(data.dashboardData);
      else toast.error(data.message);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const updateStatus = async (bookingId, status) => {
    setUpdatingId(bookingId);
    try {
      const { data } = await axios.patch(`/api/bookings/${bookingId}/status`, { status }, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) { toast.success(`Booking ${status}`); fetchDash(); }
      else toast.error(data.message);
    } catch (err) { toast.error(err.message); }
    finally { setUpdatingId(null); }
  };

  useEffect(() => { fetchDash(); }, []);

  if (loading) return (
    <div className="p-6 flex flex-col gap-4">
      {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}
    </div>
  );

  const revenueData = dash?.revenueData?.slice(-14) || []; // last 14 days

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-display" style={{ color: 'var(--color-text-primary)' }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Your hotel performance at a glance</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Bookings"  value={dash?.totalBookings || 0}         icon="📋" color="var(--color-primary)" />
        <StatCard title="Total Revenue"   value={`₹${(dash?.totalRevenue || 0).toLocaleString('en-IN')}`} icon="💰" color="#16A34A" />
        <StatCard title="Occupancy Rate"  value={`${dash?.occupancyRate || 0}%`}   icon="🏨" color="#7C3AED" />
        <StatCard title="Avg Booking"     value={dash?.totalBookings ? `₹${Math.round((dash?.totalRevenue || 0) / dash.totalBookings).toLocaleString('en-IN')}` : '₹0'} icon="📊" color="#D97706" />
      </div>

      {/* Revenue Chart */}
      {revenueData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 mb-8"
          style={{ background: 'var(--color-surface-2)', boxShadow: 'var(--shadow-md)' }}
        >
          <h2 className="font-bold text-base mb-4" style={{ color: 'var(--color-text-primary)' }}>Revenue — Last 14 Days</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']}
                contentStyle={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 12 }}
                labelStyle={{ color: 'var(--color-text-primary)', fontWeight: 600 }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#E8003D" strokeWidth={2.5}
                dot={{ fill: '#E8003D', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Recent Bookings Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--color-surface-2)', boxShadow: 'var(--shadow-md)' }}
      >
        <div className="p-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>Recent Bookings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--color-surface-3)' }}>
                {['Guest', 'Room', 'Check-In', 'Amount', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(dash?.bookings || []).slice(0, 10).map((b, i) => (
                <tr key={b._id} className="border-t" style={{ borderColor: 'var(--color-border)', background: i % 2 === 0 ? 'transparent' : 'var(--color-surface-3)' }}>
                  <td className="px-4 py-3" style={{ color: 'var(--color-text-primary)' }}>{b.user?.split('').slice(0,8).join('')}…</td>
                  <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>{b.room?.roomType || '—'}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>{new Date(b.checkInDate).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3 font-semibold" style={{ color: 'var(--color-primary)' }}>₹{b.totalPrice?.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold px-2 py-1 rounded-full capitalize"
                      style={{ background: statusBg(b.status), color: statusColor(b.status) }}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {b.status === 'pending' && (
                      <div className="flex gap-1">
                        <button onClick={() => updateStatus(b._id, 'confirmed')} disabled={updatingId === b._id}
                          className="text-xs px-2 py-1 rounded-lg font-semibold disabled:opacity-50"
                          style={{ background: '#DCFCE7', color: '#16A34A' }}>
                          Confirm
                        </button>
                        <button onClick={() => updateStatus(b._id, 'cancelled')} disabled={updatingId === b._id}
                          className="text-xs px-2 py-1 rounded-lg font-semibold disabled:opacity-50"
                          style={{ background: '#FEE2E2', color: '#DC2626' }}>
                          Cancel
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!dash?.bookings || dash.bookings.length === 0) && (
            <div className="py-16 text-center" style={{ color: 'var(--color-text-muted)' }}>No bookings yet</div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
