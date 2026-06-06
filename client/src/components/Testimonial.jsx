import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { testimonials } from "../assets/assets";
import StarRating from "./StarRating";

const Testimonial = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef(null);

  const total = testimonials.length;

  const go = (idx) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  };

  const prev = () => go((current - 1 + total) % total);
  const next = () => go((current + 1) % total);

  // Auto-advance
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setDirection(1);
      setCurrent((c) => (c + 1) % total);
    }, 4500);
    return () => clearInterval(timerRef.current);
  }, [total]);

  const variants = {
    enter:  (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60, scale: 0.97 }),
    center: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
    exit:   (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60, scale: 0.97, transition: { duration: 0.3 } }),
  };

  const t = testimonials[current];

  return (
    <section className="py-14 px-4 md:px-16 lg:px-24 xl:px-32">
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

      {/* Carousel */}
      <div className="relative max-w-2xl mx-auto">
        <div className="overflow-hidden rounded-3xl" style={{ background: "var(--color-surface-2)", boxShadow: "var(--shadow-xl)" }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="p-8 md:p-12"
            >
              {/* Big quote */}
              <div className="text-6xl font-serif leading-none mb-4" style={{ color: "var(--color-primary)", opacity: 0.25 }}>
                "
              </div>
              <p className="text-base md:text-lg leading-relaxed mb-6 -mt-4" style={{ color: "var(--color-text-primary)" }}>
                {t.review}
              </p>
              <div className="flex items-center gap-4">
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover ring-2"
                  style={{ ringColor: "var(--color-primary)" }}
                />
                <div>
                  <div className="font-bold text-sm" style={{ color: "var(--color-text-primary)" }}>{t.name}</div>
                  <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{t.address}</div>
                </div>
                <div className="ml-auto">
                  <StarRating rating={t.rating} />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={prev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          style={{ background: "var(--color-surface-2)", boxShadow: "var(--shadow-md)" }}
          aria-label="Previous review"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"
            style={{ color: "var(--color-text-primary)" }}>
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <button
          onClick={next}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          style={{ background: "var(--color-surface-2)", boxShadow: "var(--shadow-md)" }}
          aria-label="Next review"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"
            style={{ color: "var(--color-text-primary)" }}>
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-5">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === current ? 24 : 8,
                height: 8,
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
