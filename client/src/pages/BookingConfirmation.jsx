import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { useAppContext } from '../context/AppContext';

const Detail = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
    <span className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{value}</span>
  </div>
);

const BookingConfirmation = () => {
  const { id } = useParams();
  const { axios, navigate, currency } = useAppContext();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get('/api/bookings/user');
        if (data.success) {
          const found = data.bookings.find(b => b._id === id);
          if (found) setBooking(found);
          else navigate('/my-bookings');
        }
      } catch { navigate('/my-bookings'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
      <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--color-primary) transparent transparent transparent' }} />
    </div>
  );

  if (!booking) return null;

  const nights = Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / 86400000);
  const taxAmount    = booking.taxAmount    || 0;
  const serviceFee   = booking.serviceFee   || 99;
  const discount     = booking.discountAmount|| 0;
  const grandTotal   = booking.totalPrice + taxAmount + serviceFee - discount;

  const formatDate = d => new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-16 lg:px-32" style={{ background: 'var(--color-surface)' }}>
      <Helmet>
        <title>Booking Confirmed — YoYo Rooms</title>
      </Helmet>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
        {/* Success banner */}
        <div className="rounded-2xl p-6 mb-6 flex items-center gap-4"
          style={{ background: 'linear-gradient(135deg, #E8003D 0%, #FF4D7A 100%)', color: '#fff' }}>
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl shrink-0">🎉</div>
          <div>
            <h1 className="text-xl font-bold font-display">Booking Confirmed!</h1>
            <p className="text-sm opacity-80 mt-0.5">Your room is reserved. Check your email for details.</p>
          </div>
        </div>

        {/* Main card */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface-2)', boxShadow: 'var(--shadow-lg)' }}>
          {/* Hotel image */}
          {booking.room?.images?.[0] && (
            <img src={booking.room.images[0]} alt="room" className="w-full h-48 object-cover" loading="lazy" />
          )}

          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="font-bold text-lg font-display" style={{ color: 'var(--color-text-primary)' }}>
                  {booking.hotel?.name || 'Hotel'}
                </h2>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {booking.room?.roomType} · {booking.hotel?.city}
                </p>
              </div>
              {/* QR Code */}
              <div className="shrink-0 p-2 rounded-xl bg-white">
                <QRCode value={booking._id} size={80} fgColor="#E8003D" />
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <Detail label="Check-In"   value={formatDate(booking.checkInDate)} />
              <Detail label="Check-Out"  value={formatDate(booking.checkOutDate)} />
              <Detail label="Guests"     value={`${booking.guests} guest${booking.guests > 1 ? 's' : ''}`} />
              <Detail label="Nights"     value={`${nights} night${nights > 1 ? 's' : ''}`} />
              <Detail label="Payment"    value={booking.paymentMethod} />
              <Detail label="Status"     value={booking.isPaid ? '✅ Paid' : '⏳ Pay at hotel'} />
            </div>

            {/* Booking ID */}
            <div className="px-4 py-3 rounded-xl mb-6 font-mono text-xs break-all"
              style={{ background: 'var(--color-surface-3)', color: 'var(--color-text-secondary)' }}>
              Booking ID: <span style={{ color: 'var(--color-primary)' }}>{booking._id}</span>
            </div>

            {/* Price Breakdown */}
            <div className="rounded-xl p-4 mb-6" style={{ background: 'var(--color-surface-3)' }}>
              <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--color-text-primary)' }}>Price Breakdown</h3>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between"><span style={{ color: 'var(--color-text-secondary)' }}>Room × {nights} night{nights > 1 ? 's' : ''}</span><span style={{ color: 'var(--color-text-primary)' }}>{currency}{booking.totalPrice.toLocaleString('en-IN')}</span></div>
                {discount > 0 && <div className="flex justify-between"><span style={{ color: '#16A34A' }}>Coupon ({booking.couponCode})</span><span style={{ color: '#16A34A' }}>−{currency}{discount.toLocaleString('en-IN')}</span></div>}
                <div className="flex justify-between"><span style={{ color: 'var(--color-text-secondary)' }}>GST (12%)</span><span style={{ color: 'var(--color-text-primary)' }}>{currency}{taxAmount.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span style={{ color: 'var(--color-text-secondary)' }}>Service Fee</span><span style={{ color: 'var(--color-text-primary)' }}>{currency}{serviceFee}</span></div>
                <div className="flex justify-between border-t pt-2 mt-1 font-bold" style={{ borderColor: 'var(--color-border)' }}>
                  <span style={{ color: 'var(--color-text-primary)' }}>Total</span>
                  <span style={{ color: 'var(--color-primary)' }}>{currency}{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Cancellation policy */}
            <p className="text-xs mb-6" style={{ color: 'var(--color-text-muted)' }}>
              ℹ️ Free cancellation up to 48 hours before check-in. Cancel via My Bookings.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => navigate('/my-bookings')} className="btn-primary flex-1">View My Bookings</button>
              <button onClick={() => window.print()} className="btn-outline flex-1">🖨️ Print Receipt</button>
              <button onClick={() => navigate('/rooms')} className="btn-outline flex-1">Book Another</button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingConfirmation;
