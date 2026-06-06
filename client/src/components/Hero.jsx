import { useState } from "react";
import { motion } from "framer-motion";
import { cities } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const CLOUD = "dgqgzmzed";

// ── Hero video: direct Pexels URL (works in browser <video> tags)
// Note: Cloudinary can't server-fetch Pexels, but browser can stream directly.
// To self-host: upload manually at cloudinary.com/console → Media Library → Upload
// Then set HERO_VIDEO = cloudVideo("yoyo/hero_video")
const HERO_VIDEO  = "https://videos.pexels.com/video-files/3571264/3571264-uhd_2732_1440_25fps.mp4";
const HERO_VIDEO_ALT = "https://videos.pexels.com/video-files/8547798/8547798-hd_1920_1080_25fps.mp4";

// ── Poster: already on Cloudinary ──────────────────────────────
const FALLBACK_POSTER = `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,w_1920/yoyo/rooms/goa_1`;

const trustBadges = [
  { icon: "🏨", label: "10,000+", sub: "Verified Hotels" },
  { icon: "😊", label: "1M+",     sub: "Happy Guests" },
  { icon: "⚡", label: "Instant", sub: "Confirmation" },
  { icon: "💰", label: "Best",    sub: "Price Guarantee" },
];

const Hero = () => {
  const { navigate, getToken, axios, setSearchedCities } = useAppContext();
  const [destination, setDestination] = useState("");
  const [checkIn,     setCheckIn]     = useState("");
  const [checkOut,    setCheckOut]    = useState("");
  const [guests,      setGuests]      = useState(1);

  const today    = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const onSearch = async (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.set("destination", destination);
    if (checkIn)     params.set("checkIn",     checkIn);
    if (checkOut)    params.set("checkOut",     checkOut);
    if (guests > 1)  params.set("guests",       guests);
    navigate("/rooms?" + params.toString());
    try {
      const token = await getToken();
      if (token && destination) {
        await axios.post(
          "/api/user/store-recent-search",
          { recentSearchedCity: destination },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSearchedCities((prev) => {
          const updated = [...prev.filter((c) => c !== destination), destination];
          return updated.slice(-3);
        });
      }
    } catch (_) { /* silent */ }
  };

  return (
    <section className="relative w-full h-screen min-h-[600px] overflow-hidden -mt-[52px]">

      {/* ── Cloudinary-postererd, Pexels-streamed cinematic video ─── */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster={FALLBACK_POSTER}
      >
        <source src={HERO_VIDEO}     type="video/mp4" />
        <source src={HERO_VIDEO_ALT} type="video/mp4" />
      </video>

      {/* ── Deep cinematic overlay — dark bottom-heavy like SpaceX ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(4,4,12,0.60) 55%, rgba(4,4,12,0.92) 100%)",
        }}
      />

      {/* ── Subtle red vignette on edges ─────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(232,0,61,0.08) 100%)",
        }}
      />

      {/* ── Content ──────────────────────────────────────────── */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y:   0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full text-white text-xs font-bold mb-6 backdrop-blur-sm"
          style={{
            background: "rgba(232,0,61,0.88)",
            border: "1px solid rgba(255,255,255,0.22)",
            letterSpacing: "0.06em",
          }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
          INDIA'S FASTEST GROWING HOTEL PLATFORM
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y:  0 }}
          transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[82px] font-extrabold text-white leading-[1.0] mb-5 max-w-5xl"
          style={{ letterSpacing: "-0.03em" }}
        >
          Your Perfect Stay,{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #E8003D 0%, #FF6B6B 60%, #F5A623 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            One Click
          </span>{" "}
          Away
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y:  0 }}
          transition={{ duration: 0.7, delay: 0.32 }}
          className="text-white/75 text-base md:text-lg max-w-lg mb-9 leading-relaxed"
        >
          Budget to luxury — 10,000+ verified hotels across India.
          <br className="hidden sm:block" />
          Book instantly, pay your way.
        </motion.p>

        {/* ── Glassmorphism search bar ──────────────────────── */}
        <motion.form
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y:  0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
          onSubmit={onSearch}
          className="w-full max-w-4xl rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.94)",
            backdropFilter: "blur(28px) saturate(180%)",
            WebkitBackdropFilter: "blur(28px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.75)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.35), 0 0 0 1px rgba(232,0,61,0.08)",
          }}
        >
          <div className="flex flex-col md:flex-row items-stretch">

            {/* Destination */}
            <div
              className="flex-1 flex flex-col px-5 py-4 md:border-r"
              style={{ borderColor: "rgba(10,10,40,0.10)" }}
            >
              <label className="text-xs font-black uppercase tracking-widest mb-1.5"
                style={{ color: "#E8003D" }}>
                📍 Where to?
              </label>
              <input
                list="yoyo-destinations"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Mumbai, Goa, Jaipur…"
                required
                className="bg-transparent text-sm font-semibold outline-none w-full placeholder:font-normal"
                style={{ color: "#0D0D1A" }}
              />
              <datalist id="yoyo-destinations">
                {cities.map((c, i) => <option key={i} value={c} />)}
              </datalist>
            </div>

            {/* Check-in */}
            <div
              className="flex-1 flex flex-col px-5 py-4 md:border-r"
              style={{ borderColor: "rgba(10,10,40,0.10)" }}
            >
              <label className="text-xs font-black uppercase tracking-widest mb-1.5"
                style={{ color: "#E8003D" }}>
                📅 Check In
              </label>
              <input
                type="date"
                min={today}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="bg-transparent text-sm font-semibold outline-none w-full"
                style={{ color: "#0D0D1A" }}
              />
            </div>

            {/* Check-out */}
            <div
              className="flex-1 flex flex-col px-5 py-4 md:border-r"
              style={{ borderColor: "rgba(10,10,40,0.10)" }}
            >
              <label className="text-xs font-black uppercase tracking-widest mb-1.5"
                style={{ color: "#E8003D" }}>
                📅 Check Out
              </label>
              <input
                type="date"
                min={checkIn || tomorrow}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="bg-transparent text-sm font-semibold outline-none w-full"
                style={{ color: "#0D0D1A" }}
              />
            </div>

            {/* Guests */}
            <div
              className="flex flex-col px-5 py-4 w-28 md:border-r"
              style={{ borderColor: "rgba(10,10,40,0.10)" }}
            >
              <label className="text-xs font-black uppercase tracking-widest mb-1.5"
                style={{ color: "#E8003D" }}>
                👤 Guests
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="bg-transparent text-sm font-semibold outline-none w-full"
                style={{ color: "#0D0D1A" }}
              />
            </div>

            {/* Search CTA */}
            <div className="flex items-center px-3 py-3">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                style={{
                  background: "linear-gradient(135deg, #E8003D 0%, #C0002E 100%)",
                  boxShadow: "0 6px 20px rgba(232,0,61,0.45)",
                  letterSpacing: "0.02em",
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                Search
              </button>
            </div>
          </div>
        </motion.form>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y:  0 }}
          transition={{ duration: 0.7, delay: 0.58 }}
          className="flex flex-wrap justify-center gap-5 md:gap-10 mt-8"
        >
          {trustBadges.map((b, i) => (
            <div key={i} className="flex items-center gap-2.5 text-white">
              <span className="text-xl">{b.icon}</span>
              <div className="text-left">
                <div className="text-sm font-extrabold leading-none">{b.label}</div>
                <div className="text-xs opacity-60 mt-0.5">{b.sub}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="absolute bottom-7 flex flex-col items-center gap-1.5"
        >
          <span className="text-white/40 text-[11px] font-medium tracking-widest uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" className="w-5 h-5">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
