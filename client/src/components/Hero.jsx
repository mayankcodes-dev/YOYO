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

// ── Luxury Travel Ambient Music via Web Audio API ─────────────────────
// Grand piano timbre (additive harmonics + ADSR), lush string pads,
// gentle bass, sparse high melody, long hall reverb, stereo chorus.
// Chord progression in Db major — sounds like a 5-star hotel lobby.
// Bar:  Dbmaj9 → Bbm9 → Gbmaj7 → Ab7sus4 (repeating every ~24 s)

const NOTE = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

// Db major chord set — MIDI note numbers
// Dbmaj9: Db3 F3 Ab3 C4 Eb4
// Bbm9:   Bb2 Db3 F3 Ab3 C4
// Gbmaj7: Gb2 Bb2 Db3 F3 Bb3
// Ab7sus4:Ab2 Db3 Eb3 Ab3 Bb3
const CHORD_SETS = [
  [49, 53, 56, 60, 63].map(NOTE),  // Dbmaj9
  [46, 49, 53, 56, 60].map(NOTE),  // Bbm9
  [42, 46, 49, 53, 58].map(NOTE),  // Gbmaj7
  [44, 49, 51, 56, 58].map(NOTE),  // Ab7sus4
];

// Sparse high melody — runs over top of chords (MIDI, relative beat offset)
const MELODY_LINES = [
  [[72, 0], [75, 2.5], [77, 5], [75, 7]],   // over Dbmaj9
  [[70, 0], [72, 3],   [70, 5.5]],           // over Bbm9
  [[66, 0], [70, 2],   [71, 5], [70, 7]],   // over Gbmaj7
  [[68, 0], [70, 2.5], [68, 6]],            // over Ab7sus4
];

function buildReverb(ctx, decaySec = 4.5) {
  const conv = ctx.createConvolver();
  const rate  = ctx.sampleRate;
  const len   = Math.floor(rate * decaySec);
  const buf   = ctx.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      // Exponential decay + slight early-reflection bump at ~40 ms
      const earlyBoost = i < rate * 0.04 ? 1.6 : 1;
      d[i] = (Math.random() * 2 - 1) * earlyBoost * Math.pow(1 - i / len, 2.2);
    }
  }
  conv.buffer = buf;
  return conv;
}

function createAmbientAudio(ctx) {
  // ── Master chain: dry → chorus → reverb → limiter → out ─────────────
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 4);
  masterGain.connect(ctx.destination);

  // Soft limiter (DynamicsCompressor as brick-wall)
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -3;
  limiter.knee.value      = 2;
  limiter.ratio.value     = 20;
  limiter.attack.value    = 0.001;
  limiter.release.value   = 0.15;
  limiter.connect(masterGain);

  // Hall reverb (long, 4.5 s decay)
  const reverb     = buildReverb(ctx, 4.5);
  reverb.connect(limiter);

  const reverbSend = ctx.createGain();
  reverbSend.gain.value = 0.5;
  reverbSend.connect(reverb);

  const drySend = ctx.createGain();
  drySend.gain.value = 0.5;
  drySend.connect(limiter);

  // Stereo chorus (two detuned delays panned L/R)
  const chorusL   = ctx.createDelay(0.05);
  const chorusR   = ctx.createDelay(0.05);
  chorusL.delayTime.value = 0.027;
  chorusR.delayTime.value = 0.031;
  const panL = ctx.createStereoPanner(); panL.pan.value = -0.6;
  const panR = ctx.createStereoPanner(); panR.pan.value =  0.6;
  const chorusGain = ctx.createGain(); chorusGain.gain.value = 0.18;
  chorusL.connect(panL); panL.connect(chorusGain);
  chorusR.connect(panR); panR.connect(chorusGain);
  chorusGain.connect(limiter);

  // Helper: route a gain node to all buses
  const routeTo = (envNode, dryAmt = 0.5, revAmt = 0.5) => {
    envNode.connect(drySend);
    envNode.connect(reverbSend);
    envNode.connect(chorusL);
    envNode.connect(chorusR);
  };

  // ── Grand piano note (additive harmonics) ────────────────────────────
  // Layers: fundamental + octave + 5th harmonic + 3rd harmonic, each with
  // slightly different decay to mimic piano string sympathetic resonance.
  const playPianoNote = (freq, startTime, peakGain, duration) => {
    const harmonics = [
      { ratio: 1,    gain: peakGain,         decay: duration * 0.9 },
      { ratio: 2,    gain: peakGain * 0.38,  decay: duration * 0.55 },
      { ratio: 3,    gain: peakGain * 0.18,  decay: duration * 0.35 },
      { ratio: 4,    gain: peakGain * 0.09,  decay: duration * 0.22 },
      { ratio: 5,    gain: peakGain * 0.05,  decay: duration * 0.18 },
    ];

    harmonics.forEach(({ ratio, gain: hGain, decay }) => {
      const osc = ctx.createOscillator();
      osc.type = ratio === 1 ? "triangle" : "sine";
      osc.frequency.value = freq * ratio;

      const env = ctx.createGain();
      env.gain.setValueAtTime(0, startTime);
      env.gain.linearRampToValueAtTime(hGain, startTime + 0.01);   // fast attack
      env.gain.setTargetAtTime(hGain * 0.35, startTime + 0.02, decay * 0.08); // decay
      env.gain.setTargetAtTime(0.0001, startTime + decay * 0.55, decay * 0.25); // release

      osc.connect(env);
      routeTo(env);
      osc.start(startTime);
      osc.stop(startTime + duration + 0.5);
    });
  };

  // ── String pad (slow attack sine cluster) ───────────────────────────
  const playPad = (freqs, startTime, duration) => {
    freqs.forEach((freq, i) => {
      // Two slightly detuned sines per note — "ensemble" effect
      [-1.5, 1.5].forEach((detuneCents) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq * Math.pow(2, detuneCents / 1200);

        const env = ctx.createGain();
        env.gain.setValueAtTime(0, startTime);
        env.gain.linearRampToValueAtTime((0.04 - i * 0.004), startTime + 1.8); // slow attack
        env.gain.setValueAtTime((0.04 - i * 0.004), startTime + duration - 1.2);
        env.gain.linearRampToValueAtTime(0.0001, startTime + duration + 0.8);

        const padFilter = ctx.createBiquadFilter();
        padFilter.type      = "lowpass";
        padFilter.frequency.value = 900 + i * 120;
        padFilter.Q.value   = 0.5;

        osc.connect(padFilter);
        padFilter.connect(env);
        env.connect(reverbSend); // pads live mostly in reverb
        env.connect(chorusL);
        env.connect(chorusR);
        osc.start(startTime);
        osc.stop(startTime + duration + 1.5);
      });
    });
  };

  // ── Bass note (warm sub-bass, one per chord) ─────────────────────────
  const playBass = (freq, startTime, duration) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq * 0.5; // one octave below chord root

    const env = ctx.createGain();
    env.gain.setValueAtTime(0, startTime);
    env.gain.linearRampToValueAtTime(0.055, startTime + 0.08);
    env.gain.exponentialRampToValueAtTime(0.028, startTime + duration * 0.4);
    env.gain.linearRampToValueAtTime(0.0001, startTime + duration);

    // High-cut so bass stays warm, not boomy
    const lpf = ctx.createBiquadFilter();
    lpf.type = "lowpass";
    lpf.frequency.value = 160;
    osc.connect(lpf);
    lpf.connect(env);
    env.connect(drySend);
    env.connect(reverbSend);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.3);
  };

  // ── Melody note (high, sparse, bell-like) ───────────────────────────
  const playMelody = (freq, startTime) => {
    const PARTIALS = [1, 2.756, 5.404]; // bell-like inharmonic series
    PARTIALS.forEach((ratio, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq * ratio;

      const env = ctx.createGain();
      const peak = [0.06, 0.02, 0.008][i];
      env.gain.setValueAtTime(0, startTime);
      env.gain.linearRampToValueAtTime(peak, startTime + 0.008);
      env.gain.exponentialRampToValueAtTime(0.0001, startTime + [3.2, 1.8, 1.0][i]);

      osc.connect(env);
      env.connect(reverbSend); // melody is mostly wet
      env.connect(drySend);
      osc.start(startTime);
      osc.stop(startTime + 4);
    });
  };

  // ── Scheduler ────────────────────────────────────────────────────────
  const CHORD_DUR   = 6;   // each chord lasts 6 seconds
  const LOOK_AHEAD  = 0.3; // schedule 300 ms ahead
  let chordIndex    = 0;
  let nextChordTime = ctx.currentTime + 0.8;

  const scheduleChord = (idx, startTime) => {
    const freqs   = CHORD_SETS[idx % CHORD_SETS.length];
    const melody  = MELODY_LINES[idx % MELODY_LINES.length];

    // String pad — all notes, full duration
    playPad(freqs, startTime, CHORD_DUR);

    // Piano — arpeggiate bottom 3 notes gently (stagger 80 ms each)
    freqs.slice(0, 4).forEach((f, i) => {
      playPianoNote(f, startTime + i * 0.08, 0.10 - i * 0.018, CHORD_DUR * 0.75);
    });

    // Bass — root note
    playBass(freqs[0], startTime, CHORD_DUR);

    // Sparse melody
    melody.forEach(([midi, offset]) => {
      if (startTime + offset < ctx.currentTime - 0.05) return;
      playMelody(NOTE(midi), startTime + offset);
    });
  };

  const scheduler = setInterval(() => {
    if (ctx.state === "closed") { clearInterval(scheduler); return; }
    while (nextChordTime < ctx.currentTime + LOOK_AHEAD + CHORD_DUR) {
      scheduleChord(chordIndex, nextChordTime);
      chordIndex++;
      nextChordTime += CHORD_DUR;
    }
  }, 100);

  return { masterGain, scheduler };
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
