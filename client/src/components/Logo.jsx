// Shared YoYo brand logo — single source of truth
// Uses the circular Y icon + "YoYo" wordmark

const Logo = ({ size = "md", iconOnly = false }) => {
  const dims = { sm: 28, md: 34, lg: 42 };
  const fontSizes = { sm: "14px", md: "17px", lg: "20px" };
  const d = dims[size] || dims.md;

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", userSelect: "none" }}>
      {/* Circular Y icon */}
      <div
        style={{
          width: d,
          height: d,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #E8003D 0%, #C50030 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 10px rgba(232,0,61,0.35)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "'Plus Jakarta Sans', 'Arial Black', sans-serif",
            fontWeight: 900,
            fontSize: `${d * 0.55}px`,
            color: "#fff",
            lineHeight: 1,
            marginTop: "1px",
          }}
        >
          Y
        </span>
      </div>

      {/* Wordmark — hidden in iconOnly mode */}
      {!iconOnly && (
        <span
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 900,
            fontSize: fontSizes[size] || fontSizes.md,
            color: "var(--color-text, #0d0d1a)",
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          YoYo
        </span>
      )}
    </div>
  );
};

export default Logo;
