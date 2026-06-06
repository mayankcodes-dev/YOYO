import { motion } from "framer-motion";
import { useAppContext } from "../context/AppContext";

const AppBanner = () => {
  const { navigate } = useAppContext();
  return (
    <section className="py-12 px-4 md:px-16 lg:px-24 xl:px-32">
      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #FF385C22 100%)",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, #FF385C 0%, transparent 60%),
                              radial-gradient(circle at 80% 20%, #FFD700 0%, transparent 50%)`,
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 p-8 md:p-12">
          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-white flex-1"
          >
            {/* Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-4"
              style={{ background: "var(--color-primary)", color: "#fff" }}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                <path d="M12 2a10 10 0 110 20A10 10 0 0112 2zm0 4a6 6 0 100 12A6 6 0 0012 6z"/>
              </svg>
              Coming Soon — Play Store
            </span>

            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3 leading-tight">
              Book on the <span style={{ color: "var(--color-accent)" }}>Go</span>
            </h2>
            <p className="text-white/70 text-base mb-6 max-w-md">
              Get exclusive app-only deals, instant notifications, and manage all your YoYo bookings right from your phone.
            </p>

            {/* Perks */}
            <ul className="space-y-2 mb-8">
              {["App-exclusive 15% off", "One-tap check-in", "24/7 in-app support", "Live booking updates"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-white/80 text-sm">
                  <svg viewBox="0 0 20 20" fill="var(--color-accent)" className="w-4 h-4 shrink-0">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                className="flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105"
                style={{ background: "#FFFFFF", color: "#1A1A2E" }}
              >
                {/* Play Store icon */}
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                  <path d="M3.18 23.5a2 2 0 01-2-2V2.5a2 2 0 012-2l11.5 11.5L3.18 23.5z" fill="#01D4FF"/>
                  <path d="M14.68 12L3.18 23.5l13.5-7.75-2-3.75z" fill="#FF3D00"/>
                  <path d="M20.18 9.5L16.68 7.5 14.68 12l2 3.75 3.5-2a2 2 0 000-4.25z" fill="#FFD600"/>
                  <path d="M3.18.5L14.68 12l-2 3.75L3.18 23.5a2 2 0 01-2-2V2.5a2 2 0 012-2z" fill="#00E676"/>
                </svg>
                <div className="text-left">
                  <div className="text-[10px] opacity-70 leading-none">Get it on</div>
                  <div className="font-bold leading-tight">Google Play</div>
                </div>
              </button>

              <button
                className="flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm border border-white/20 text-white transition-all duration-200 hover:bg-white/10"
                onClick={() => navigate("/rooms")}
              >
                Book via Web →
              </button>
            </div>
          </motion.div>

          {/* Phone mockup side */}
          <motion.div
            initial={{ opacity: 0, x: 30, y: 20 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 flex justify-center items-end"
          >
            {/* Stylized phone frame */}
            <div className="relative w-52 h-96 rounded-[32px] border-4 border-white/20 overflow-hidden"
              style={{ background: "linear-gradient(180deg, #1A1A2E 0%, #FF385C 100%)" }}>
              {/* Screen content mock */}
              <div className="absolute inset-2 rounded-[26px] overflow-hidden bg-white">
                <div className="h-8 flex items-center justify-between px-4" style={{ background: "var(--color-primary)" }}>
                  <span className="text-white text-xs font-bold">YoYo</span>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/60"/>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/60"/>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/60"/>
                  </div>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&q=80"
                  alt="App preview"
                  className="w-full h-40 object-cover"
                />
                <div className="p-3 space-y-2">
                  <div className="h-3 rounded-full bg-gray-200 w-3/4"/>
                  <div className="h-2 rounded-full bg-gray-100 w-full"/>
                  <div className="h-2 rounded-full bg-gray-100 w-2/3"/>
                  <div className="mt-3 flex gap-2">
                    <div className="h-8 rounded-lg flex-1" style={{ background: "var(--color-primary)" }}/>
                    <div className="h-8 rounded-lg w-8 bg-gray-100"/>
                  </div>
                </div>
              </div>
              {/* Home indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 rounded-full bg-white/40"/>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AppBanner;
