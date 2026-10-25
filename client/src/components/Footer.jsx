import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Logo from "./Logo";
import { useAppContext } from "../context/AppContext";

// -- Data -----------------------------------------------------
const columns = [
  {
    heading: "Company",
    items: [
      { label: "About YoYo", href: "/" },
      { label: "Careers", href: "/" },
      { label: "Press", href: "/" },
      { label: "Blog", href: "/" },
    ],
  },
  {
    heading: "Support",
    items: [
      { label: "Help Center", href: "/" },
      { label: "Contact Us", href: "/" },
      { label: "Cancellation Policy", href: "/" },
      { label: "Safety Info", href: "/" },
    ],
  },
  {
    heading: "Partner With Us",
    items: [
      { label: "List Your Property", href: "/" },
      { label: "Hotel Owner Login", href: "/owner" },
      { label: "Affiliate Program", href: "/" },
      { label: "Investor Relations", href: "/" },
    ],
  },
  {
    heading: "Legal",
    items: [
      { label: "Privacy Policy", href: "/" },
      { label: "Terms of Service", href: "/" },
      { label: "Cookie Policy", href: "/" },
    ],
  },
];

const socials = [
  {
    label: "Instagram",
    href: "https://instagram.com/creativemayank.69",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: "X / Twitter",
    href: "https://x.com/mayankcodes_dev",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/mayankcodes-dev/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "GitHub",
    href: "https://github.com/mayankcodes-dev",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
];

// -- Animated column reveal -----------------------------------
const colVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: i => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

const linkVariants = {
  hidden: { opacity: 0, x: -6 },
  visible: i => ({
    opacity: 1, x: 0,
    transition: { duration: 0.35, delay: i * 0.045, ease: [0.22, 1, 0.36, 1] },
  }),
};

// -- FOOTER ---------------------------------------------------
const Footer = () => {
  const year = new Date().getFullYear();
  const { darkMode } = useAppContext();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <footer
      ref={ref}
      className="mt-auto relative overflow-hidden"
      style={{
        background: "var(--color-surface-2)",
        color: "var(--color-text-secondary)",
        borderTop: "1px solid var(--color-border)",
        transition: "background 0.35s ease, color 0.35s ease",
      }}
    >
      {/* -- Animated gradient mesh � dark only, subtle ---- */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: darkMode
            ? "radial-gradient(ellipse 60% 40% at 0% 100%, rgba(232,0,61,0.06) 0%, transparent 60%), radial-gradient(ellipse 50% 35% at 100% 0%, rgba(255,159,10,0.04) 0%, transparent 60%)"
            : "none",
          transition: "opacity 0.4s ease",
        }}
      />

      {/* -- Shimmer top border ---------------------------- */}
      <div className="h-px w-full shimmer-bar" />

      <div className="px-6 md:px-14 lg:px-20 xl:px-28 pt-14 pb-9 relative z-10">

        {/* -- Main grid ------------------------------------ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-14">

          {/* Brand column */}
          <motion.div
            className="lg:col-span-2"
            custom={0}
            variants={colVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            {/* Theme-aware logo */}
            <Logo size="lg" darkMode={darkMode} />

            <p
              className="text-sm leading-relaxed max-w-xs mt-5 mb-7"
              style={{ color: "var(--color-text-muted)" }}
            >
              India&apos;s fastest-growing hotel booking platform.
              Budget to luxury � 10,000+ verified hotels.
            </p>

            {/* Social icons */}
            <div className="flex gap-2">
              {socials.map((s, i) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  custom={i}
                  variants={linkVariants}
                  initial="hidden"
                  animate={inView ? "visible" : "hidden"}
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{
                    background: "var(--color-surface-3)",
                    color: "var(--color-text-muted)",
                    border: "1px solid var(--color-border)",
                    willChange: "transform",
                  }}
                  whileHover={{
                    y: -5,
                    scale: 1.15,
                    backgroundColor: "rgba(232,0,61,0.85)",
                    color: "#ffffff",
                    boxShadow: "0 8px 20px rgba(232,0,61,0.35)",
                    borderColor: "transparent",
                  }}
                  whileTap={{ scale: 0.88 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                >
                  {s.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Nav columns */}
          {columns.map((col, ci) => (
            <motion.div
              key={col.heading}
              custom={ci + 1}
              variants={colVariants}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
            >
              <h4
                className="text-xs font-bold mb-5 uppercase tracking-widest"
                style={{ color: "var(--color-text-primary)" }}
              >
                {col.heading}
              </h4>
              <ul className="space-y-3">
                {col.items.map((item, li) => (
                  <motion.li
                    key={item.label}
                    custom={li}
                    variants={linkVariants}
                    initial="hidden"
                    animate={inView ? "visible" : "hidden"}
                  >
                    <Link
                      to={item.href}
                      className="text-sm transition-colors duration-200 group inline-flex items-center gap-1"
                      style={{ color: "var(--color-text-muted)", fontFamily: "inherit" }}
                      onMouseEnter={e => e.currentTarget.style.color = "var(--color-text-primary)"}
                      onMouseLeave={e => e.currentTarget.style.color = "var(--color-text-muted)"}
                    >
                      <span className="inline-block translate-x-0 group-hover:translate-x-1 transition-transform duration-200">
                        {item.label}
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* -- Divider --------------------------------------- */}
        <div className="w-full h-px mb-7" style={{ background: "var(--color-border)" }} />

        {/* -- Bottom bar ------------------------------------ */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Copyright */}
          <p className="text-xs order-2 sm:order-1" style={{ color: "var(--color-text-muted)" }}>
            � {year} YoYo Technologies Pvt. Ltd. All rights reserved.
          </p>

          {/* Centre � made with love */}
          <div className="flex items-center gap-1.5 text-xs order-1 sm:order-2" style={{ color: "var(--color-text-muted)" }}>
            <span>Made with</span>
            <motion.svg
              viewBox="0 0 24 24" fill="#E8003D" className="w-3.5 h-3.5"
              style={{ filter: "drop-shadow(0 0 4px rgba(232,0,61,0.55))" }}
              animate={{ scale: [1, 1.28, 1] }}
              transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </motion.svg>
            <span>in India by</span>
            <a
              href="https://codermayank69.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold relative overflow-hidden"
              style={{ color: "#E8003D" }}
            >
              Mayank
              <motion.span
                className="absolute bottom-0 left-0 h-px w-full origin-left"
                style={{ background: "#E8003D", scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.25 }}
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

