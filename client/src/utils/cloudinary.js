/**
 * YoYo Rooms — Cloudinary URL Utilities (client-side)
 *
 * Cloud name: dgqgzmzed
 * All media (images + videos) are delivered via Cloudinary CDN.
 * Use these helpers instead of raw Unsplash/Pexels URLs.
 */

const CLOUD_NAME = "dgqgzmzed";
const BASE       = `https://res.cloudinary.com/${CLOUD_NAME}`;

// ── Image URL builder ──────────────────────────────────────────
/**
 * @param {string} publicId  — Cloudinary public_id (e.g. "yoyo/hotels/goa_1")
 * @param {object} opts      — Optional transformation options
 */
export const cloudImg = (publicId, opts = {}) => {
  const {
    width   = 800,
    height,
    quality = "auto",
    format  = "auto",
    crop    = "fill",
    gravity = "auto",
  } = opts;

  const transforms = [
    `f_${format}`,
    `q_${quality}`,
    `w_${width}`,
    height ? `h_${height}` : null,
    `c_${crop}`,
    gravity ? `g_${gravity}` : null,
  ]
    .filter(Boolean)
    .join(",");

  return `${BASE}/image/upload/${transforms}/${publicId}`;
};

// ── Video URL builder ─────────────────────────────────────────
/**
 * @param {string} publicId  — e.g. "yoyo/hero_video"
 * @param {object} opts
 */
export const cloudVideo = (publicId, opts = {}) => {
  const { quality = "auto", format = "auto" } = opts;
  const transforms = [`f_${format}`, `q_${quality}`].join(",");
  return `${BASE}/video/upload/${transforms}/${publicId}`;
};

// ── Poster (thumbnail from video) ────────────────────────────
export const cloudVideoPoster = (publicId) =>
  `${BASE}/video/upload/f_jpg,q_auto,w_1920/${publicId}.jpg`;

// ── Pre-defined media catalogue ─────────────────────────────
// These are the public_ids for assets uploaded to Cloudinary.
// Run `node server/uploadAssets.js` to upload them initially.

export const CLOUDINARY = {
  // Hero section background video
  heroVideo: cloudVideo("yoyo/hero_video"),
  heroPoster: cloudVideoPoster("yoyo/hero_video"),

  // Logo
  logo: cloudImg("yoyo/brand/logo", { width: 120, crop: "scale" }),

  // City thumbnails
  cities: {
    mumbai:    cloudImg("yoyo/cities/mumbai",    { width: 600, height: 400 }),
    delhi:     cloudImg("yoyo/cities/delhi",     { width: 600, height: 400 }),
    goa:       cloudImg("yoyo/cities/goa",       { width: 600, height: 400 }),
    jaipur:    cloudImg("yoyo/cities/jaipur",    { width: 600, height: 400 }),
    manali:    cloudImg("yoyo/cities/manali",    { width: 600, height: 400 }),
    udaipur:   cloudImg("yoyo/cities/udaipur",   { width: 600, height: 400 }),
    bengaluru: cloudImg("yoyo/cities/bengaluru", { width: 600, height: 400 }),
    kochi:     cloudImg("yoyo/cities/kochi",     { width: 600, height: 400 }),
    agra:      cloudImg("yoyo/cities/agra",      { width: 600, height: 400 }),
    shimla:    cloudImg("yoyo/cities/shimla",    { width: 600, height: 400 }),
  },

  // Hotel room images — maps to Cloudinary public_ids
  rooms: {
    goa: [
      cloudImg("yoyo/rooms/goa_1", { width: 800, height: 600 }),
      cloudImg("yoyo/rooms/goa_2", { width: 800, height: 600 }),
    ],
    jaipur: [
      cloudImg("yoyo/rooms/jaipur_1", { width: 800, height: 600 }),
      cloudImg("yoyo/rooms/jaipur_2", { width: 800, height: 600 }),
    ],
    mumbai: [
      cloudImg("yoyo/rooms/mumbai_1", { width: 800, height: 600 }),
      cloudImg("yoyo/rooms/mumbai_2", { width: 800, height: 600 }),
    ],
    manali: [
      cloudImg("yoyo/rooms/manali_1", { width: 800, height: 600 }),
      cloudImg("yoyo/rooms/manali_2", { width: 800, height: 600 }),
    ],
    udaipur: [
      cloudImg("yoyo/rooms/udaipur_1", { width: 800, height: 600 }),
      cloudImg("yoyo/rooms/udaipur_2", { width: 800, height: 600 }),
    ],
    delhi: [
      cloudImg("yoyo/rooms/delhi_1", { width: 800, height: 600 }),
      cloudImg("yoyo/rooms/delhi_2", { width: 800, height: 600 }),
    ],
    bengaluru: [
      cloudImg("yoyo/rooms/bengaluru_1", { width: 800, height: 600 }),
      cloudImg("yoyo/rooms/bengaluru_2", { width: 800, height: 600 }),
    ],
    kochi: [
      cloudImg("yoyo/rooms/kochi_1", { width: 800, height: 600 }),
      cloudImg("yoyo/rooms/kochi_2", { width: 800, height: 600 }),
    ],
  },
};

// ── Fallback: fetch-then-upload proxy URL ───────────────────
// Used by the seeder to upload external images to Cloudinary.
// On the client side, if a room.images[0] is already a Cloudinary URL, use it directly.
export const isCloudinaryUrl = (url) =>
  typeof url === "string" && url.includes("res.cloudinary.com");

// ── Optimise any image URL for display ──────────────────────
// If it's already on Cloudinary, add auto quality/format.
// Otherwise return as-is (fallback).
export const optimiseImage = (url, width = 800) => {
  if (!url) return "";
  if (isCloudinaryUrl(url)) {
    // Inject f_auto,q_auto,w_{width} into the transform string
    return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
  }
  return url;
};
