import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const REDIRECT_SECONDS = 3;

// Loader is used as the Stripe success_url target: /loader/:nextUrl
// It verifies the payment, marks the booking as paid, then navigates to nextUrl.
const Loader = () => {
  const { nextUrl } = useParams();
  const { axios, getToken, navigate } = useAppContext();
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [message, setMessage] = useState("Verifying your payment…");
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);
  const countRef = useRef(null);

  // Start countdown once we know the final status
  const startCountdown = (destination) => {
    let remaining = REDIRECT_SECONDS;
    setCountdown(remaining);
    countRef.current = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(countRef.current);
        navigate(destination, { replace: true });
      }
    }, 1000);
  };

  useEffect(() => {
    const verify = async () => {
      const destination = `/${nextUrl || "my-bookings"}`;

      try {
        const token = await getToken();
        if (!token) {
          navigate(destination, { replace: true });
          return;
        }

        const { data: bookingsData } = await axios.get("/api/bookings/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!bookingsData.success) {
          navigate(destination, { replace: true });
          return;
        }

        const pendingBooking = bookingsData.bookings
          .filter((b) => !b.isPaid && b.status !== "cancelled")
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

        if (pendingBooking) {
          setMessage("Confirming payment with Stripe…");
          const { data: verifyData } = await axios.post(
            "/api/bookings/verify-payment",
            { bookingId: pendingBooking._id },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (verifyData.success) {
            setStatus("success");
            setMessage("Booking confirmed!");
            toast.success("Payment successful! Your booking is confirmed.");
            startCountdown(destination);
          } else {
            setStatus("error");
            setMessage("Could not verify payment. Redirecting…");
            startCountdown(destination);
          }
        } else {
          setStatus("success");
          setMessage("All done!");
          startCountdown(destination);
        }
      } catch {
        setStatus("error");
        setMessage("Redirecting…");
        startCountdown(destination);
      }
    };

    verify();
    return () => clearInterval(countRef.current);
  }, []);

  const isSuccess = status === "success";
  const isError   = status === "error";
  const isLoading = status === "loading";

  return (
    <div
      className="min-h-[100dvh] w-full flex items-center justify-center px-4"
      style={{ background: "var(--color-surface)" }}
    >
      {/* ── Centered card — matches the sign-in success screenshot ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm rounded-3xl flex flex-col items-center gap-6 py-14 px-8"
        style={{
          background: "var(--color-surface-2)",
          boxShadow: "var(--shadow-xl)",
          border: "1px solid var(--color-border)",
        }}
      >
        {/* ── Icon ── */}
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              key="spinner"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              className="relative w-16 h-16"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-[3px] border-transparent"
                style={{
                  borderTopColor: "var(--color-primary)",
                  borderRightColor: "var(--color-primary)",
                }}
              />
              <div
                className="absolute inset-1.5 rounded-full"
                style={{ background: "var(--color-surface-2)" }}
              />
            </motion.div>
          )}

          {isSuccess && (
            <motion.div
              key="tick"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 11, stiffness: 180 }}
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "#34C759" }}
            >
              <motion.svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
                <motion.path
                  d="M5 12l4 4L19 7"
                  stroke="#fff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.45, delay: 0.15, ease: "easeOut" }}
                />
              </motion.svg>
            </motion.div>
          )}

          {isError && (
            <motion.div
              key="error"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 14, stiffness: 200 }}
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "var(--color-primary)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="#fff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Title ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center gap-2 text-center"
          >
            <p
              className="text-lg font-bold"
              style={{ color: "var(--color-text-primary)" }}
            >
              {isLoading
                ? "Processing…"
                : isSuccess
                ? "Payment Successful"
                : "Verification Failed"}
            </p>
            <p
              className="text-sm"
              style={{ color: "var(--color-text-muted)" }}
            >
              {isLoading
                ? message
                : isSuccess
                ? "Your booking is confirmed 🎉"
                : message}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* ── Countdown pill (only after status resolves) ── */}
        {!isLoading && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm"
            style={{ color: "var(--color-text-muted)" }}
          >
            Redirecting in{" "}
            <span
              className="font-bold tabular-nums"
              style={{ color: isSuccess ? "#34C759" : "var(--color-primary)" }}
            >
              {countdown}
            </span>{" "}
            second{countdown !== 1 ? "s" : ""}…
          </motion.p>
        )}
      </motion.div>
    </div>
  );
};

export default Loader;
