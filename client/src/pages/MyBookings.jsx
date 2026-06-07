import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const statusBadge = (b) => {
  if (b.status === 'cancelled') return { bg: '#FEE2E2', text: '#DC2626', label: 'Cancelled' };
  if (b.isPaid)                 return { bg: '#DCFCE7', text: '#16A34A', label: 'Paid'      };
  return                               { bg: '#FEF3C7', text: '#D97706', label: 'Pending'   };
};

const formatDate = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const BookingCard = ({ booking, onCancel, onPay, currency }) => {
  const badge  = statusBadge(booking);
  const nights = Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / 86400000);
  const taxAmount  = booking.taxAmount    || 0;
  const serviceFee = booking.serviceFee   || 99;
  const discount   = booking.discountAmount|| 0;
  const grandTotal = booking.totalPrice + taxAmount + serviceFee - discount;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--color-surface-2)', boxShadow: 'var(--shadow-md)' }}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        {booking.room?.images?.[0] && (
          <img
            src={booking.room.images[0]}
            alt="room"
            className="w-full sm:w-44 h-40 sm:h-auto object-cover shrink-0"
            loading="lazy"
          />
        )}

        {/* Content */}
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <h3 className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {booking.hotel?.name || 'Hotel'}
              </h3>
              <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                {booking.room?.roomType} · {booking.hotel?.city}
              </p>
            </div>
            <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: badge.bg, color: badge.text }}>
              {badge.label}
            </span>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-2 text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
            <span>📅 {formatDate(booking.checkInDate)}</span>
            <span>→</span>
            <span>{formatDate(booking.checkOutDate)}</span>
            <span>· {nights} night{nights > 1 ? 's' : ''}</span>
            <span>· {booking.guests} guest{booking.guests > 1 ? 's' : ''}</span>
          </div>

          {/* Price row */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-base" style={{ color: 'var(--color-primary)' }}>
              {currency}{grandTotal.toLocaleString('en-IN')}
            </span>
            <div className="flex gap-2">
              {/* Pay Now (Stripe) */}
              {!booking.isPaid && booking.status !== 'cancelled' && (
                <button
                  onClick={() => onPay(booking._id, 'stripe')}
                  className="btn-primary text-xs px-3 py-1.5"
                >
                  Pay (Stripe)
                </button>
              )}
              {/* Cancel */}
              {booking.status !== 'cancelled' && (
                <button
                  onClick={() => onCancel(booking._id)}
                  className="text-xs px-3 py-1.5 rounded-xl border font-semibold transition-colors"
                  style={{
                    borderColor: '#DC2626', color: '#DC2626',
                    background: 'transparent',
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Booking ID */}
          <p className="text-xs mt-2 font-mono truncate" style={{ color: 'var(--color-text-muted)' }}>
            ID: {booking._id}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const TAB_FILTERS = {
  upcoming:  b => b.status !== 'cancelled' && new Date(b.checkInDate) >= new Date(),
  completed: b => b.status !== 'cancelled' && new Date(b.checkOutDate) < new Date(),
  cancelled: b => b.status === 'cancelled',
};

const MyBookings = () => {
  const { axios, getToken, user, currency, navigate } = useAppContext();
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState('upcoming');
  const [cancelling, setCancelling] = useState(null);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/bookings/user', {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) setBookings(data.bookings);
      else toast.error(data.message);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancel this booking? This cannot be undone.')) return;
    setCancelling(bookingId);
    try {
      const { data } = await axios.patch(`/api/bookings/${bookingId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        toast.success(data.message);
        fetchUserBookings();
      } else toast.error(data.message);
    } catch (err) { toast.error(err.message); }
    finally { setCancelling(null); }
  };

  const handlePay = async (bookingId, method) => {
    try {
      if (method === 'stripe') {
        const { data } = await axios.post('/api/bookings/stripe-payment', { bookingId }, {
          headers: { Authorization: `Bearer ${await getToken()}` },
        });
        if (data.success) { localStorage.setItem('pendingBookingId', bookingId); window.location.href = data.url; }
        else toast.error(data.message);
      }
    } catch (err) { toast.error(err.message); }
  };

  useEffect(() => { if (user) fetchUserBookings(); else navigate('/login'); }, [user]);

  const tabBookings = bookings.filter(TAB_FILTERS[tab]);

  const TABS = [
    { key: 'upcoming',  label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-16 lg:px-32" style={{ background: 'var(--color-surface)' }}>
      <Helmet>
        <title>My Bookings — YoYo Rooms</title>
      </Helmet>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-primary)' }}>Your Trips</p>
          <h1 className="text-3xl font-bold font-display" style={{ color: 'var(--color-text-primary)' }}>My Bookings</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map(({ key, label }) => {
            const count = bookings.filter(TAB_FILTERS[key]).length;
            return (
              <button key={key} onClick={() => setTab(key)}
                className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                style={{
                  background: tab === key ? 'var(--color-primary)' : 'transparent',
                  color: tab === key ? '#fff' : 'var(--color-text-secondary)',
                  border: tab === key ? 'none' : '1px solid var(--color-border)',
                }}>
                {label} {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
              </button>
            );
          })}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton rounded-2xl h-40" />
            ))}
          </div>
        ) : tabBookings.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <p className="text-4xl mb-3">🧳</p>
            <p className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>
              No {tab} bookings
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
              {tab === 'upcoming' ? "You don't have any upcoming trips." : `No ${tab} bookings found.`}
            </p>
            <button onClick={() => navigate('/rooms')} className="btn-primary mt-4">Browse Hotels</button>
          </motion.div>
        ) : (
          <motion.div className="flex flex-col gap-4" layout>
            <AnimatePresence mode="popLayout">
              {tabBookings.map(booking => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  onCancel={handleCancel}
                  onPay={handlePay}
                  currency={currency}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default MyBookings;
