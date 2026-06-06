import { motion } from "framer-motion";
import { featuredDestinations } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const FeaturedDestination = () => {
  const { navigate } = useAppContext();

  return (
    <section className="py-14 px-4 md:px-16 lg:px-24 xl:px-32">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--color-primary)" }}>
          Explore India
        </p>
        <h2 className="font-display text-2xl md:text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>
          Top Destinations
        </h2>
        <p className="text-sm mt-1.5" style={{ color: "var(--color-text-secondary)" }}>
          From sun-soaked beaches to mountain retreats — pick your next adventure
        </p>
      </motion.div>

      {/* Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
      >
        {featuredDestinations.map((dest, i) => (
          <motion.button
            key={dest.city}
            variants={cardVariants}
            onClick={() => navigate(`/rooms?destination=${dest.city}`)}
            className="relative rounded-2xl overflow-hidden group cursor-pointer focus:outline-none"
            style={{ aspectRatio: i < 2 ? "3/4" : "1/1", boxShadow: "var(--shadow-md)" }}
            whileHover={{ scale: 1.03, transition: { duration: 0.25, ease: [0.34, 1.56, 0.64, 1] } }}
          >
            {/* Image */}
            <img
              src={dest.image}
              alt={dest.city}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {/* Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
              <h3 className="text-white font-bold text-sm leading-tight">{dest.city}</h3>
              <p className="text-white/70 text-xs leading-tight mt-0.5 hidden sm:block">{dest.tagline}</p>
              <p className="text-white/60 text-[10px] mt-0.5">{dest.hotels.toLocaleString("en-IN")}+ hotels</p>
            </div>
            {/* Hover CTA */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="px-3 py-1 rounded-full text-xs font-bold text-white"
                style={{ background: "var(--color-primary)" }}>
                Explore →
              </span>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </section>
  );
};

export default FeaturedDestination;