import { motion } from "framer-motion";
import { useAppContext } from "../context/AppContext";

const stats = [
  { icon: "🏨", value: "10,000+", label: "Hotels Across India" },
  { icon: "😊", value: "1M+", label: "Happy Guests" },
  { icon: "🏙️", value: "200+", label: "Cities Covered" },
  { icon: "💰", value: "₹500", label: "Starting per Night" },
];

const RecommendedHotels = ({ rooms = [] }) => {
  const { navigate } = useAppContext();

  return (
    <section className="py-14 px-4 md:px-16 lg:px-24 xl:px-32">
      {/* Stats Strip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14"
      >
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="text-center p-5 rounded-2xl"
            style={{ background: "var(--color-surface-2)", boxShadow: "var(--shadow-sm)" }}
          >
            <div className="text-3xl mb-1">{s.icon}</div>
            <div className="font-display font-black text-xl" style={{ color: "var(--color-primary)" }}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-end justify-between mb-6"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--color-primary)" }}>
            Handpicked for You
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>
            Recommended Hotels
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
            Top-rated stays selected just for your preferences
          </p>
        </div>
        <button
          className="text-sm font-semibold hidden md:flex items-center gap-1"
          style={{ color: "var(--color-primary)" }}
          onClick={() => navigate("/rooms")}
        >
          View all
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
            <path d="M3 8h10M9 4l4 4-4 4"/>
          </svg>
        </button>
      </motion.div>

      {/* Cards rendered from parent (rooms passed as prop) */}
      {rooms.length === 0 && (
        <p className="text-center py-10" style={{ color: "var(--color-text-muted)" }}>
          No rooms found. Check back soon!
        </p>
      )}
    </section>
  );
};

export default RecommendedHotels;
