import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { testimonials } from "../assets/assets";
import StarRating from "./StarRating";

const TOTAL = testimonials.length;

// Card content
const CardContent = ({ t }) => (
  <motion.div
    className="flex flex-col justify-between rounded-2xl p-6 h-full cursor-default relative overflow-hidden"
    style={{
      background: "var(--color-surface-2)",
      boxShadow: "var(--shadow-md)",
      border: "1px solid var(--color-border)",
    }}
    whileHover={{
      y: -6,
      boxShadow: "0 24px 52px rgba(0,0,0,0.16)",
      borderColor: "rgba(255,45,85,0.2)",
    }}
    transition={{ duration: 0.28, ease: [0.34, 1.56, 0.64, 1] }}
  >
    {/* Subtle top-edge accent line */}
    <div
      className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
      style={{
        background: "linear-gradient(90deg, var(--color-primary), transparent)",
        opacity: 0.35,
      }}
      aria-hidden="true"
    />

    <div>
      {/* Opening quote mark */}
      <div
        className="text-5xl font-serif leading-none mb-3 select-none"
        style={{ color: "var(--color-primary)", opacity: 0.18, lineHeight: 1 }}
        aria-hidden="true"
      >
        &ldquo;
      </div>
      <p className="text-sm leading-relaxed -mt-2" style={{ color: "var(--color-text-primary)" }}>
        {t.review}
      </p>
    </div>

    {/* Author */}
    <div className="flex items-center gap-3 mt-5 pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
      <img
        src={t.image}
        alt={t.name}
        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        style={{ outline: "2px solid var(--color-primary)", outlineOffset: "2px" }}
      />
      <div className="min-w-0 flex-1">
        <div className="font-bold text-xs" style={{ color: "var(--color-text-primary)" }}>{t.name}</div>
        <div className="text-xs truncate" style={{ color: "var(--color-text-secondary)" }}>{t.address}</div>
      </div>
      <div className="flex-shrink-0">
        <StarRating rating={t.rating} />
      </div>
    </div>
  </motion.div>
);

const Testimonial = () => {
  const [startIdx,  setStartIdx]  = useState(0);
  const [direction, setDirection] = useState(1);
  const timerRef    = useRef(null);
  const sectionRef  = useRef(null);

  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => advance(1), 35000);
  };

  const advance = (dir) => {
    setDirection(dir);
    setStartIdx(prev => (prev + dir + TOTAL) % TOTAL);
  };

  const next = () => { advance(1);  resetTimer(); };
  const prev = () => { advance(-1); resetTimer(); };

  useEffect(() => { resetTimer(); return () => clearInterval(timerRef.current); }, []);

  // Build 3 visible cards from the window
  const visible = [0, 1, 2].map(i => testimonials[(startIdx + i) % TOTAL]);

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="py-20 md:py-32 overflow-hidden relative"
      ref={sectionRef}
      style={{ background: "var(--color-surface)" }}
    >
      {/* Decorative background blobs */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-[0.04]"
          style={{ background: "var(--color-primary)", filter: "blur(80px)" }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-[0.04]"
          style={{ background: "var(--color-accent)", filter: "blur(80px)" }}
        />
      </div>

      <div className="section-px relative">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "var(--color-primary)" }}
          >
            What Guests Say
          </p>
          <h2
            id="testimonials-heading"
            className="font-display text-2xl md:text-4xl font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Loved by Travellers
          </h2>
          <p
            className="text-sm mt-3 max-w-md mx-auto"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Real guests, real experiences — from budget stays to luxury suites.
          </p>
        </motion.div>

        <div className="relative max-w-6xl mx-auto">
          {/* 3-column flex layout */}
          <div className="flex flex-col md:flex-row gap-5">
            <AnimatePresence mode="popLayout" initial={false}>
              {visible.map((t) => (
                <motion.div
                  layout
                  key={t.id}
                  custom={direction}
                  initial={{ opacity: 0, x: direction > 0 ? 90 : -90, filter: "blur(6px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: direction > 0 ? -90 : 90, filter: "blur(6px)" }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full md:w-[calc(33.333%-0.84rem)] flex-shrink-0"
                  style={{ minHeight: "220px" }}
                >
                  <CardContent t={t} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Navigation arrows */}
          <motion.button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 md:-translate-x-7 w-10 h-10 rounded-full flex items-center justify-center z-10"
            style={{
              background: "var(--color-surface-2)",
              boxShadow: "var(--shadow-md)",
              border: "1px solid var(--color-border)",
            }}
            whileHover={{ scale: 1.14, boxShadow: "var(--shadow-lg)" }}
            whileTap={{ scale: 0.88 }}
            aria-label="Previous testimonial"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" style={{ color: "var(--color-text-primary)" }}>
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </motion.button>

          <motion.button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 md:translate-x-7 w-10 h-10 rounded-full flex items-center justify-center z-10"
            style={{
              background: "var(--color-surface-2)",
              boxShadow: "var(--shadow-md)",
              border: "1px solid var(--color-border)",
            }}
            whileHover={{ scale: 1.14, boxShadow: "var(--shadow-lg)" }}
            whileTap={{ scale: 0.88 }}
            aria-label="Next testimonial"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" style={{ color: "var(--color-text-primary)" }}>
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </motion.button>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => {
                  const dir = i > startIdx ? 1 : -1;
                  setDirection(dir); setStartIdx(i);
                  resetTimer();
                }}
                className="rounded-full"
                animate={{
                  width: i === startIdx ? 24 : 7,
                  background: i === startIdx ? "var(--color-primary)" : "var(--color-border-strong)",
                }}
                style={{ height: 7 }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                aria-label={`Go to review ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
