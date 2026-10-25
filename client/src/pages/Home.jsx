import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import Hero from "../components/Hero";
import FeaturedDestination from "../components/FeaturedDestination";
import ExclusiveOffers from "../components/ExclusiveOffers";
import Testimonial from "../components/Testimonial";
import Newsletter from "../components/NewsLetter";
import HotelCard from "../components/HotelCard";
import CategoryTabs from "../components/CategoryTabs";
import FlashDeals from "../components/FlashDeals";
import AppBanner from "../components/AppBanner";
import SkeletonCard from "../components/SkeletonCard";
import HowItWorks from "../components/HowItWorks";
import { motion, useInView, useMotionValue, useSpring, animate } from "framer-motion";
import { useMemo } from "react";

const STAT_ICONS = {
  hotels: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6" aria-hidden="true">
      <path d="M3 21h18M3 7l9-4 9 4M4 21V7M20 21V7M9 21v-4a3 3 0 016 0v4"/>
    </svg>
  ),
  guests: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  cities: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  price: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
    </svg>
  ),
};

const STATS = [
  { iconKey: "hotels", display: "10,000+", label: "Hotels Across India" },
  { iconKey: "guests", display: "1M+",     label: "Happy Guests" },
  { iconKey: "cities", display: "200+",    label: "Cities Covered" },
  { iconKey: "price",  display: "₹500",   label: "Starting per Night" },
];

// ── Animated counting number ─────────────────────────────────
const CountUp = ({ display, inView }) => {
  const [shown, setShown] = useState("0");
  const hasRun = useRef(false);

  useEffect(() => {
    if (inView && !hasRun.current) {
      hasRun.current = true;
      // For display values like "10,000+" just animate in
      setTimeout(() => setShown(display), 50);
    }
  }, [inView, display]);

  return (
    <motion.span
      key={shown}
      initial={inView && shown === display ? { opacity: 0, y: 16, scale: 0.85 } : false}
      animate={inView && shown === display ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {shown}
    </motion.span>
  );
};

const StatCard = ({ s, i }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.08, duration: 0.5 }}
      whileHover={{ scale: 1.04, y: -5, transition: { duration: 0.25, ease: [0.34, 1.56, 0.64, 1] } }}
      className="text-center p-8 rounded-3xl cursor-default"
      style={{
        background: "var(--color-surface-2)",
        boxShadow: "var(--shadow-md)",
        border: "1px solid var(--color-border)",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "var(--color-primary-light)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--color-border)"}
    >
      {/* Icon circle */}
      <motion.div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{
          background: "var(--color-primary-light)",
          color: "var(--color-primary)",
        }}
        animate={inView ? { scale: [0.8, 1.15, 1] } : {}}
        transition={{ duration: 0.5, delay: i * 0.08 + 0.1 }}
      >
        {STAT_ICONS[s.iconKey]}
      </motion.div>
      <div
        className="font-display font-black text-2xl"
        style={{ color: "var(--color-primary)" }}
      >
        <CountUp display={s.display} inView={inView} />
      </div>
      <div
        className="text-xs mt-1 font-medium"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {s.label}
      </div>
    </motion.div>
  );
};

const Home = () => {
  const { rooms, roomsLoaded } = useAppContext();
  const [activeCategory, setActiveCategory] = useState("all");

  const isLoading = !roomsLoaded;

  const filteredRooms = useMemo(() => {
    if (activeCategory === "all") return rooms.slice(0, 8);
    return rooms.filter((r) => r.category === activeCategory).slice(0, 8);
  }, [rooms, activeCategory]);

  return (
    <>
      {/* Full-screen video hero */}
      <Hero />

      {/* Category tabs */}
      <CategoryTabs onSelect={setActiveCategory} />

      {/* ── Recommended Hotels Grid ────────────────────────────── */}
      <main id="main-content">
        <section
          aria-labelledby="hotels-heading"
          className="section-px py-20 md:py-32"
        >
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-end justify-between mb-14"
          >
            <div>
              <motion.p
                className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: "var(--color-primary)" }}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                Handpicked for You
              </motion.p>
              <h2
                id="hotels-heading"
                className="font-display text-3xl md:text-4xl font-bold"
                style={{ color: "var(--color-text-primary)" }}
              >
                {activeCategory === "all"
                  ? "Recommended Hotels"
                  : `${activeCategory} Hotels`}
              </h2>
              <p
                className="text-sm mt-2"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Top-rated stays selected just for your preferences
              </p>
            </div>

            <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.15 }}>
              <Link
                to="/rooms"
                className="text-sm font-semibold hidden md:flex items-center gap-1.5 transition-opacity hover:opacity-75"
                style={{ color: "var(--color-primary)" }}
              >
                View all
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-3.5 h-3.5"
                  aria-hidden="true"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            {STATS.map((s, i) => (
              <StatCard key={s.label} s={s} i={i} />
            ))}
          </div>

          {/* Hotel grid or skeletons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} index={i} />)
            ) : filteredRooms.length > 0 ? (
              filteredRooms.map((room, i) => (
                <HotelCard key={room._id} room={room} index={i} />
              ))
            ) : (
              <p
                className="col-span-4 text-center py-20"
                style={{ color: "var(--color-text-muted)" }}
              >
                No {activeCategory} hotels found. Try a different category.
              </p>
            )}
          </div>

          {/* Mobile — view all CTA */}
          <div className="text-center mt-14 md:hidden">
            <Link to="/rooms" className="btn-outline text-sm">
              View All Hotels →
            </Link>
          </div>
        </section>

        {/* How It Works — 3-step process */}
        <HowItWorks />

        {/* Flash Deals with countdown */}
        <FlashDeals />

        {/* Featured Indian Destinations */}
        <FeaturedDestination />

        {/* Exclusive Offers */}
        <ExclusiveOffers />

        {/* App Download Banner */}
        <AppBanner />

        {/* Testimonials */}
        <Testimonial />

        {/* Newsletter */}
        <Newsletter />
      </main>
    </>
  );
};

export default Home;
