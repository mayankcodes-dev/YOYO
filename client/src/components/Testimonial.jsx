import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { testimonials } from "../assets/assets";

gsap.registerPlugin(ScrollTrigger);

// ── Star renderer ──────────────────────────────────────────────
const Stars = ({ rating }) => (
  <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((s) => (
      <svg key={s} viewBox="0 0 12 12" className="w-3 h-3" fill={s <= rating ? "var(--color-accent)" : "none"} stroke={s <= rating ? "var(--color-accent)" : "var(--color-border-strong)"} strokeWidth="1">
        <path d="M6 1l1.39 2.82L10.5 4.27l-2.25 2.19.53 3.09L6 8.02l-2.78 1.53.53-3.09L1.5 4.27l3.11-.45L6 1z" />
      </svg>
    ))}
  </div>
);

// ── Single testimonial card ────────────────────────────────────
const TestimonialCard = ({ t }) => (
  <div
    className="testimonial-card relative flex-shrink-0 w-80 rounded-2xl p-5 mx-3 select-none"
    style={{
      background: "var(--color-surface-2)",
      border: "1px solid var(--color-border)",
      boxShadow: "var(--shadow-sm)",
      willChange: "transform",
    }}
    aria-label={`Review by ${t.name}`}
  >
    {/* Top accent line */}
    <div
      className="absolute top-0 left-6 right-6 h-[2px] rounded-full"
      style={{ background: "linear-gradient(90deg, var(--color-primary), var(--color-accent), transparent)", opacity: 0.5 }}
      aria-hidden="true"
    />

    {/* Quote mark */}
    <div
      className="text-5xl font-serif leading-none mb-2 select-none"
      style={{ color: "var(--color-primary)", opacity: 0.15, fontFamily: "Georgia, serif", lineHeight: 1 }}
      aria-hidden="true"
    >
      &ldquo;
    </div>

    {/* Review text */}
    <p className="text-sm leading-relaxed mb-4 line-clamp-4" style={{ color: "var(--color-text-primary)" }}>
      {t.review}
    </p>

    {/* Author footer */}
    <div className="flex items-center gap-3 pt-3 border-t" style={{ borderColor: "var(--color-border)" }}>
      <img
        src={t.image}
        alt={t.name}
        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
        style={{ outline: "2px solid var(--color-primary)", outlineOffset: "2px" }}
        loading="lazy"
      />
      <div className="min-w-0 flex-1">
        <div className="font-bold text-xs truncate" style={{ color: "var(--color-text-primary)" }}>{t.name}</div>
        <div className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>{t.address}</div>
      </div>
      <Stars rating={t.rating} />
    </div>
  </div>
);

// ── Infinite marquee row ───────────────────────────────────────
const MarqueeRow = ({ items, reverse = false, speed = 40 }) => {
  const trackRef = useRef(null);
  const tweenRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Wait one frame so DOM is painted and scrollWidth is accurate
    const rafId = requestAnimationFrame(() => {
      // We render 4 copies; one "set" is 1/4 of total scrollWidth
      const totalW = track.scrollWidth / 4;
      if (totalW <= 0) return;

      const from  = reverse ? -totalW : 0;
      const to    = reverse ? 0        : -totalW;

      // Start position
      gsap.set(track, { x: from });

      tweenRef.current = gsap.to(track, {
        x: to,
        duration: speed,
        ease: "none",
        repeat: -1,
        modifiers: {
          x: gsap.utils.unitize((x) => {
            const abs = totalW;
            // keep x inside [-totalW, 0]
            return ((parseFloat(x) % abs) - abs) % abs;
          }),
        },
      });

      // Pause when section leaves viewport
      ScrollTrigger.create({
        trigger: track.closest("section"),
        start: "top bottom",
        end: "bottom top",
        onEnter:      () => tweenRef.current?.play(),
        onLeave:      () => tweenRef.current?.pause(),
        onEnterBack:  () => tweenRef.current?.play(),
        onLeaveBack:  () => tweenRef.current?.pause(),
      });

      // Pause on hover
      const cards = track.querySelectorAll(".testimonial-card");
      const onEnter = () => tweenRef.current?.pause();
      const onLeave = () => tweenRef.current?.play();
      cards.forEach((c) => { c.addEventListener("mouseenter", onEnter); c.addEventListener("mouseleave", onLeave); });
    });

    return () => {
      cancelAnimationFrame(rafId);
      tweenRef.current?.kill();
    };
  }, [reverse, speed]);

  // Use 4 copies so even a small set (6 items) fills the track
  const quad = [...items, ...items, ...items, ...items];

  return (
    <div className="overflow-hidden w-full">
      <div ref={trackRef} className="flex" style={{ width: "max-content" }}>
        {quad.map((t, i) => (
          <TestimonialCard key={`${t.id}-${i}`} t={t} />
        ))}
      </div>
    </div>
  );
};

// ── Spotlight cursor effect ────────────────────────────────────
const useSpotlight = (sectionRef) => {
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const spotlight = document.createElement("div");
    spotlight.style.cssText = `
      position:absolute; width:500px; height:500px;
      border-radius:50%; pointer-events:none; z-index:0;
      background: radial-gradient(circle, rgba(255,45,85,0.07) 0%, transparent 70%);
      transform: translate(-50%, -50%);
      transition: opacity 0.3s ease;
      opacity: 0;
    `;
    section.style.position = "relative";
    section.appendChild(spotlight);

    const onMove = (e) => {
      const rect = section.getBoundingClientRect();
      gsap.to(spotlight, {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        duration: 0.6,
        ease: "power2.out",
      });
      spotlight.style.opacity = "1";
    };
    const onLeave = () => { spotlight.style.opacity = "0"; };

    section.addEventListener("mousemove", onMove);
    section.addEventListener("mouseleave", onLeave);
    return () => {
      section.removeEventListener("mousemove", onMove);
      section.removeEventListener("mouseleave", onLeave);
      spotlight.remove();
    };
  }, [sectionRef]);
};

// ── Main component ─────────────────────────────────────────────
const Testimonial = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const badgeRef   = useRef(null);

  useSpotlight(sectionRef);

  // Section heading entrance
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from([badgeRef.current, headingRef.current], {
        opacity: 0,
        y: 32,
        stagger: 0.12,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 82%",
          once: true,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // Split testimonials into two rows
  const half = Math.ceil(testimonials.length / 2);
  const row1 = testimonials.slice(0, half);
  const row2 = testimonials.slice(half);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="testimonials-heading"
      className="py-24 overflow-hidden"
      style={{ background: "var(--color-surface)" }}
    >
      {/* Ambient background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.035]"
          style={{ background: "var(--color-primary)", filter: "blur(100px)" }} />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full opacity-[0.03]"
          style={{ background: "var(--color-accent)", filter: "blur(80px)" }} />
      </div>

      {/* Heading */}
      <div className="text-center mb-14 px-4 relative z-10">
        <p
          ref={badgeRef}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
          style={{
            color: "var(--color-primary)",
            background: "var(--color-primary-light)",
            border: "1px solid rgba(255,45,85,0.18)",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--color-primary)" }} aria-hidden="true" />
          What Guests Say
        </p>
        <h2
          id="testimonials-heading"
          ref={headingRef}
          className="font-display text-3xl md:text-5xl font-bold"
          style={{ color: "var(--color-text-primary)" }}
        >
          Loved by{" "}
          <span
            className="relative inline-block"
            style={{ color: "var(--color-primary)" }}
          >
            Travellers
            <span
              className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full"
              style={{ background: "linear-gradient(90deg, var(--color-primary), var(--color-accent))" }}
              aria-hidden="true"
            />
          </span>
        </h2>
        <p className="text-sm mt-4 max-w-sm mx-auto" style={{ color: "var(--color-text-secondary)" }}>
          Real guests, real experiences — from budget stays to luxury suites.
        </p>
      </div>

      {/* Dual-row marquee */}
      <div className="space-y-4 relative z-10">
        <MarqueeRow items={row1} reverse={false} speed={50} />
        <MarqueeRow items={row2} reverse={true}  speed={44} />
      </div>
    </section>
  );
};

export default Testimonial;
