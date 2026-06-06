import { useState } from "react";
import { motion } from "framer-motion";
import { useAppContext } from "../context/AppContext";

const NewsLetter = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSent(true);
  };

  return (
    <section className="py-14 px-4 md:px-16 lg:px-24 xl:px-32">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative rounded-3xl overflow-hidden p-8 md:p-14 text-center"
        style={{
          background: "linear-gradient(135deg, #FF385C 0%, #FF6B6B 50%, #FF385C 100%)",
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl"
          style={{ background: "#FFD700", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10 blur-3xl"
          style={{ background: "#FFFFFF", transform: "translate(-30%, 30%)" }} />

        <div className="relative z-10">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 bg-white/20 text-white">
            📬 Stay in the Loop
          </span>
          <h2 className="font-display text-2xl md:text-4xl font-extrabold text-white mb-3">
            Get Exclusive Deals in Your Inbox
          </h2>
          <p className="text-white/80 text-sm md:text-base mb-8 max-w-lg mx-auto">
            Join 200,000+ travellers who get the best deals before anyone else. No spam, only great stays.
          </p>

          {sent ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-green-600 font-bold text-sm"
            >
              ✅ You&apos;re on the list! Welcome to YoYo.
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-5 py-3 rounded-full text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.95)", color: "#1A1A2E" }}
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-full font-bold text-sm transition-all duration-200 hover:scale-105 shrink-0"
                style={{ background: "#1A1A2E", color: "#fff" }}
              >
                Subscribe Free →
              </button>
            </form>
          )}

          <p className="text-white/50 text-xs mt-4">
            By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
          </p>
        </div>
      </motion.div>
    </section>
  );
};

export default NewsLetter;
