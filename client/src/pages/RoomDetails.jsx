import React, { useEffect, useState } from "react";
import { useParams, useLocation, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { assets, roomCommonData } from "../assets/assets";
import StarRating from "../components/StarRating";
import SkeletonCard from "../components/SkeletonCard";
import LiveViewers from "../components/LiveViewers";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { calcNights } from "../utils/helpers";

// ── Amenity icon lookup (same map as HotelCard) ───────────────
const AMENITY_ICONS = {
  "Free Wi-Fi":      "📶",
  "Free Breakfast":  "🍳",
  "Room Service":    "🛎️",
  "Pool Access":     "🏊",
  "Mountain View":   "🏔️",
  "Air Conditioning":"❄️",
  "Parking":         "🅿️",
  "Gym":             "🏋️",
  "Spa":             "💆",
};

// ── Skeleton for the whole page while room is loading ─────────
const RoomDetailSkeleton = () => (
  <div className="section-px page-top page-bottom min-h-screen" style={{ background: "var(--color-surface)" }}>
    <div className="skeleton h-4 w-40 mb-8 rounded" />
    <div className="skeleton h-9 w-72 mb-3 rounded" />
    <div className="skeleton h-4 w-48 mb-10 rounded" />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-12">
      <div className="skeleton h-72 lg:h-96 rounded-2xl" />
      <div className="grid grid-cols-2 gap-3">
        {[1,2,3,4].map(i => <div key={i} className="skeleton h-28 md:h-36 rounded-xl" />)}
      </div>
    </div>
    <div className="flex flex-col lg:flex-row gap-10">
      <div className="flex-1 space-y-4">
        <div className="skeleton h-7 w-80 rounded" />
        <div className="flex gap-2 flex-wrap">
          {[1,2,3].map(i => <div key={i} className="skeleton h-8 w-24 rounded-full" />)}
        </div>
        <div className="skeleton h-20 w-full rounded" />
      </div>
      <div className="lg:w-96 skeleton h-96 rounded-2xl" />
    </div>
  </div>
);

const RoomDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { rooms, axios, getToken, navigate, currency, user, token, clearSession } = useAppContext();
  const [room,         setRoom]         = useState(null);
  const [mainImage,    setMainImage]    = useState(null);
  // Pre-populate from URL params so form state survives login redirect
  const [checkInDate,  setCheckInDate]  = useState(searchParams.get('checkIn')  || "");
  const [checkOutDate, setCheckOutDate] = useState(searchParams.get('checkOut') || "");
  const [guests,       setGuests]       = useState(Number(searchParams.get('guests')) || 1);
  const [isAvailable,  setIsAvailable]  = useState(false);
  const [isChecking,   setIsChecking]   = useState(false);
  const [isBooking,    setIsBooking]    = useState(false);
  const [paymentMethod,setPaymentMethod]= useState('pay at hotel');

  const today  = new Date().toISOString().split("T")[0];
  const nights = calcNights(checkInDate, checkOutDate);

  // ── Check availability ──────────────────────────────────────
  const checkAvailability = async () => {
    if (checkInDate >= checkOutDate) {
      toast.error("Check-out must be after check-in");
      return;
    }
    setIsChecking(true);
    try {
      const { data } = await axios.post("/api/bookings/check-availability", {
        room: id, checkInDate, checkOutDate,
      });
      if (data.success) {
        setIsAvailable(data.isAvailable);
        data.isAvailable
          ? toast.success("Room is available for your dates!")
          : toast.error("Room is not available for these dates");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsChecking(false);
    }
  };

  // ── Book room ───────────────────────────────────────────────
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    // Guard: only redirect to login if BOTH user and token are absent.
    // If token exists but user is still being rehydrated (syncUser in-flight),
    // let the request through — the server validates the token authoritatively.
    console.log('[Book] user:', user, 'token:', !!token);
    if (!user && !token) {
      toast.error("Please sign in to book");
      // Encode form state into the return URL so it survives login redirect
      const params = new URLSearchParams();
      if (checkInDate)  params.set('checkIn',  checkInDate);
      if (checkOutDate) params.set('checkOut', checkOutDate);
      if (guests !== 1) params.set('guests',   guests);
      const returnTo = `${location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
      navigate("/login", { state: { from: returnTo } });
      return;
    }
    if (!isAvailable) { return checkAvailability(); }
    setIsBooking(true);
    try {
      const token = await getToken();
      const { data } = await axios.post(
        "/api/bookings/book",
        { room: id, checkInDate, checkOutDate, guests, paymentMethod },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        if (paymentMethod === 'stripe') {
          const stripeRes = await axios.post(
            '/api/bookings/stripe-payment',
            { bookingId: data.booking._id },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (stripeRes.data.success) {
            window.location.href = stripeRes.data.url;
          } else {
            toast.error(stripeRes.data.message || 'Payment session failed');
            navigate('/my-bookings');
          }
        } else {
          toast.success('Room booked! Pay at hotel on arrival.');
          navigate('/my-bookings');
          window.scrollTo(0, 0);
        }
      } else {
        // Auth failure — session is stale, clear it and send to login
        const AUTH_MSGS = ['User not found', 'Not authenticated', 'Invalid or expired token'];
        if (AUTH_MSGS.includes(data.message)) {
          clearSession();
          toast.error('Session expired. Please sign in again.');
          const params = new URLSearchParams();
          if (checkInDate)  params.set('checkIn',  checkInDate);
          if (checkOutDate) params.set('checkOut', checkOutDate);
          if (guests !== 1) params.set('guests',   guests);
          const returnTo = `${location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
          navigate('/login', { state: { from: returnTo } });
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsBooking(false);
    }
  };

  // ── Find room in context ────────────────────────────────────
  useEffect(() => {
    const found = rooms.find((r) => r._id === id);
    if (found) {
      setRoom(found);
      setMainImage(found.images[0]);
    }
  }, [rooms, id]);

  // Show skeleton while rooms haven't loaded yet
  if (!room) return <RoomDetailSkeleton />;

  return (
    <main
      id="main-content"
      className="section-px page-top page-bottom min-h-screen"
      style={{ background: "var(--color-surface)" }}
    >
      {/* ── Breadcrumb ───────────────────────────────────────── */}
      <motion.nav
        aria-label="Breadcrumb"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 text-xs mb-8"
        style={{ color: "var(--color-text-muted)" }}
      >
        <button onClick={() => navigate("/")} className="hover:underline">Home</button>
        <span aria-hidden="true">/</span>
        <button onClick={() => navigate("/rooms")} className="hover:underline">Hotels</button>
        <span aria-hidden="true">/</span>
        <span style={{ color: "var(--color-text-primary)" }}>{room.hotel.name}</span>
      </motion.nav>

      {/* ── Header ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mb-8"
      >
        <div className="flex flex-wrap items-start gap-3 mb-3">
          <h1
            className="font-display text-3xl md:text-4xl font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            {room.hotel.name}
          </h1>
          <span
            className="px-3 py-1 rounded-full text-sm font-bold text-white"
            style={{ background: "var(--color-primary)" }}
          >
            {room.roomType}
          </span>
          {room.category && (
            <span
              className="px-3 py-1 rounded-full text-sm font-semibold"
              style={{
                background: "var(--color-primary-light)",
                color: "var(--color-primary)",
              }}
            >
              {room.category}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-1.5">
            <StarRating rating={4} />
            <span className="text-sm ml-1" style={{ color: "var(--color-text-muted)" }}>
              200+ reviews
            </span>
          </div>
          <div
            className="flex items-center gap-1.5 text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {room.hotel.address}
          </div>
        </div>

        {/* ── Live Viewers badge ───────────────────────── */}
        <LiveViewers roomId={id} />
      </motion.div>

      {/* ── Image Gallery ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-14"
      >
        {/* Main image */}
        <div className="overflow-hidden rounded-2xl" style={{ boxShadow: "var(--shadow-lg)" }}>
          <img
            src={mainImage}
            alt={`Main view of ${room.hotel.name}`}
            className="w-full h-72 lg:h-[420px] object-cover"
          />
        </div>

        {/* Thumbnail grid */}
        <div className="grid grid-cols-2 gap-3">
          {room.images.map((img, i) => (
            <button
              key={i}
              onClick={() => setMainImage(img)}
              aria-label={`View room photo ${i + 1}`}
              aria-pressed={mainImage === img}
              className="overflow-hidden rounded-xl transition-all duration-200"
              style={{
                outline: mainImage === img ? `2px solid var(--color-primary)` : "2px solid transparent",
                outlineOffset: "2px",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <img
                src={img}
                alt={`Room view ${i + 1}`}
                className="w-full h-28 md:h-36 object-cover hover:scale-105 transition-transform duration-300"
              />
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Content + Booking ────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-14">

        {/* Left: Details */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex-1"
        >
          {/* Highlights */}
          <section aria-label="Room highlights" className="mb-10">
            <h2
              className="font-display text-2xl font-bold mb-5"
              style={{ color: "var(--color-text-primary)" }}
            >
              Experience Luxury Like Never Before
            </h2>

            {/* Amenity chips */}
            <div className="flex flex-wrap gap-2 mb-6" aria-label="Amenities">
              {room.amenities.map((item, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium"
                  style={{
                    background: "var(--color-surface-3)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {AMENITY_ICONS[item] && <span aria-hidden="true">{AMENITY_ICONS[item]}</span>}
                  {item}
                </span>
              ))}
            </div>

            <p
              className="text-sm leading-relaxed max-w-2xl"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Guests will be allocated on the ground floor according to availability.
              You get a comfortable room with a true city feeling. The price quoted is
              for two guests — at the guest slot, mark the number of guests to get the
              exact price for groups.
            </p>
          </section>

          {/* What's included */}
          {roomCommonData && (
            <section aria-label="What's included" className="space-y-5 mb-10">
              {roomCommonData.map((spec, i) => (
                <div key={i} className="flex items-start gap-4">
                  <img src={spec.icon} alt="" aria-hidden="true" className="w-6 h-6 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "var(--color-text-primary)" }}>
                      {spec.title}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>
                      {spec.description}
                    </p>
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Hosted by */}
          <div
            className="flex items-center gap-5 p-6 rounded-2xl"
            style={{ background: "var(--color-surface-2)", boxShadow: "var(--shadow-sm)" }}
          >
            <img
              src={room?.hotel?.owner?.image || assets.regImage}
              alt={`Host: ${room.hotel.name}`}
              className="w-14 h-14 rounded-full object-cover ring-2"
              style={{ ringColor: "var(--color-primary)" }}
            />
            <div className="flex-1">
              <p className="font-bold" style={{ color: "var(--color-text-primary)" }}>
                Hosted by {room.hotel.name}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <StarRating rating={4} />
                <span className="text-xs ml-1" style={{ color: "var(--color-text-muted)" }}>
                  200+ reviews
                </span>
              </div>
            </div>
            <button className="btn-primary text-sm py-2 px-5">Contact</button>
          </div>
        </motion.div>

        {/* Right: Booking Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:w-96 shrink-0"
        >
          <div
            className="sticky top-28 rounded-2xl p-7"
            style={{ background: "var(--color-surface-2)", boxShadow: "var(--shadow-xl)" }}
          >
            {/* Price */}
            <div className="mb-6">
              <span
                className="font-display font-black text-3xl"
                style={{ color: "var(--color-primary)" }}
              >
                {currency}{room.pricePerNight?.toLocaleString("en-IN")}
              </span>
              <span className="text-sm ml-1" style={{ color: "var(--color-text-muted)" }}>
                /night
              </span>
              {nights > 0 && (
                <p className="text-xs mt-1.5" style={{ color: "var(--color-text-secondary)" }}>
                  {nights} night{nights > 1 ? "s" : ""} ={" "}
                  <strong>{currency}{(room.pricePerNight * nights).toLocaleString("en-IN")}</strong> total
                </p>
              )}
            </div>

            <form onSubmit={onSubmitHandler} className="space-y-4">
              {/* Check-In */}
              <div>
                <label
                  htmlFor="check-in"
                  className="block text-xs font-bold uppercase tracking-wide mb-2"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Check-In
                </label>
                <input
                  id="check-in"
                  type="date"
                  min={today}
                  value={checkInDate}
                  onChange={(e) => { setCheckInDate(e.target.value); setIsAvailable(false); }}
                  required
                  className="w-full rounded-xl px-4 py-3 text-sm border outline-none"
                  style={{
                    background: "var(--color-surface-3)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-primary)",
                  }}
                />
              </div>

              {/* Check-Out */}
              <div>
                <label
                  htmlFor="check-out"
                  className="block text-xs font-bold uppercase tracking-wide mb-2"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Check-Out
                </label>
                <input
                  id="check-out"
                  type="date"
                  min={checkInDate || today}
                  value={checkOutDate}
                  disabled={!checkInDate}
                  onChange={(e) => { setCheckOutDate(e.target.value); setIsAvailable(false); }}
                  required
                  className="w-full rounded-xl px-4 py-3 text-sm border outline-none disabled:opacity-50"
                  style={{
                    background: "var(--color-surface-3)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-primary)",
                  }}
                />
              </div>

              {/* Guests */}
              <div>
                <label
                  htmlFor="guests"
                  className="block text-xs font-bold uppercase tracking-wide mb-2"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Guests
                </label>
                <input
                  id="guests"
                  type="number"
                  min={1}
                  max={10}
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  required
                  className="w-full rounded-xl px-4 py-3 text-sm border outline-none"
                  style={{
                    background: "var(--color-surface-3)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-primary)",
                  }}
                />
              </div>

              {/* Availability indicator */}
              {isAvailable && (
                <div
                  role="status"
                  aria-live="polite"
                  className="flex items-center gap-2 text-sm font-semibold"
                  style={{ color: "var(--color-success)" }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ background: "var(--color-success)" }} aria-hidden="true" />
                  Available for selected dates
                </div>
              )}

              {/* Payment Method */}
              {isAvailable && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        id: 'pay at hotel',
                        label: 'Pay at Hotel',
                        sub: 'No charge now',
                        icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>,
                      },
                      {
                        id: 'stripe',
                        label: 'Pay Online',
                        sub: 'Instant confirm',
                        icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/></svg>,
                      },
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setPaymentMethod(opt.id)}
                        className="rounded-xl p-3 text-left border-2 transition-all"
                        style={{
                          borderColor:  paymentMethod === opt.id ? 'var(--color-primary)' : 'var(--color-border)',
                          background:   paymentMethod === opt.id ? 'var(--color-primary-light)' : 'var(--color-surface-3)',
                          color:        'var(--color-text-primary)',
                        }}
                      >
                        <div className="flex items-center gap-1.5 font-semibold text-sm mb-0.5">{opt.icon} {opt.label}</div>
                        <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{opt.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isChecking || isBooking}
                className="btn-primary w-full justify-center py-3.5 text-sm rounded-xl disabled:opacity-60"
              >
                {isChecking ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                    Checking…
                  </span>
                ) : isBooking ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                    {paymentMethod === 'stripe' ? 'Redirecting to payment…' : 'Booking…'}
                  </span>
                ) : isAvailable ? (
                  paymentMethod === 'stripe' ? 'Book & Pay Now' : 'Book Now'
                ) : 'Check Availability'}
              </button>

              <p className="text-center text-xs pt-1" style={{ color: 'var(--color-text-muted)' }}>
                {paymentMethod === 'stripe' ? 'Secure payment via Stripe · Free cancellation 48h before check-in' : 'No charge until check-in · Free cancellation'}
              </p>
            </form>
          </div>
        </motion.div>

      </div>
    </main>
  );
};

export default RoomDetails;
