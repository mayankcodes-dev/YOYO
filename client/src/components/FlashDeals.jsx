import { useState, useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAppContext } from "../context/AppContext";

gsap.registerPlugin(Draggable, ScrollTrigger);

// ── Countdown hook ─────────────────────────────────────────────
const useCountdown = (targetDate) => {
  const calc = () => {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return { h: "00", m: "00", s: "00" };
    return {
      h: String(Math.floor(diff / 3600000) % 24).padStart(2, "0"),
      m: String(Math.floor(diff / 60000)   % 60).padStart(2, "0"),
      s: String(Math.floor(diff / 1000)    % 60).padStart(2, "0"),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [targetDate]); // eslint-disable-line react-hooks/exhaustive-deps
  return time;
};

// ── Flip digit cell ────────────────────────────────────────────
const FlipCell = ({ value }) => {
  const ref = useRef(null);
  const prevVal = useRef(value);

  useEffect(() => {
    if (ref.current && value !== prevVal.current) {
      gsap.fromTo(ref.current,
        { rotateX: -90, opacity: 0 },
        { rotateX: 0, opacity: 1, duration: 0.28, ease: "power2.out" }
      );
      prevVal.current = value;
    }
  }, [value]);

  return (
    <span
      ref={ref}
      className="inline-block min-w-[1.4ch] text-center font-black text-xs tabular-nums"
      style={{
        background: "rgba(255,255,255,0.15)",
        borderRadius: 4,
        padding: "2px 4px",
        color: "#fff",
        transformOrigin: "center top",
        perspective: "200px",
      }}
    >
      {value}
    </span>
  );
};

// ── Countdown display ──────────────────────────────────────────
const CountdownDisplay = ({ targetDate }) => {
  const { h, m, s } = useCountdown(targetDate);
  return (
    <div className="flex items-center gap-0.5" aria-label="Time remaining">
      <FlipCell value={h[0]} /><FlipCell value={h[1]} />
      <span className="text-white/60 font-black text-xs mx-0.5">:</span>
      <FlipCell value={m[0]} /><FlipCell value={m[1]} />
      <span className="text-white/60 font-black text-xs mx-0.5">:</span>
      <FlipCell value={s[0]} /><FlipCell value={s[1]} />
    </div>
  );
};

// ── Deal card ──────────────────────────────────────────────────
const FlashDealCard = ({ deal, index }) => {
  const { navigate } = useAppContext();
  const cardRef = useRef(null);

  // Card magnetic hover
  const onMouseMove = useCallback((e) => {
    const rect = cardRef.current.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
    const dy = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
    gsap.to(cardRef.current, {
      rotationY: dx * 6,
      rotationX: -dy * 4,
      y: -8,
      scale: 1.02,
      boxShadow: "0 28px 60px rgba(0,0,0,0.22)",
      duration: 0.3,
      ease: "power2.out",
    });
  }, []);

  const onMouseLeave = useCallback(() => {
    gsap.to(cardRef.current, {
      rotationX: 0, rotationY: 0, y: 0, scale: 1,
      boxShadow: "var(--shadow-lg)",
      duration: 0.5,
      ease: "elastic.out(1, 0.6)",
    });
  }, []);

  return (
    <div
      ref={cardRef}
      className="flash-deal-card relative flex-shrink-0 w-72 rounded-2xl overflow-hidden cursor-pointer"
      style={{
        boxShadow: "var(--shadow-lg)",
        transformStyle: "preserve-3d",
        perspective: "600px",
        willChange: "transform",
      }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={() => navigate("/rooms")}
      role="button"
      tabIndex={0}
      aria-label={`Flash deal: ${deal.title} — ${deal.discount}% off`}
      onKeyDown={(e) => e.key === "Enter" && navigate("/rooms")}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={deal.image}
          alt={deal.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

        {/* Pulsing discount badge */}
        <div
          className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-black text-white"
          style={{ background: "var(--color-primary)" }}
          aria-label={`${deal.discount}% discount`}
        >
          <span className="badge-pulse">{deal.discount}% OFF</span>
        </div>

        {/* LIVE indicator */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 live-dot" aria-hidden="true" />
          <span className="text-[10px] font-bold text-white/90">LIVE</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4" style={{ background: "var(--color-surface-2)" }}>
        <h3 className="font-bold text-base mb-0.5 truncate" style={{ color: "var(--color-text-primary)" }}>
          {deal.title}
        </h3>
        <p className="text-xs mb-3 flex items-center gap-1" style={{ color: "var(--color-text-secondary)" }}>
          <svg viewBox="0 0 16 16" className="w-3 h-3 flex-shrink-0" fill="var(--color-text-muted)">
            <path d="M8 1.5A5.5 5.5 0 1 0 8 14.5 5.5 5.5 0 0 0 8 1.5zm0-1a6.5 6.5 0 1 1 0 13A6.5 6.5 0 0 1 8 .5zm.5 4.75a.5.5 0 0 0-1 0V8a.5.5 0 0 0 .146.354l2 2a.5.5 0 0 0 .708-.708L8.5 7.793V5.25z" clipRule="evenodd" />
          </svg>
          {deal.location}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs line-through" style={{ color: "var(--color-text-muted)" }}>
              ₹{deal.originalPrice.toLocaleString("en-IN")}
            </span>
            <span className="block font-black text-lg leading-tight" style={{ color: "var(--color-primary)" }}>
              ₹{deal.discountedPrice.toLocaleString("en-IN")}
              <span className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>/night</span>
            </span>
          </div>
          <CountdownDisplay targetDate={deal.expiresAt} />
        </div>
      </div>
    </div>
  );
};

// ── Flash Deals section ────────────────────────────────────────
const DEALS = [
  { id: 1, title: "OYO Townhouse Goa",        location: "Calangute, Goa",            originalPrice: 3200, discountedPrice: 1899, discount: 41, image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80",  expiresAt: new Date(Date.now() + 4  * 3600000 + 23 * 60000).toISOString() },
  { id: 2, title: "Royal Rajput Heritage",     location: "Jaipur, Rajasthan",         originalPrice: 5500, discountedPrice: 3199, discount: 42, image: "https://images.unsplash.com/photo-1517840901100-8179e982acb7?w=600&q=80",  expiresAt: new Date(Date.now() + 8  * 3600000 + 47 * 60000).toISOString() },
  { id: 3, title: "Business Stay Mumbai",      location: "Andheri West, Mumbai",      originalPrice: 4000, discountedPrice: 2499, discount: 37, image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80",  expiresAt: new Date(Date.now() + 2  * 3600000 + 11 * 60000).toISOString() },
  { id: 4, title: "Lake View Udaipur",         location: "Lake Pichola, Udaipur",     originalPrice: 7200, discountedPrice: 4299, discount: 40, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",  expiresAt: new Date(Date.now() + 12 * 3600000 + 5  * 60000).toISOString() },
  { id: 5, title: "Himalayan Retreat",         location: "Old Manali, Himachal",      originalPrice: 2800, discountedPrice: 1599, discount: 43, image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",  expiresAt: new Date(Date.now() + 6  * 3600000 + 33 * 60000).toISOString() },
];

const FlashDeals = () => {
  const { navigate } = useAppContext();
  const trackRef     = useRef(null);
  const containerRef = useRef(null);
  const headerRef    = useRef(null);
  const draggableRef = useRef(null);

  // Arrow nav helper
  const scrollBy = (dir) => {
    const track     = trackRef.current;
    const container = containerRef.current;
    if (!track || !container) return;
    const cardW   = 288 + 16; // card width + gap
    const current = gsap.getProperty(track, "x") || 0;
    const maxX    = 0;
    const minX    = -(track.scrollWidth - container.clientWidth);
    const next    = Math.max(minX, Math.min(maxX, Number(current) + dir * -cardW));
    gsap.to(track, { x: next, duration: 0.45, ease: "power2.out" });
    if (draggableRef.current?.[0]) draggableRef.current[0].update();
  };

  // GSAP Draggable setup
  useEffect(() => {
    const track     = trackRef.current;
    const container = containerRef.current;
    if (!track || !container) return;

    const updateBounds = () => {
      const maxX = 0;
      const minX = -(track.scrollWidth - container.clientWidth);
      if (draggableRef.current?.[0]) {
        draggableRef.current[0].applyBounds({ minX, maxX });
      }
    };

    draggableRef.current = Draggable.create(track, {
      type:       "x",
      edgeResistance: 0.65,
      inertia:    true,
      cursor:     "grab",
      activeCursor: "grabbing",
      onDragStart() { gsap.set(track, { cursor: "grabbing" }); },
      onDragEnd()   { gsap.set(track, { cursor: "grab" }); },
      snap: {
        x: (v) => {
          const cardW = 288 + 16; // w-72 (288px) + gap-4 (16px)
          return Math.round(v / cardW) * cardW;
        },
      },
    });

    updateBounds();
    window.addEventListener("resize", updateBounds);
    return () => {
      draggableRef.current?.forEach((d) => d.kill());
      window.removeEventListener("resize", updateBounds);
    };
  }, []);

  // Card entrance animation
  useEffect(() => {
    const cards = trackRef.current?.querySelectorAll(".flash-deal-card");
    if (!cards?.length) return;

    const ctx = gsap.context(() => {
      gsap.from(cards, {
        opacity: 0,
        y: 50,
        rotateY: 20,
        stagger: 0.1,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 82%",
          once: true,
        },
      });
    });
    return () => ctx.revert();
  }, []);

  // Header animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current?.children, {
        opacity: 0,
        y: 24,
        stagger: 0.09,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top 85%",
          once: true,
        },
      });
    }, headerRef);
    return () => ctx.revert();
  }, []);

  // Lightning bolt animation (continuous)
  const boltRef = useRef(null);
  useEffect(() => {
    if (!boltRef.current) return;
    const tl = gsap.timeline({ repeat: -1 });
    tl.to(boltRef.current, { rotation: 15, duration: 0.15, ease: "power1.inOut" })
      .to(boltRef.current, { rotation: -15, duration: 0.15, ease: "power1.inOut" })
      .to(boltRef.current, { rotation: 0,   duration: 0.1,  ease: "power1.out" })
      .to(boltRef.current, { opacity: 0.4,  duration: 0.2 })
      .to(boltRef.current, { opacity: 1,    duration: 0.2 })
      .to({}, { duration: 1.8 }); // pause between zaps
    return () => tl.kill();
  }, []);

  return (
    <section id="flash-deals" className="py-12 px-4 md:px-16 lg:px-24 xl:px-32">
      {/* Header */}
      <div ref={headerRef} className="flex items-end justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <svg
              ref={boltRef}
              viewBox="0 0 24 24"
              fill="var(--color-primary)"
              className="w-5 h-5"
              aria-hidden="true"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span
              className="text-xs font-black uppercase tracking-widest"
              style={{ color: "var(--color-primary)" }}
            >
              Flash Deals
            </span>
            <span
              className="live-badge flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{
                background: "rgba(48,209,88,0.12)",
                border: "1px solid rgba(48,209,88,0.3)",
                color: "#30D158",
              }}
            >
              <span className="w-1 h-1 rounded-full bg-green-400 live-dot" aria-hidden="true" />
              LIVE
            </span>
          </div>
          <h2
            className="font-display text-2xl md:text-3xl font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Today&apos;s Hot Offers
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
            Limited-time deals — drag to explore · ends when the clock hits zero
          </p>
        </div>

        {/* Nav arrows + view-all */}
        <div className="flex items-center gap-2">
          {/* Prev */}
          <button
            onClick={() => scrollBy(-1)}
            aria-label="Previous deals"
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
            style={{
              background: "var(--color-surface-3)",
              border: "1px solid var(--color-border-strong)",
              color: "var(--color-text-secondary)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-surface-2)"; e.currentTarget.style.color = "var(--color-text-primary)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--color-surface-3)"; e.currentTarget.style.color = "var(--color-text-secondary)"; }}
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M13 4l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {/* Next */}
          <button
            onClick={() => scrollBy(1)}
            aria-label="Next deals"
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
            style={{
              background: "var(--color-surface-3)",
              border: "1px solid var(--color-border-strong)",
              color: "var(--color-text-secondary)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-surface-2)"; e.currentTarget.style.color = "var(--color-text-primary)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--color-surface-3)"; e.currentTarget.style.color = "var(--color-text-secondary)"; }}
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M7 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {/* View all — desktop */}
          <button
            className="text-sm font-bold hidden md:flex items-center gap-1 transition-all ml-2"
            style={{ color: "var(--color-primary)" }}
            onMouseEnter={(e) => gsap.to(e.currentTarget, { x: 4, duration: 0.2 })}
            onMouseLeave={(e) => gsap.to(e.currentTarget, { x: 0, duration: 0.2 })}
            onClick={() => navigate("/rooms")}
          >
            View all
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Draggable track */}
      <div
        ref={containerRef}
        className="overflow-hidden"
        style={{ cursor: "grab" }}
        aria-label="Flash deals carousel — drag to scroll"
      >
        <div
          ref={trackRef}
          className="flex gap-4 pb-2"
          style={{ width: "max-content", touchAction: "none" }}
        >
          {DEALS.map((deal, i) => (
            <FlashDealCard key={deal.id} deal={deal} index={i} />
          ))}
        </div>
      </div>

      {/* Drag hint */}
      <p className="text-center text-xs mt-4 md:hidden" style={{ color: "var(--color-text-muted)" }}>
        ← Swipe to see more deals →
      </p>
    </section>
  );
};

export default FlashDeals;
