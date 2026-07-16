// Shared YoYo brand logo — single source of truth
// darkMode prop controls wordmark colour: true=white (navbar), false=theme-aware (footer/light pages)

const Logo = ({ size = "md", iconOnly = false, darkMode = true }) => {
  const dims      = { sm: 28, md: 34, lg: 42 };
  const fontSizes = { sm: "14px", md: "17px", lg: "20px" };
  const d = dims[size] || dims.md;

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", userSelect: "none" }}>
      {/* Circular Y icon */}
      <img
        src="/logo.png"
        alt="YoYo Logo"
        style={{ width: d, height: d, flexShrink: 0, objectFit: "contain" }}
      />

      {/* Wordmark — colour adapts to theme */}
      {!iconOnly && (
        <span
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 900,
            fontSize: fontSizes[size] || fontSizes.md,
            color: darkMode ? "#ffffff" : "var(--color-text-primary)",
            letterSpacing: "-0.04em",
            lineHeight: 1,
            transition: "color 0.3s ease",
          }}
        >
          YoYo
        </span>
      )}
    </div>
  );
};

export default Logo;
