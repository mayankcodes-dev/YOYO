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

// ── Birds-style Indie-Pop Ambient Music via Web Audio API ─────────────
// Original composition inspired by the style of atmospheric indie-pop.
// Key: A major  |  BPM: 76  |  Progression: I → VIm → IV → V
// Layers: arpeggiated piano (8th notes) + warm synth pad + sub-bass
//         + soft kick pulse + shimmer bell overtones + plate reverb

const NOTE = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

// A major — I VI IV V  (MIDI root, 3rd, 5th, octave for each chord)
// A maj:  A3  C#4 E4  A4   → [57, 61, 64, 69]
// F# min: F#3 A3  C#4 F#4  → [54, 57, 61, 66]
// D maj:  D3  F#3 A3  D4   → [50, 54, 57, 62]
// E maj:  E3  G#3 B3  E4   → [52, 56, 59, 64]
const CHORDS = [
  [57, 61, 64, 69].map(NOTE),   // A major
  [54, 57, 61, 66].map(NOTE),   // F# minor
  [50, 54, 57, 62].map(NOTE),   // D major
  [52, 56, 59, 64].map(NOTE),   // E major
];

// 8th-note arpeggio shape for each chord: indices into chord notes array
// Goes up then gently down — classic bright indie-pop arpeggio feel
const ARP_SHAPE = [0, 1, 2, 3, 2, 1, 3, 1];   // 8 × 8th notes per bar

// High shimmer melody (MIDI, beat-offset within the 2-bar chord window)
const SHIMMER_LINES = [
  [[81, 0.4], [83, 1.6], [85, 3.2], [83, 5.0]],   // over A
  [[78, 0.4], [81, 2.0], [78, 4.4]],              // over F#m
  [[74, 0.0], [78, 1.6], [79, 3.6], [78, 5.2]],   // over D
  [[76, 0.4], [78, 2.0], [76, 4.0], [74, 5.6]],   // over E
];

function buildReverb(ctx, decaySec = 2.8) {
  const conv = ctx.createConvolver();
  const rate = ctx.sampleRate;
  const len  = Math.floor(rate * decaySec);
  const buf  = ctx.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      const earlyBoost = i < rate * 0.03 ? 2.0 : 1;   // bright early reflections
      d[i] = (Math.random() * 2 - 1) * earlyBoost * Math.pow(1 - i / len, 1.8);
    }
  }
  conv.buffer = buf;
  return conv;
}

function createAmbientAudio(ctx) {
  // ── Master bus ────────────────────────────────────────────────────────
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.20, ctx.currentTime + 3.5);
  masterGain.connect(ctx.destination);

  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -4;
  limiter.knee.value      = 3;
  limiter.ratio.value     = 16;
  limiter.attack.value    = 0.001;
  limiter.release.value   = 0.12;
  limiter.connect(masterGain);

  // Plate reverb — brighter / shorter than hall, suits indie-pop
  const reverb = buildReverb(ctx, 2.8);
  reverb.connect(limiter);
  const revSend = ctx.createGain();
  revSend.gain.value = 0.42;
  revSend.connect(reverb);

  const drySend = ctx.createGain();
  drySend.gain.value = 0.58;
  drySend.connect(limiter);

  // Stereo widener (subtle ping-pong on the arp)
  const pingL = ctx.createDelay(0.06); pingL.delayTime.value = 0.018;
  const pingR = ctx.createDelay(0.06); pingR.delayTime.value = 0.024;
  const pL = ctx.createStereoPanner(); pL.pan.value = -0.55;
  const pR = ctx.createStereoPanner(); pR.pan.value =  0.55;
  const pingGain = ctx.createGain(); pingGain.gain.value = 0.14;
  pingL.connect(pL); pL.connect(pingGain);
  pingR.connect(pR); pR.connect(pingGain);
  pingGain.connect(limiter);

  // ── Piano note — additive harmonics (piano-like timbre) ──────────────
  const playPiano = (freq, t, peakGain, dur) => {
    // 1st, 2nd, 3rd, 4th, 5th partial — each decays at different rate
    [[1, 1.0, dur*0.85], [2, 0.40, dur*0.50], [3, 0.20, dur*0.30],
     [4, 0.10, dur*0.18], [5, 0.05, dur*0.12]].forEach(([ratio, rel, decay]) => {
      const osc = ctx.createOscillator();
      osc.type  = ratio === 1 ? "triangle" : "sine";
      osc.frequency.value = freq * ratio;
      const env = ctx.createGain();
      const g = peakGain * rel;
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(g, t + 0.008);           // fast attack
      env.gain.setTargetAtTime(g * 0.3, t + 0.012, decay * 0.07); // decay
      env.gain.setTargetAtTime(0.00001, t + decay * 0.5, decay * 0.22); // release
      osc.connect(env);
      env.connect(drySend); env.connect(revSend);
      env.connect(pingL);   env.connect(pingR);
      osc.start(t); osc.stop(t + dur + 0.4);
    });
  };

  // ── Synth pad — warm, slowly swelling (two detuned sines per note) ───
  const playPad = (freqs, t, dur) => {
    freqs.forEach((freq, i) => {
      [-2, 2].forEach((cents) => {
        const osc = ctx.createOscillator();
        osc.type  = "sine";
        osc.frequency.value = freq * Math.pow(2, cents / 1200);
        const env = ctx.createGain();
        const peak = 0.035 - i * 0.005;
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(peak, t + 2.2);          // slow swell
        env.gain.setValueAtTime(peak, t + dur - 1.4);
        env.gain.linearRampToValueAtTime(0.00001, t + dur + 1.0);
        const lpf = ctx.createBiquadFilter();
        lpf.type = "lowpass"; lpf.frequency.value = 800 + i * 100; lpf.Q.value = 0.4;
        osc.connect(lpf); lpf.connect(env);
        env.connect(revSend); env.connect(pingL); env.connect(pingR);
        osc.start(t); osc.stop(t + dur + 1.5);
      });
    });
  };

  // ── Sub-bass — one sine per chord, warm and anchoring ────────────────
  const playBass = (freq, t, dur) => {
    const osc = ctx.createOscillator();
    osc.type  = "sine";
    osc.frequency.value = freq * 0.5;   // octave below root
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.06, t + 0.12);
    env.gain.exponentialRampToValueAtTime(0.03, t + dur * 0.45);
    env.gain.linearRampToValueAtTime(0.00001, t + dur);
    const lpf = ctx.createBiquadFilter();
    lpf.type = "lowpass"; lpf.frequency.value = 140;
    osc.connect(lpf); lpf.connect(env);
    env.connect(drySend); env.connect(revSend);
    osc.start(t); osc.stop(t + dur + 0.2);
  };

  // ── Soft kick pulse — sine thump, one per beat ───────────────────────
  const playKick = (t) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.08);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.12, t + 0.005);
    env.gain.exponentialRampToValueAtTime(0.00001, t + 0.28);
    const lpf = ctx.createBiquadFilter();
    lpf.type = "lowpass"; lpf.frequency.value = 180;
    osc.connect(lpf); lpf.connect(env); env.connect(drySend);
    osc.start(t); osc.stop(t + 0.35);
  };

  // ── Bell shimmer — sparse, high, slightly inharmonic ─────────────────
  const playShimmer = (freq, t) => {
    [1, 2.76, 5.4].forEach((ratio, i) => {
      const osc = ctx.createOscillator();
      osc.type  = "sine";
      osc.frequency.value = freq * ratio;
      const env = ctx.createGain();
      const peaks = [0.05, 0.018, 0.006];
      const decays = [2.8, 1.5, 0.8];
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(peaks[i], t + 0.006);
      env.gain.exponentialRampToValueAtTime(0.00001, t + decays[i]);
      osc.connect(env); env.connect(revSend); env.connect(drySend);
      osc.start(t); osc.stop(t + decays[i] + 0.2);
    });
  };

  // ── Scheduler ─────────────────────────────────────────────────────────
  const BPM        = 76;
  const BEAT       = 60 / BPM;                  // 0.789 s
  const EIGHTH     = BEAT / 2;                   // 0.395 s — arpeggio step
  const CHORD_BARS = 2;                          // each chord lasts 2 bars
  const CHORD_DUR  = CHORD_BARS * BEAT * 4;      // 4/4 time → ~6.32 s
  const LOOK_AHEAD = 0.35;

  let chordIdx   = 0;
  let nextTime   = ctx.currentTime + 0.6;

  const scheduleChord = (idx, t) => {
    const notes   = CHORDS[idx % CHORDS.length];
    const shimmer = SHIMMER_LINES[idx % SHIMMER_LINES.length];

    // Pad — full chord duration
    playPad(notes, t, CHORD_DUR);

    // Bass
    playBass(notes[0], t, CHORD_DUR);

    // Arpeggiated piano — 8th notes × 2 bars = 16 hits
    const totalEighths = CHORD_BARS * 8;
    for (let s = 0; s < totalEighths; s++) {
      const noteIdx = ARP_SHAPE[s % ARP_SHAPE.length];
      const noteT   = t + s * EIGHTH;
      // Accent beat 1 slightly
      const accent  = (s % 8 === 0) ? 1.2 : 1.0;
      playPiano(notes[noteIdx], noteT, 0.092 * accent, EIGHTH * 2.2);
    }

    // Soft kick on beats 1 & 3 of each bar
    for (let bar = 0; bar < CHORD_BARS; bar++) {
      playKick(t + bar * BEAT * 4);             // beat 1
      playKick(t + bar * BEAT * 4 + BEAT * 2);  // beat 3
    }

    // Shimmer melody
    shimmer.forEach(([midi, offset]) => {
      if (t + offset < ctx.currentTime - 0.05) return;
      playShimmer(NOTE(midi), t + offset);
    });
  };

  const scheduler = setInterval(() => {
    if (ctx.state === "closed") { clearInterval(scheduler); return; }
    while (nextTime < ctx.currentTime + LOOK_AHEAD + CHORD_DUR) {
      scheduleChord(chordIdx, nextTime);
      chordIdx++;
      nextTime += CHORD_DUR;
    }
  }, 80);

  return { masterGain, scheduler };
}



// ── Hero Component ─────────────────────────────────────────────────────
const Hero = () => {
  const { navigate } = useAppContext();

  const videoRef    = useRef(null);
  const audioCtxRef = useRef(null);
  const audioNodes  = useRef(null);
  const sectionRef  = useRef(null);
  // Stable ref for isMuted so the IntersectionObserver closure always reads current value
  const isMutedRef  = useRef(true);

  const [phase,   setPhase]   = useState("alt");  // "alt" | "main"
  const [isMuted, setIsMuted] = useState(true);

  // Keep ref in sync with state
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  // ── Video: when alt ends, switch to main (looping) ──────────────────
  const handleVideoEnded = useCallback(() => {
    if (phase === "alt") setPhase("main");
  }, [phase]);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.src  = phase === "alt" ? HERO_VIDEO_ALT : HERO_VIDEO_MAIN;
    vid.loop = phase === "main";
    vid.load();
    vid.play().catch(() => {});
  }, [phase]);

  // ── Audio: lazy-init Web Audio context ──────────────────────────────
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return audioCtxRef.current;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;
    audioNodes.current  = createAmbientAudio(ctx);
    return ctx;
  }, []);

  // ── Fade helpers ─────────────────────────────────────────────────────
  const fadeIn = useCallback(() => {
    const ctx   = audioCtxRef.current;
    const nodes = audioNodes.current;
    if (!ctx || !nodes) return;
    ctx.resume().then(() => {
      nodes.masterGain.gain.cancelScheduledValues(ctx.currentTime);
      nodes.masterGain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 1.5);
    });
  }, []);

  const fadeOut = useCallback(() => {
    const ctx   = audioCtxRef.current;
    const nodes = audioNodes.current;
    if (!ctx || !nodes) return;
    nodes.masterGain.gain.cancelScheduledValues(ctx.currentTime);
    nodes.masterGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
    setTimeout(() => {
      if (audioCtxRef.current?.state === "running") audioCtxRef.current.suspend();
    }, 1400);
  }, []);

  // ── IntersectionObserver — hero >10% visible → play; <10% → pause ───
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Entering view: initialise audio engine on very first observation
          initAudio();
          // Only play if the user has not manually muted
          if (!isMutedRef.current) fadeIn();
        } else {
          // Left view: always silence — regardless of mute toggle state
          fadeOut();
        }
      },
      { threshold: 0.1 }   // fires when 10% of section crosses the viewport edge
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [initAudio, fadeIn, fadeOut]); // stable callbacks — runs once

  // ── Cleanup on unmount ───────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (audioNodes.current?.scheduler) clearInterval(audioNodes.current.scheduler);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  // ── Manual mute / unmute toggle ──────────────────────────────────────
  const toggleMute = () => {
    // Always init on first user gesture (satisfies browser autoplay policy)
    initAudio();
    if (isMuted) {
      setIsMuted(false);
      fadeIn();   // start music immediately on unmute
    } else {
      setIsMuted(true);
      fadeOut();  // gracefully silence on mute
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen min-h-[640px] overflow-hidden -mt-[56px]"
    >

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

      {/* -- Sound toggle (bottom-right) ----------------------------- */}
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
            background:   isMuted ? "rgba(255,255,255,0.08)"    : "rgba(232,0,61,0.15)",
            border:       isMuted ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(232,0,61,0.35)",
            backdropFilter: "blur(10px)",
            borderRadius: "100px",
            padding:      "8px 14px",
            color:        isMuted ? "rgba(255,255,255,0.60)"    : "rgba(255,100,120,0.95)",
            fontSize:     "11px",
            fontWeight:   600,
            letterSpacing:"0.06em",
            textTransform:"uppercase",
            cursor:       "pointer",
            transition:   "background 0.3s, color 0.3s, border 0.3s",
          }}
          whileHover={{
            background: isMuted ? "rgba(255,255,255,0.15)" : "rgba(232,0,61,0.25)",
            color: "rgba(255,255,255,0.95)",
          }}
          whileTap={{ scale: 0.94 }}
        >
          {isMuted ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <line x1="23" y1="9" x2="17" y2="15"/>
              <line x1="17" y1="9" x2="23" y2="15"/>
            </svg>
          ) : (
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
