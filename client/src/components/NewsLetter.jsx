import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../context/AppContext";
import { toast } from "react-hot-toast";

const EMAIL_RE = /^\S+@\S+\.\S+$/;

const NewsLetter = () => {
  const { axios } = useAppContext();
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed)              return toast.error("Enter your email address");
    if (!EMAIL_RE.test(trimmed)) return toast.error("Please enter a valid email");

    setLoading(true);
    try {
      const { data } = await axios.post("/api/newsletter/subscribe", { email: trimmed });
      if (data.success) {
        setDone(true);
        toast.success(data.message || "Subscribed! 🎁");
      } else {
        toast.error(data.message || "Subscription failed");
      }
    } catch (err) {
      const msg = err?.response?.data?.message;
      toast.error(msg || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-4 bg-white/20 text-white">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
            </svg>
            Stay in the Loop
          </span>

          <AnimatePresence mode="wait">
            {done ? (
              /* ── Success state ── */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="py-4"
              >
                <div className="text-5xl mb-3">🎉</div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
                  You're in!
                </h2>
                <p className="text-white/80 text-sm md:text-base max-w-sm mx-auto">
                  Check your inbox — we've sent you a welcome gift with your first discount code.
                </p>
              </motion.div>
            ) : (
              /* ── Subscribe form ── */
              <motion.div key="form">
                <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-3 leading-tight">
                  Exclusive deals, right in your inbox
                </h2>
                <p className="text-white/75 text-sm md:text-base mb-8 max-w-md mx-auto">
                  Join 50,000+ travellers who get early access to flash sales and secret discounts.
                </p>

                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                  noValidate
                >
                  <input
                    type="email"
                    id="newsletter-email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    autoComplete="email"
                    required
                    disabled={loading}
                    className="flex-1 rounded-xl px-4 py-3 text-sm outline-none transition-all disabled:opacity-60"
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      border: "1.5px solid rgba(255,255,255,0.30)",
                      color: "#fff",
                      caretColor: "#fff",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.70)")}
                    onBlur={(e)  => (e.target.style.borderColor = "rgba(255,255,255,0.30)")}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    id="newsletter-subscribe-btn"
                    className="px-6 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 min-w-[130px]"
                    style={{ background: "#fff", color: "#E8003D" }}
                  >
                    {loading ? (
                      <>
                        <span
                          className="w-4 h-4 border-2 rounded-full animate-spin"
                          style={{ borderColor: "rgba(232,0,61,0.25)", borderTopColor: "#E8003D" }}
                          aria-hidden="true"
                        />
                        Subscribing…
                      </>
                    ) : "Subscribe →"}
                  </button>
                </form>

                <p className="mt-4 text-white/50 text-xs">
                  No spam, ever. Unsubscribe any time.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
};

export default NewsLetter;
