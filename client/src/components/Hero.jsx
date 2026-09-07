import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../context/AppContext";

// ── Video sources — ALT plays first, then MAIN loops ──────────────────
const CLOUD           = "dgqgzmzed";
const HERO_VIDEO_ALT  = "https://res.cloudinary.com/dgqgzmzed/video/upload/v1782646953/hero_video_alt_bjksts.mp4";
const HERO_VIDEO_MAIN = "https://res.cloudinary.com/dgqgzmzed/video/upload/v1788525079/hotel_nyogv6.mp4";
const FALLBACK_POSTER = `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,w_1920,h_1080,c_fill,g_auto/yoyo/assets/hero_image`;

// ── Framer variants ────────────────────────────────────────────────────
const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.2 } },
};
const wordVariants = {
  hidden:  { opacity: 0, y: 36, rotateX: -20 },
  visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

// ── Scroll helper ──────────────────────────────────────────────────────
const scrollToDeals = () => {
  const el = document.getElementById("flash-deals");
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

// ── Ambient piano + electric keys via Web Audio API ───────────────────
// Uses sine/triangle oscillators layered to approximate soft piano tones.
// Chord progression: Fmaj7 → Am7 → Dm7 → C — repeating every ~16 s.
const CHORDS = [
  // Fmaj7: F4 A4 C5 E5
  [349.23, 440.00, 523.25, 659.25],
  // Am7:   A3 C4 E4 G4
  [220.00, 261.63, 329.63, 392.00],
  // Dm7:   D4 F4 A4 C5
  [293.66, 349.23, 440.00, 523.25],
  // C maj7: C4 E4 G4 B4
  [261.63, 329.63, 392.00, 493.88],
];

function createAmbientAudio(ctx) {
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 3); // gentle fade-in
  masterGain.connect(ctx.destination);

  const reverb = ctx.createConvolver();
  // Simple impulse response for reverb
  const rate = ctx.sampleRate;
  const length = rate * 2.5;
  const impulse = ctx.createBuffer(2, length, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
    }
  }
  reverb.buffer = impulse;
  reverb.connect(masterGain);

  const reverbGain = ctx.createGain();
  reverbGain.gain.value = 0.35;
  reverbGain.connect(reverb);

  const dryGain = ctx.createGain();
  dryGain.gain.value = 0.65;
  dryGain.connect(masterGain);

  let chordIndex = 0;
  const CHORD_DURATION = 4; // seconds per chord
  const oscillators = [];

  const playChord = (freqs, startTime) => {
    freqs.forEach((freq, i) => {
      // Piano-like: sine + slight triangle blend
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? "triangle" : "sine"; // bass note slightly warmer
      osc.frequency.setValueAtTime(freq, startTime);

      const env = ctx.createGain();
      // Attack → Decay → Sustain → Release envelope
      env.gain.setValueAtTime(0, startTime);
      env.gain.linearRampToValueAtTime(0.12 - i * 0.018, startTime + 0.04);   // attack
      env.gain.exponentialRampToValueAtTime(0.07 - i * 0.01, startTime + 0.5); // decay
      env.gain.setValueAtTime(0.05 - i * 0.008, startTime + CHORD_DURATION - 0.6); // sustain
      env.gain.linearRampToValueAtTime(0.0001, startTime + CHORD_DURATION);    // release

      osc.connect(env);
      env.connect(dryGain);
      env.connect(reverbGain);
      osc.start(startTime);
      osc.stop(startTime + CHORD_DURATION);
      oscillators.push(osc);
    });

    // Electric key shimmer — slightly detuned triangle an octave up
    freqs.slice(0, 2).forEach((freq) => {
      const shimmer = ctx.createOscillator();
      shimmer.type = "triangle";
      shimmer.frequency.setValueAtTime(freq * 2.002, startTime); // slight detune

      const shimEnv = ctx.createGain();
      shimEnv.gain.setValueAtTime(0, startTime);
      shimEnv.gain.linearRampToValueAtTime(0.025, startTime + 0.08);
      shimEnv.gain.exponentialRampToValueAtTime(0.0001, startTime + 2.0);

      shimmer.connect(shimEnv);
      shimEnv.connect(reverbGain);
      shimmer.start(startTime);
      shimmer.stop(startTime + 2.5);
      oscillators.push(shimmer);
    });
  };

  // Schedule chords continuously
  const scheduleAhead = 0.1;
  let nextChordTime = ctx.currentTime + 0.5;

  const scheduler = setInterval(() => {
    if (ctx.state === "closed") { clearInterval(scheduler); return; }
    while (nextChordTime < ctx.currentTime + scheduleAhead + CHORD_DURATION) {
      playChord(CHORDS[chordIndex % CHORDS.length], nextChordTime);
      chordIndex++;
      nextChordTime += CHORD_DURATION;
    }
  }, 200);

  return { masterGain, scheduler, oscillators };
}

// ── Hero Component ─────────────────────────────────────────────────────
const Hero = () => {
  const { navigate } = useAppContext();

  const videoRef    = useRef(null);
  const audioCtxRef = useRef(null);
  const audioNodes  = useRef(null);

  const [phase,    setPhase]    = useState("alt");   // "alt" | "main"
  const [isMuted,  setIsMuted]  = useState(true);
  const [audioReady, setAudioReady] = useState(false);

  // ── Video: when alt ends, switch to main (looping) ──────────────────
  const handleVideoEnded = useCallback(() => {
    if (phase === "alt") {
      setPhase("main");
    }
  }, [phase]);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.src = phase === "alt" ? HERO_VIDEO_ALT : HERO_VIDEO_MAIN;
    vid.loop = phase === "main";
    vid.load();
    vid.play().catch(() => {}); // silently ignore autoplay block
  }, [phase]);

  // ── Audio: init Web Audio on first user interaction ──────────────────
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;
    audioNodes.current = createAmbientAudio(ctx);
    setAudioReady(true);
  }, []);

  // Try to auto-start audio (works on some browsers after page interaction)
  useEffect(() => {
    const tryAutoInit = () => {
      initAudio();
      if (!isMuted && audioCtxRef.current?.state === "suspended") {
        audioCtxRef.current.resume();
      }
    };
    document.addEventListener("click",     tryAutoInit, { once: true });
    document.addEventListener("touchstart", tryAutoInit, { once: true });
    return () => {
      document.removeEventListener("click",     tryAutoInit);
      document.removeEventListener("touchstart", tryAutoInit);
    };
  }, [initAudio, isMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioNodes.current?.scheduler) clearInterval(audioNodes.current.scheduler);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  // ── Mute/Unmute ───────────────────────────────────────────────────────
  const toggleMute = () => {
    initAudio();
    const ctx = audioCtxRef.current;
    const nodes = audioNodes.current;
    if (!ctx || !nodes) return;

    if (isMuted) {
      // Unmute: resume context + fade in master gain
      ctx.resume().then(() => {
        nodes.masterGain.gain.cancelScheduledValues(ctx.currentTime);
        nodes.masterGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 1.2);
      });
      setIsMuted(false);
    } else {
      // Mute: fade out gracefully
      nodes.masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
      setTimeout(() => ctx.suspend(), 900);
      setIsMuted(true);
    }
  };

  return (
    <section className="relative w-full h-screen min-h-[640px] overflow-hidden -mt-[56px]">

      {/* -- Mobile fallback poster --------------------------------- */}
      <div
        className="md:hidden absolute inset-0 w-full h-full"
        style={{ background: `url(${FALLBACK_POSTER}) center/cover no-repeat` }}
      />

      {/* -- Sequential video player (desktop only) ---------------- */}
      <video
        ref={videoRef}
        className="hidden md:block absolute inset-0 w-full h-full object-cover scale-105"
        autoPlay
        muted
        playsInline
        poster={FALLBACK_POSTER}
        onEnded={handleVideoEnded}
        src={HERO_VIDEO_ALT}
      />

      {/* -- Cinematic overlays ------------------------------------ */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.8 }}
        style={{ background: "rgba(4,4,14,0.50)" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, rgba(4,4,14,0.25) 0%, rgba(4,4,14,0.35) 45%, rgba(4,4,14,0.80) 80%, rgba(4,4,14,0.96) 100%)",
        }}
      />
      {/* Top vignette */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 22%)" }}
      />
      {/* Animated red glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0.18, 0.30, 0.18] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: "radial-gradient(ellipse 70% 55% at 15% 115%, rgba(232,0,61,0.24) 0%, transparent 68%)",
        }}
      />

      {/* -- Content ----------------------------------------------- */}
      <div
        className="relative z-10 h-full flex flex-col items-center justify-center px-5 text-center"
        style={{ perspective: "900px", paddingBottom: "5vh" }}
      >
        {/* Headline — word-by-word stagger */}
        <motion.h1
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="font-display font-extrabold text-white leading-[1.06] mb-5 max-w-5xl"
          style={{
            fontSize: "clamp(2.6rem, 7.5vw, 5.6rem)",
            letterSpacing: "-0.038em",
            textShadow: "0 2px 48px rgba(0,0,0,0.65)",
          }}
        >
          {["Your", "Perfect"].map((w, i) => (
            <motion.span key={i} variants={wordVariants} className="inline-block mr-[0.22em]">{w}</motion.span>
          ))}
          <motion.span variants={wordVariants} className="inline-block mr-[0.22em]" style={{ color: "#FF3B6B" }}>Stay</motion.span>
          <br />
          {["is One", "Search"].map((w, i) => (
            <motion.span key={i} variants={wordVariants} className="inline-block mr-[0.22em]">{w}</motion.span>
          ))}
          <motion.span variants={wordVariants} className="inline-block" style={{ color: "#FF3B6B" }}>Away.</motion.span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
          className="text-lg max-w-lg mb-11 leading-relaxed"
          style={{ color: "rgba(255,255,255,0.68)", textShadow: "0 1px 14px rgba(0,0,0,0.55)" }}
        >
          Budget to luxury · 10,000+ verified hotels across India.
          Use the search bar above to find your ideal stay.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.78 }}
        >
          <motion.button
            onClick={() => navigate("/rooms")}
            whileHover={{ scale: 1.05, boxShadow: "0 16px 40px rgba(232,0,61,0.65)" }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 font-bold text-sm text-white"
            style={{
              background: "linear-gradient(135deg,#E8003D 0%,#B5002E 100%)",
              boxShadow: "0 8px 28px rgba(232,0,61,0.50)",
              padding: "14px 30px",
              borderRadius: "100px",
              letterSpacing: "0.02em",
              whiteSpace: "nowrap",
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            </svg>
            Explore Hotels
          </motion.button>

          <motion.button
            onClick={scrollToDeals}
            whileHover={{ scale: 1.04, background: "rgba(255,255,255,0.16)" }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 font-semibold text-sm text-white"
            style={{
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.28)",
              backdropFilter: "blur(12px)",
              padding: "14px 28px",
              borderRadius: "100px",
              letterSpacing: "0.01em",
              whiteSpace: "nowrap",
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            View Deals
          </motion.button>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="absolute bottom-8 flex flex-col items-center gap-1.5"
        >
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: "rgba(255,255,255,0.32)" }}
          >
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.9, ease: "easeInOut" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" className="w-5 h-5">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </motion.div>
        </motion.div>
      </div>

      {/* -- Sound toggle button (bottom-right) --------------------- */}
      <AnimatePresence>
        <motion.button
          key="sound-toggle"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.2, duration: 0.5 }}
          onClick={toggleMute}
          title={isMuted ? "Enable ambient music" : "Mute ambient music"}
          className="absolute bottom-8 right-6 z-20 flex items-center gap-2"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.18)",
            backdropFilter: "blur(10px)",
            borderRadius: "100px",
            padding: "8px 14px",
            color: "rgba(255,255,255,0.60)",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "background 0.2s, color 0.2s",
          }}
          whileHover={{
            background: "rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.95)",
          }}
          whileTap={{ scale: 0.94 }}
        >
          {isMuted ? (
            /* Muted icon */
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <line x1="23" y1="9" x2="17" y2="15"/>
              <line x1="17" y1="9" x2="23" y2="15"/>
            </svg>
          ) : (
            /* Sound on icon with animated bars */
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
            </svg>
          )}
          {isMuted ? "Music off" : "Music on"}
        </motion.button>
      </AnimatePresence>

    </section>
  );
};

export default Hero;
