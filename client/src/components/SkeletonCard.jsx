const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden" style={{ background: "var(--color-surface-2)", boxShadow: "var(--shadow-md)" }}>
    {/* Image placeholder */}
    <div className="skeleton h-52 w-full" />
    {/* Content */}
    <div className="p-4 space-y-3">
      {/* Title */}
      <div className="skeleton h-5 w-3/4" />
      {/* Location */}
      <div className="skeleton h-4 w-1/2" />
      {/* Amenities row */}
      <div className="flex gap-2">
        <div className="skeleton h-6 w-16 rounded-full" />
        <div className="skeleton h-6 w-20 rounded-full" />
        <div className="skeleton h-6 w-14 rounded-full" />
      </div>
      {/* Price + button row */}
      <div className="flex items-center justify-between pt-1">
        <div className="skeleton h-6 w-24" />
        <div className="skeleton h-9 w-24 rounded-full" />
      </div>
    </div>
  </div>
);

export default SkeletonCard;
