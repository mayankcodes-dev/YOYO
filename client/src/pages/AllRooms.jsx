import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import StarRating from "../components/StarRating";
import HotelCard from "../components/HotelCard";
import SkeletonCard from "../components/SkeletonCard";
import { useAppContext } from "../context/AppContext";

// ── Filter constants (Indian price ranges in ₹) ─────────
const roomTypes   = ["Single Bed", "Double Bed", "Family Suite", "Luxury Suite", "Mountain View Cottage", "Heritage Suite", "Business Suite"];
const priceRanges = ["Under ₹1,000", "₹1,000 – ₹2,500", "₹2,500 – ₹5,000", "₹5,000 – ₹10,000", "Above ₹10,000"];
const categories  = ["Budget", "Premium", "Luxury", "Villa", "Business"];
const sortOptions = ["Price: Low to High", "Price: High to Low", "Newest First"];

// ── Compact checkbox ─────────────────────────────────────
const CheckBox = ({ label, selected, onChange }) => (
  <label className="flex items-center gap-2.5 cursor-pointer mt-1.5 text-sm">
    <span
      className="w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors duration-150"
      style={{
        background: selected ? "var(--color-primary)" : "transparent",
        borderColor: selected ? "var(--color-primary)" : "var(--color-border-strong)",
      }}
    >
      {selected && (
        <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )}
    </span>
    <input
      type="checkbox"
      className="sr-only"
      checked={selected}
      onChange={(e) => onChange(e.target.checked, label)}
    />
    <span style={{ color: "var(--color-text-secondary)" }}>{label}</span>
  </label>
);

// ── Radio button ─────────────────────────────────────────
const RadioButton = ({ label, selected, onChange }) => (
  <label className="flex items-center gap-2.5 cursor-pointer mt-1.5 text-sm">
    <span
      className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors duration-150"
      style={{ borderColor: selected ? "var(--color-primary)" : "var(--color-border-strong)" }}
    >
      {selected && (
        <span className="w-2 h-2 rounded-full" style={{ background: "var(--color-primary)" }} />
      )}
    </span>
    <input type="radio" className="sr-only" checked={selected} onChange={() => onChange(label)} />
    <span style={{ color: "var(--color-text-secondary)" }}>{label}</span>
  </label>
);

// ── Filter Panel ─────────────────────────────────────────
const FilterPanel = ({ filters, setFilters, selectedSort, setSelectedSort, onClear, mobileOpen }) => {
  const handleTypeChange = (checked, value) => {
    setFilters((prev) => ({
      ...prev,
      roomType: checked ? [...prev.roomType, value] : prev.roomType.filter((t) => t !== value),
    }));
  };

  const handlePriceChange = (checked, value) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: checked ? [...prev.priceRange, value] : prev.priceRange.filter((p) => p !== value),
    }));
  };

  const handleCategoryChange = (checked, value) => {
    setFilters((prev) => ({
      ...prev,
      category: checked ? [...prev.category, value] : prev.category.filter((c) => c !== value),
    }));
  };

  return (
    <div
      className="rounded-2xl p-5 w-full lg:w-72 shrink-0"
      style={{ background: "var(--color-surface-2)", boxShadow: "var(--shadow-md)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-base" style={{ color: "var(--color-text-primary)" }}>Filters</h2>
        <button
          onClick={onClear}
          className="text-xs font-semibold"
          style={{ color: "var(--color-primary)" }}
        >
          Clear all
        </button>
      </div>

      {/* Category */}
      <div className="mb-5">
        <p className="font-semibold text-sm mb-2" style={{ color: "var(--color-text-primary)" }}>Category</p>
        {categories.map((cat) => (
          <CheckBox
            key={cat}
            label={cat}
            selected={filters.category.includes(cat)}
            onChange={handleCategoryChange}
          />
        ))}
      </div>

      {/* Room Type */}
      <div className="mb-5">
        <p className="font-semibold text-sm mb-2" style={{ color: "var(--color-text-primary)" }}>Room Type</p>
        {roomTypes.map((r) => (
          <CheckBox
            key={r}
            label={r}
            selected={filters.roomType.includes(r)}
            onChange={handleTypeChange}
          />
        ))}
      </div>

      {/* Price Range */}
      <div className="mb-5">
        <p className="font-semibold text-sm mb-2" style={{ color: "var(--color-text-primary)" }}>Price Range</p>
        {priceRanges.map((range) => (
          <CheckBox
            key={range}
            label={range}
            selected={filters.priceRange.includes(range)}
            onChange={handlePriceChange}
          />
        ))}
      </div>

      {/* Sort by */}
      <div>
        <p className="font-semibold text-sm mb-2" style={{ color: "var(--color-text-primary)" }}>Sort By</p>
        {sortOptions.map((opt) => (
          <RadioButton
            key={opt}
            label={opt}
            selected={selectedSort === opt}
            onChange={setSelectedSort}
          />
        ))}
      </div>
    </div>
  );
};

// ── Price match helper (₹ ranges) ───────────────────────
const matchesPrice = (room, priceRange) => {
  if (!priceRange.length) return true;
  return priceRange.some((range) => {
    const p = room.pricePerNight;
    if (range === "Under ₹1,000")        return p < 1000;
    if (range === "₹1,000 – ₹2,500")    return p >= 1000 && p <= 2500;
    if (range === "₹2,500 – ₹5,000")    return p >= 2500 && p <= 5000;
    if (range === "₹5,000 – ₹10,000")   return p >= 5000 && p <= 10000;
    if (range === "Above ₹10,000")       return p > 10000;
    return false;
  });
};

// ── Main Page ────────────────────────────────────────────
const AllRooms = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { rooms } = useAppContext();
  const navigate = useNavigate();

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState("");
  const [filters, setFilters] = useState({ roomType: [], priceRange: [], category: [] });

  const destination = searchParams.get("destination") || "";

  const filteredRooms = useMemo(() => {
    return rooms
      .filter((room) => {
        const matchType     = !filters.roomType.length    || filters.roomType.includes(room.roomType);
        const matchPrice    = matchesPrice(room, filters.priceRange);
        const matchCategory = !filters.category.length   || filters.category.includes(room.category);
        const matchDest     = !destination || room.hotel?.city?.toLowerCase().includes(destination.toLowerCase());
        return matchType && matchPrice && matchCategory && matchDest;
      })
      .sort((a, b) => {
        if (selectedSort === "Price: Low to High")  return a.pricePerNight - b.pricePerNight;
        if (selectedSort === "Price: High to Low")  return b.pricePerNight - a.pricePerNight;
        if (selectedSort === "Newest First")        return new Date(b.createdAt) - new Date(a.createdAt);
        return 0;
      });
  }, [rooms, filters, selectedSort, destination]);

  const clearFilters = () => {
    setFilters({ roomType: [], priceRange: [], category: [] });
    setSelectedSort("");
    setSearchParams({});
  };

  const isLoading = rooms.length === 0;

  return (
    <div
      className="min-h-screen pt-24 md:pt-28 pb-16 px-4 md:px-16 lg:px-24 xl:px-32"
      style={{ background: "var(--color-surface)" }}
    >
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mb-8"
      >
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--color-primary)" }}>
          {destination ? `Results for "${destination}"` : "All Hotels"}
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-bold" style={{ color: "var(--color-text-primary)" }}>
          {destination ? `Hotels in ${destination}` : "Browse All Hotels"}
        </h1>
        <p className="text-sm mt-1.5" style={{ color: "var(--color-text-secondary)" }}>
          {isLoading ? "Loading rooms…" : `${filteredRooms.length} ${filteredRooms.length === 1 ? "property" : "properties"} found`}
        </p>
      </motion.div>

      {/* Mobile filter button */}
      <div className="flex items-center gap-3 mb-5 lg:hidden">
        <button
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-colors duration-200"
          style={{
            borderColor: "var(--color-primary)",
            color: "var(--color-primary)",
            background: mobileFilterOpen ? "var(--color-primary-light)" : "transparent",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="10" y1="18" x2="14" y2="18"/>
          </svg>
          Filters
          {(filters.roomType.length + filters.priceRange.length + filters.category.length) > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs text-white"
              style={{ background: "var(--color-primary)" }}>
              {filters.roomType.length + filters.priceRange.length + filters.category.length}
            </span>
          )}
        </button>
        {selectedSort && (
          <span className="text-xs px-3 py-1 rounded-full"
            style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}>
            {selectedSort}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Filter panel — desktop sticky, mobile collapsible */}
        <div className="lg:sticky lg:top-28 hidden lg:block">
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            selectedSort={selectedSort}
            setSelectedSort={setSelectedSort}
            onClear={clearFilters}
          />
        </div>

        {/* Mobile filter panel */}
        <AnimatePresence>
          {mobileFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full overflow-hidden lg:hidden"
            >
              <FilterPanel
                filters={filters}
                setFilters={setFilters}
                selectedSort={selectedSort}
                setSelectedSort={setSelectedSort}
                onClear={clearFilters}
                mobileOpen
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Room grid */}
        <div className="flex-1 w-full">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredRooms.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-24 flex flex-col items-center gap-4"
            >
              <svg viewBox="0 0 64 64" fill="none" className="w-16 h-16 opacity-30"
                style={{ color: "var(--color-text-muted)" }}>
                <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2"/>
                <path d="M20 32h24M32 20v24" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <p className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
                No rooms match your filters
              </p>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                Try adjusting or clearing your search criteria
              </p>
              <button onClick={clearFilters} className="btn-primary mt-2">Clear Filters</button>
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {filteredRooms.map((room, i) => (
                <HotelCard key={room._id} room={room} index={i} />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllRooms;
