import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { testimonials } from "../assets/assets";
import StarRating from "./StarRating";

const VISIBLE = 3; // cards shown at once

const TestimonialCard = ({ t, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.4, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    className="flex flex-col justify-between rounded-2xl p-6 h-full"
    style={{ background: "var(--color-surface-2)", boxShadow: "var(--shadow-md)" }}
  >
    {/* Quote */}
    <div>
      <div
        className="text-5xl font-serif leading-none mb-2"
        style={{ color: "var(--color-primary)", opacity: 0.22 }}
      >
        "
      </div>
      <p
        className="text-sm leading-relaxed -mt-3"
        style={{ color: "var(--color-text-primary)" }}
      >
        {t.review}
      </p>
    </div>

    {/* Author */}
    <div className="flex items-center gap-3 mt-5">
      <img
        src={t.image}
        alt={t.name}
        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        style={{ outline: "2px solid var(--color-primary)", outlineOffset: "2px" }}
      />
      <div className="min-w-0">
        <div className="font-bold text-xs truncate" style={{ color: "var(--color-text-primary)" }}>
          {t.name}
        </div>
        <div className="text-xs truncate" style={{ color: "var(--color-text-secondary)" }}>
          {t.address}
        </div>
      </div>
      <div className="ml-auto flex-shrink-0">
        <StarRating rating={t.rating} />
      </div>
    </div>
  </motion.div>
);

const Testimonial = () => {
  const total    = testimonials.length;
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % total);
    }, 4000);
  };

  const go = (idx) => { setCurrent((idx + total) % total); resetTimer(); };
  const prev = () => go(current - 1);
  const next = () => go(current + 1);

  useEffect(() => { resetTimer(); return () => clearInterval(timerRef.current); }, [total]);

  // Build the 3 visible items wrapping around the list
  const visible = Array.from({ length: VISIBLE }, (_, i) => testimonials[(current + i) % total]);

  return (
    <section className="py-16 px-4 md:px-16 lg:px-24 xl:px-32">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--color-primary)" }}>
          What Guests Say
        </p>
        <h2 className="font-display text-2xl md:text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>
          Loved by Travellers
        </h2>
      </motion.div>

      {/* Cards */}
      <div className="relative max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          <div key={current} className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[240px]">
            {visible.map((t, i) => (
              <TestimonialCard key={`${current}-${i}`} t={t} index={i} />
            ))}
          </div>
        </AnimatePresence>

        {/* Arrows */}
        <button
          onClick={prev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 md:-translate-x-7 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 z-10"
          style={{ background: "var(--color-surface-2)", boxShadow: "var(--shadow-md)" }}
          aria-label="Previous"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" style={{ color: "var(--color-text-primary)" }}>
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <button
          onClick={next}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 md:translate-x-7 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 z-10"
          style={{ background: "var(--color-surface-2)", boxShadow: "var(--shadow-md)" }}
          aria-label="Next"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" style={{ color: "var(--color-text-primary)" }}>
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>

        {/* Dots — one per testimonial */}
        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width:  i === current ? 20 : 7,
                height: 7,
                background: i === current ? "var(--color-primary)" : "var(--color-border-strong)",
              }}
              aria-label={`Review ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
