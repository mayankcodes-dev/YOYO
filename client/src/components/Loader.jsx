import { motion } from "framer-motion";

const spinnerVariants = {
  spin: {
    rotate: 360,
    transition: { duration: 0.9, repeat: Infinity, ease: "linear" },
  },
};

const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "var(--color-surface)" }}>
      {/* Brand mark */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        className="mb-6"
      >
        {/* Simplified YoYo logo mark */}
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="32" fill="url(#brandGrad)"/>
          <defs>
            <linearGradient id="brandGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop stopColor="#E8003D"/>
              <stop offset="1" stopColor="#C50030"/>
            </linearGradient>
          </defs>
          <text x="32" y="44" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="40" fill="white">Y</text>
        </svg>
      </motion.div>

      {/* Spinner ring */}
      <div className="relative w-12 h-12 mb-4">
        <motion.div
          variants={spinnerVariants}
          animate="spin"
          className="absolute inset-0 rounded-full border-3 border-transparent"
          style={{ borderTopColor: "var(--color-primary)", borderRightColor: "var(--color-primary)" }}
        />
        <div className="absolute inset-1 rounded-full"
          style={{ background: "var(--color-surface)" }} />
      </div>

      <p className="text-sm font-semibold animate-pulse" style={{ color: "var(--color-primary)" }}>
        Finding the best stays…
      </p>
    </div>
  );
};

export default Loader;
