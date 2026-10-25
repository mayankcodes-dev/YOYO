import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAppContext } from "../context/AppContext";
import usePWAInstall from "../hooks/usePWAInstall";

gsap.registerPlugin(ScrollTrigger);

// ── Animated stat counter ─────────────────────────────────────────────────────
const StatCounter = ({ end, suffix, label, icon }) => {
  const numRef  = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const el = numRef.current;
    if (!el) return;
    gsap.from(el, {
      textContent: 0,
      duration: 2,
      ease: "power2.out",
      snap: { textContent: 1 },
      scrollTrigger: { trigger: wrapRef.current, start: "top 88%", once: true },
      onUpdate() { el.textContent = Math.floor(Number(el.textContent)).toLocaleString("en-IN") + suffix; },
    });
  }, [end, suffix]);

  return (
    <div ref={wrapRef} className="flex flex-col items-center gap-1">
      <div className="text-2xl mb-0.5" aria-hidden="true">{icon}</div>
      <div className="font-display font-black text-3xl md:text-4xl" style={{ color: "#fff" }}>
        <span ref={numRef}>{end.toLocaleString("en-IN")}{suffix}</span>
      </div>
      <div className="text-xs text-white/50 tracking-wide text-center">{label}</div>
    </div>
  );
};

// ── Feature pill ──────────────────────────────────────────────────────────────
const FeaturePill = ({ icon, text, delay = 0 }) => {
  const ref = useRef(null);
  useEffect(() => {
    gsap.from(ref.current, {
      opacity: 0, scale: 0.8, y: 16, duration: 0.5, delay,
      ease: "back.out(1.5)",
      scrollTrigger: { trigger: ref.current, start: "top 90%", once: true },
    });
  }, [delay]);

  return (
    <div
      ref={ref}
      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-white/90"
      style={{
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.13)",
        backdropFilter: "blur(12px)",
      }}
    >
      <span className="text-base" aria-hidden="true">{icon}</span>
      {text}
    </div>
  );
};

// ── App Banner ────────────────────────────────────────────────────────────────
const AppBanner = () => {
  const { navigate } = useAppContext();

  // Use the shared singleton hook — no competing event listeners
  const { isInstalled, isIOS, triggerInstall } = usePWAInstall();
  const [showIOSHint, setShowIOSHint] = useState(false);

  const handleInstall = async () => {
    const outcome = await triggerInstall();
    if (outcome === 'ios' || outcome === 'unavailable') {
      setShowIOSHint(true);
    }
  };

  // ── GSAP refs ─────────────────────────────────────────────────────────────
  const sectionRef = useRef(null);
  const textRef    = useRef(null);
  const orb1Ref    = useRef(null);
  const orb2Ref    = useRef(null);
  const badgeRef   = useRef(null);
  const gridRef    = useRef(null);

  // Text stagger entrance
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(textRef.current?.children, {
        opacity: 0, y: 44, stagger: 0.1, duration: 0.75, ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true },
      });

      // Badge entrance
      gsap.from(badgeRef.current, {
        opacity: 0, scale: 0.7, duration: 0.5, ease: "back.out(1.8)",
        scrollTrigger: { trigger: sectionRef.current, start: "top 78%", once: true },
      });

      // Feature grid entrance
      if (gridRef.current) {
        gsap.from(Array.from(gridRef.current.children), {
          opacity: 0, y: 32, stagger: 0.08, duration: 0.55, ease: "power2.out",
          scrollTrigger: { trigger: gridRef.current, start: "top 82%", once: true },
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // Floating orb animations
  useEffect(() => {
    if (orb1Ref.current) {
      gsap.to(orb1Ref.current, { x: 30, y: -20, duration: 5, ease: "sine.inOut", yoyo: true, repeat: -1 });
    }
    if (orb2Ref.current) {
      gsap.to(orb2Ref.current, { x: -25, y: 18, duration: 6.5, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1 });
    }
  }, []);

  const features = [
    { icon: "⚡", text: "Works offline — browse saved hotels anytime" },
    { icon: "🎁", text: "App-exclusive 15% off on select stays" },
    { icon: "🔔", text: "One-tap check-in & instant notifications" },
    { icon: "🚀", text: "Lightning-fast — native app experience" },
  ];

  return (
    <section
      ref={sectionRef}
      aria-label="Download YoYo Rooms App"
      className="py-12 px-4 md:px-16 lg:px-24 xl:px-32"
    >
      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0D0D1A 0%, #16213E 50%, #1A0A22 100%)",
          boxShadow: "var(--shadow-xl)",
          minHeight: "420px",
        }}
      >
        {/* ── Ambient mesh gradient ─────────────────── */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage: `
              radial-gradient(circle at 12% 70%, rgba(255,45,85,0.30) 0%, transparent 55%),
              radial-gradient(circle at 85% 18%, rgba(255,159,10,0.20) 0%, transparent 48%),
              radial-gradient(circle at 55% 100%, rgba(108,59,213,0.15) 0%, transparent 42%)
            `,
          }}
        />

        {/* ── Floating orbs ─────────────────────────── */}
        <div
          ref={orb1Ref}
          className="absolute rounded-full pointer-events-none"
          aria-hidden="true"
          style={{
            width: 260, height: 260,
            top: "-80px", right: "10%",
            background: "radial-gradient(circle, rgba(255,45,85,0.18) 0%, transparent 70%)",
            filter: "blur(32px)",
          }}
        />
        <div
          ref={orb2Ref}
          className="absolute rounded-full pointer-events-none"
          aria-hidden="true"
          style={{
            width: 200, height: 200,
            bottom: "-40px", left: "5%",
            background: "radial-gradient(circle, rgba(108,59,213,0.20) 0%, transparent 70%)",
            filter: "blur(28px)",
          }}
        />

        {/* ── Noise texture overlay ──────────────────── */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          aria-hidden="true"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          }}
        />

        {/* ── Inner grid layout ─────────────────────── */}
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10 p-8 md:p-12 lg:p-14">

          {/* ── Left: Text content ────────────────────── */}
          <div ref={textRef} className="flex-1 flex flex-col gap-5 max-w-xl">

            {/* Badge */}
            <div
              ref={badgeRef}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold w-fit"
              style={{ background: "rgba(255,45,85,0.18)", border: "1px solid rgba(255,45,85,0.35)", color: "#FF6B8A" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D55] animate-pulse" />
              Free — No App Store Needed
            </div>

            {/* Headline */}
            <h2
              className="font-display font-black text-4xl md:text-5xl leading-[1.08] text-white"
              style={{ letterSpacing: "-0.025em" }}
            >
              Install the{" "}
              <span
                className="inline-block px-3 py-1 rounded-xl text-white"
                style={{ background: "linear-gradient(135deg, #FF2D55, #FF9F0A)" }}
              >
                YoYo App
              </span>
            </h2>

            {/* Sub */}
            <p className="text-white/62 text-base leading-relaxed max-w-md">
              Install the YoYo Mobile App on your phone — no app store, no waiting.
              One tap and it lives on your home screen like a native app.
            </p>

            {/* Feature pills grid */}
            <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1">
              {features.map((f, i) => (
                <FeaturePill key={i} icon={f.icon} text={f.text} delay={i * 0.07} />
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {isInstalled ? (
                <div
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white"
                  style={{ background: "rgba(48,209,88,0.20)", border: "1px solid rgba(48,209,88,0.35)" }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-green-400"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>
                  App Installed ✓
                </div>
              ) : (
                <button
                  onClick={handleInstall}
                  className="group flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm relative overflow-hidden text-[#0D0D1A] transition-all duration-200 hover:scale-[1.03]"
                  style={{ background: "#FFFFFF", boxShadow: "0 8px 32px rgba(255,255,255,0.15)" }}
                  aria-label="Install YoYo Rooms as a Progressive Web App"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-5 h-5">
                    <path d="M12 2v13m0 0l-4-4m4 4l4-4M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>
                    <span className="block text-[10px] opacity-50 leading-none">Install free</span>
                    <span className="font-black text-sm leading-tight">Download App</span>
                  </span>
                </button>
              )}

              <button
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-[1.03]"
                style={{ border: "1px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.06)" }}
                onClick={() => navigate("/rooms")}
              >
                Book via Web
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* iOS hint */}
            {showIOSHint && (
              <p className="text-white/45 text-xs leading-relaxed">
                {isIOS
                  ? '📱 On iPhone: tap the Share icon → "Add to Home Screen"'
                  : '💡 In Chrome: tap ⋮ menu → "Add to Home screen" or "Install app"'}
              </p>
            )}
          </div>

          {/* ── Right: Stats + abstract visual grid ───── */}
          <div className="flex flex-col items-center gap-8">
            {/* Stat counters in a glassy card */}
            <div
              className="grid grid-cols-3 gap-8 px-10 py-8 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)",
                backdropFilter: "blur(20px)",
              }}
            >
              <StatCounter end={50000} suffix="+" label="Happy Guests" icon="😊" />
              <StatCounter end={4.8}   suffix="★" label="App Rating"   icon="⭐" />
              <StatCounter end={10000} suffix="+" label="Hotels Listed" icon="🏨" />
            </div>

            {/* Abstract hotel card grid — decorative */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
              {[
                { city: "Goa",     label: "₹1,899/night", bg: "linear-gradient(135deg,#FF2D55,#FF6B35)", img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=240&q=70" },
                { city: "Jaipur",  label: "₹3,199/night", bg: "linear-gradient(135deg,#FF9F0A,#FF6B35)", img: "https://images.unsplash.com/photo-1517840901100-8179e982acb7?w=240&q=70" },
                { city: "Udaipur", label: "₹4,299/night", bg: "linear-gradient(135deg,#6C3BD5,#FF2D55)", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=240&q=70" },
                { city: "Manali",  label: "₹1,599/night", bg: "linear-gradient(135deg,#30D158,#0A84FF)", img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=240&q=70" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="relative rounded-2xl overflow-hidden group cursor-pointer"
                  style={{ height: 120, boxShadow: "0 8px 24px rgba(0,0,0,0.35)" }}
                  onClick={() => navigate("/rooms")}
                >
                  <img src={item.img} alt={item.city} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)" }} />
                  <div className="absolute bottom-2 left-3 right-2">
                    <div className="text-white font-bold text-xs leading-tight">{item.city}</div>
                    <div className="text-white/70 text-[10px]">{item.label}</div>
                  </div>
                  {/* Hover accent line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: item.bg }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppBanner;
