// Shared YoYo brand logo — single source of truth
const Logo = ({ size = "md" }) => {
  const sizes = {
    sm: { fontSize: "16px", padding: "2px 10px 3px", borderRadius: "6px" },
    md: { fontSize: "19px", padding: "3px 12px 4px", borderRadius: "8px" },
    lg: { fontSize: "22px", padding: "5px 14px",     borderRadius: "8px" },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#E8003D",
        borderRadius: s.borderRadius,
        padding: s.padding,
        boxShadow: "0 2px 12px rgba(232,0,61,0.45)",
        lineHeight: 1,
        userSelect: "none",
      }}
    >
      <span
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 900,
          fontSize: s.fontSize,
          color: "#fff",
          letterSpacing: "-0.04em",
        }}
      >
        YoYo
      </span>
    </div>
  );
};

export default Logo;
