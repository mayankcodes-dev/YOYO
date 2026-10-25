import { motion } from "framer-motion";
import { exclusiveOffers } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const OfferCard = ({ offer, index }) => {
  const { navigate } = useAppContext();
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.1 }}
      whileHover={{ y: -4, transition: { duration: 0.2, ease: [0.34, 1.56, 0.64, 1] } }}
      className="relative rounded-2xl overflow-hidden group cursor-pointer"
      style={{ boxShadow: "var(--shadow-md)" }}
      onClick={() => navigate("/rooms")}
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={offer.image}
          alt={offer.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"/>
        {/* Discount badge */}
        <span className="absolute top-3 left-3 text-white text-sm font-black px-3 py-1 rounded-full"
          style={{ background: "var(--color-primary)" }}>
          {offer.priceOff}% OFF
        </span>
        <span className="absolute top-3 right-3 text-white/80 text-xs backdrop-blur-sm px-2 py-0.5 rounded-full"
          style={{ background: "rgba(0,0,0,0.45)" }}>
          Expires {offer.expiryDate}
        </span>
      </div>
      {/* Content */}
      <div className="p-4" style={{ background: "var(--color-surface-2)" }}>
        <h3 className="font-bold text-sm mb-1" style={{ color: "var(--color-text-primary)" }}>{offer.title}</h3>
        <p className="text-xs leading-snug" style={{ color: "var(--color-text-secondary)" }}>{offer.description}</p>
        <button
          className="mt-3 text-xs font-bold flex items-center gap-1 transition-transform duration-200 group-hover:translate-x-1"
          style={{ color: "var(--color-primary)" }}
        >
          Claim Offer →
        </button>
      </div>
    </motion.div>
  );
};

const ExclusiveOffers = () => {
  return (
    <section className="py-14 px-4 md:px-16 lg:px-24 xl:px-32"
      style={{ background: "var(--color-surface-3)" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex items-end justify-between mb-8"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--color-primary)" }}>
            Members Only
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>
            Exclusive Offers
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
            Special deals curated just for YoYo members
          </p>
        </div>
        <button
          className="text-sm font-semibold hidden md:block"
          style={{ color: "var(--color-primary)" }}
          onClick={() => window.location.href = "/rooms"}
        >
          View all →
        </button>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {exclusiveOffers.map((o, i) => (
          <OfferCard key={o._id} offer={o} index={i} />
        ))}
      </div>
    </section>
  );
};

export default ExclusiveOffers;
