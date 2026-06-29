import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { testimonials } from "../assets/assets";
import StarRating from "./StarRating";

const VISIBLE = 3;
const TOTAL   = testimonials.length;

const cardVariants = {
  enter:  (dir) => ({ opacity: 0, x: dir > 0 ? 80 : -80 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
  exit:   (dir) => ({ opacity: 0, x: dir > 0 ? -80 : 80, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } }),
};

const TestimonialCard = ({ t, dir }) => (
  <motion.div
    key={t.id}
    custom={dir}
    variants={cardVariants}
    initial="enter"
    animate="center"
    exit="exit"
    className="flex flex-col justify-between rounded-2xl p-6 h-full"
    style={{ background: "var(--color-surface-2)", boxShadow: "var(--shadow-md)" }}
  >
    {/* Quote mark */}
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
  const [current,   setCurrent]   = useState(0);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef(null);

  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDirection(1);
      setCurrent((c) => (c + 1) % TOTAL);
    }, 4500);
  };

  const go = (idx, dir) => {
    setDirection(dir);
    setCurrent((idx + TOTAL) % TOTAL);
    resetTimer();
  };

  const prev = () => go(current - 1, -1);
  const next = () => go(current + 1,  1);

  useEffect(() => { resetTimer(); return () => clearInterval(timerRef.current); }, []);

  // 3 visible cards — only their keys change, so only entering/exiting card animates
  const visible = Array.from({ length: VISIBLE }, (_, i) => testimonials[(current + i) % TOTAL]);

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

      {/* Cards grid */}
      <div className="relative max-w-6xl mx-auto">

        {/* The 3-column grid — overflow hidden so exiting card doesn't spill */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
          {visible.map((t, colIdx) => (
            // Each column is a fixed-height slot; AnimatePresence swaps one card at a time
            <div key={colIdx} className="relative min-h-[220px]">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <TestimonialCard key={t.id} t={t} dir={direction} />
              </AnimatePresence>
            </div>
          ))}
        </div>

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

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i, i > current ? 1 : -1)}
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
