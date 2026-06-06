import React from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const StatCard = ({ icon, label, value, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center gap-4 p-5 rounded-2xl border"
    style={{ background: "var(--color-surface-2)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
  >
    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
      style={{ background: color + "18" }}>
      {icon}
    </div>
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-text-muted)" }}>{label}</p>
      <p className="text-2xl font-extrabold font-display" style={{ color }}>{value}</p>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { currency, axios, getToken, user } = useAppContext();
  const [data, setData] = React.useState({ totalBookings: 0, totalRevenue: 0, bookings: [] });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data: res } = await axios.get('/api/bookings/hotel', {
          headers: { Authorization: `Bearer ${await getToken()}` },
        });
        if (res.success) setData(res.dashboardData);
        else toast.error(res.message);
      } catch (e) {
        toast.error(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  return (
    <div className="p-1">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#E8003D" }}>Overview</p>
        <h1 className="font-display text-2xl md:text-3xl font-extrabold" style={{ color: "var(--color-text-primary)" }}>
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
          Monitor your rooms, track bookings and analyse revenue — all in one place.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <StatCard icon="📅" label="Total Bookings" value={data.totalBookings} color="#E8003D" />
        <StatCard icon="💰" label="Total Revenue" value={`${currency}${data.totalRevenue.toLocaleString('en-IN')}`} color="#10B981" />
      </div>

      {/* Recent bookings table */}
      <div>
        <h2 className="text-base font-bold mb-4" style={{ color: "var(--color-text-primary)" }}>Recent Bookings</h2>
        <div
          className="rounded-2xl overflow-hidden border"
          style={{ borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--color-surface-3)" }}>
                  {["Guest", "Room", "Amount", "Status"].map(h => (
                    <th key={h} className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider"
                      style={{ color: "var(--color-text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 4 }).map((_, j) => (
                          <td key={j} className="py-3 px-4">
                            <div className="skeleton h-4 w-24 rounded" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : data.bookings.length === 0
                    ? <tr><td colSpan={4} className="py-10 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>No bookings yet</td></tr>
                    : data.bookings.map((item, i) => (
                        <tr key={i} className="border-t" style={{ borderColor: "var(--color-border)" }}>
                          <td className="py-3 px-4 font-medium" style={{ color: "var(--color-text-primary)" }}>
                            {item.user?.username || '—'}
                          </td>
                          <td className="py-3 px-4" style={{ color: "var(--color-text-secondary)" }}>
                            {item.room?.roomType}
                          </td>
                          <td className="py-3 px-4 font-semibold" style={{ color: "var(--color-text-primary)" }}>
                            {currency}{item.totalPrice?.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                              style={item.isPaid
                                ? { background: "rgba(16,185,129,0.12)", color: "#10B981" }
                                : { background: "rgba(245,158,11,0.12)", color: "#F59E0B" }
                              }
                            >
                              {item.isPaid ? 'Paid' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
