import { useAppContext } from "../context/AppContext";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const statusColor = (isPaid) =>
  isPaid
    ? { bg: "#DCFCE7", text: "#16A34A" }
    : { bg: "#FEF3C7", text: "#D97706" };

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { axios, getToken, user, currency, navigate } = useAppContext();

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/bookings/user", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        setBookings(data.bookings);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (bookingId) => {
    try {
      const { data } = await axios.post(
        "/api/bookings/stripe-payment",
        { bookingId },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );
      if (data.success) {
        localStorage.setItem("pendingBookingId", bookingId);
        window.location.href = data.url;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) fetchUserBookings();
  }, [user]);

  return (
    <div
      className="min-h-screen pt-24 pb-20 px-4 md:px-16 lg:px-24 xl:px-32"
      style={{ background: "var(--color-surface)" }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10"
      >
        <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--color-primary)" }}>
          My Account
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-bold" style={{ color: "var(--color-text-primary)" }}>
          My Bookings
        </h1>
        <p className="text-sm mt-1.5" style={{ color: "var(--color-text-secondary)" }}>
          Manage your past, current, and upcoming hotel reservations
        </p>
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-36 rounded-2xl w-full" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && bookings.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center py-24 gap-4 text-center"
        >
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
            style={{ background: "var(--color-surface-3)" }}>
            🏨
          </div>
          <h2 className="font-bold text-xl" style={{ color: "var(--color-text-primary)" }}>
            No bookings yet
          </h2>
          <p className="text-sm max-w-xs" style={{ color: "var(--color-text-secondary)" }}>
            Explore thousands of hotels across India and book your perfect stay.
          </p>
          <button onClick={() => navigate("/rooms")} className="btn-primary mt-2">
            Explore Hotels
          </button>
        </motion.div>
      )}

      {/* Booking cards */}
      {!loading && bookings.length > 0 && (
        <div className="space-y-5">
          {bookings.map((booking, index) => {
            const nights = Math.max(
              1,
              Math.ceil(
                (new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / 86400000
              )
            );
            const { bg, text } = statusColor(booking.isPaid);
            return (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.07 }}
                className="rounded-2xl overflow-hidden flex flex-col md:flex-row"
                style={{
                  background: "var(--color-surface-2)",
                  boxShadow: "var(--shadow-md)",
                }}
              >
                {/* Image */}
                <div
                  className="w-full md:w-52 shrink-0 overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/rooms/${booking.room._id}`)}
                >
                  <img
                    src={booking.room.images?.[0]}
                    alt={booking.hotel.name}
                    className="w-full h-44 md:h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Details */}
                <div className="flex flex-col md:flex-row flex-1 p-5 gap-4">
                  {/* Hotel info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start gap-2 mb-1">
                      <h3
                        className="font-display font-bold text-lg cursor-pointer hover:underline"
                        style={{ color: "var(--color-text-primary)" }}
                        onClick={() => navigate(`/rooms/${booking.room._id}`)}
                      >
                        {booking.hotel.name}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: "var(--color-surface-3)", color: "var(--color-text-secondary)" }}>
                        {booking.room.roomType}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-sm mb-2"
                      style={{ color: "var(--color-text-secondary)" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                      </svg>
                      {booking.hotel.address}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm mt-3">
                      <div>
                        <p className="text-xs uppercase font-bold tracking-wide mb-0.5"
                          style={{ color: "var(--color-text-muted)" }}>Check-In</p>
                        <p style={{ color: "var(--color-text-primary)" }}>
                          {new Date(booking.checkInDate).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                        </p>
                      </div>
                      <div style={{ width: 1, background: "var(--color-border)" }} className="hidden sm:block" />
                      <div>
                        <p className="text-xs uppercase font-bold tracking-wide mb-0.5"
                          style={{ color: "var(--color-text-muted)" }}>Check-Out</p>
                        <p style={{ color: "var(--color-text-primary)" }}>
                          {new Date(booking.checkOutDate).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                        </p>
                      </div>
                      <div style={{ width: 1, background: "var(--color-border)" }} className="hidden sm:block" />
                      <div>
                        <p className="text-xs uppercase font-bold tracking-wide mb-0.5"
                          style={{ color: "var(--color-text-muted)" }}>Guests</p>
                        <p style={{ color: "var(--color-text-primary)" }}>{booking.guests}</p>
                      </div>
                      <div style={{ width: 1, background: "var(--color-border)" }} className="hidden sm:block" />
                      <div>
                        <p className="text-xs uppercase font-bold tracking-wide mb-0.5"
                          style={{ color: "var(--color-text-muted)" }}>Duration</p>
                        <p style={{ color: "var(--color-text-primary)" }}>
                          {nights} night{nights > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment side */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 md:min-w-32">
                    <div className="text-right">
                      <p className="text-xs uppercase font-bold tracking-wide mb-0.5"
                        style={{ color: "var(--color-text-muted)" }}>Total</p>
                      <p className="font-black text-xl" style={{ color: "var(--color-primary)" }}>
                        {currency}{booking.totalPrice?.toLocaleString("en-IN")}
                      </p>
                    </div>

                    {/* Status badge */}
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{ background: bg, color: text }}
                      >
                        {booking.isPaid ? "✓ Paid" : "⏳ Pending"}
                      </span>
                      {!booking.isPaid && (
                        <button
                          onClick={() => handlePayment(booking._id)}
                          className="btn-primary text-xs py-1.5 px-4"
                        >
                          Pay Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
