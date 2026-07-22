/**
 * addCategoryHotels.js — YoYo Category Hotel Seed Script
 * ────────────────────────────────────────────────────────
 * Adds 5 hotels per category (Budget, Premium, Luxury, Villa, Business)
 * with matching room types (Single Bed, Double Bed, Family Suite,
 * Luxury Suite, Mountain View Cottage, Heritage Suite, Business Suite).
 *
 * Run from server/ folder:  node addCategoryHotels.js
 */

import mongoose from "mongoose";
import dotenv   from "dotenv";
import { fileURLToPath } from "url";
import { existsSync }    from "fs";
import path              from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath   = existsSync(path.join(__dirname, ".env"))
  ? path.join(__dirname, ".env")
  : path.join(__dirname, "server", ".env");
dotenv.config({ path: envPath });

// ─── Schemas ───────────────────────────────────────────────────────────────
const hotelSchema = new mongoose.Schema(
  { name: String, address: String, contact: String, city: String },
  { timestamps: true }
);
const roomSchema = new mongoose.Schema(
  {
    hotel:         { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" },
    roomType:      String,
    pricePerNight: Number,
    amenities:     [String],
    images:        [String],
    isAvailable:   { type: Boolean, default: true },
    category:      {
      type:    String,
      enum:    ["Budget", "Premium", "Luxury", "Villa", "Business"],
      default: "Budget",
    },
  },
  { timestamps: true }
);
const Hotel = mongoose.models.Hotel || mongoose.model("Hotel", hotelSchema);
const Room  = mongoose.models.Room  || mongoose.model("Room",  roomSchema);

// ─── Curated Unsplash images by category ───────────────────────────────────
const IMGS = {
  Budget:   [
    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80",
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80",
    "https://images.unsplash.com/photo-1560347876-aeef00ee58a1?w=600&q=80",
  ],
  Premium:  [
    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=80",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80",
    "https://images.unsplash.com/photo-1587381420270-3e1a5b9e6904?w=600&q=80",
  ],
  Luxury:   [
    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&q=80",
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&q=80",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80",
  ],
  Villa:    [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
  ],
  Business: [
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&q=80",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80",
    "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=600&q=80",
  ],
};

// ─── Hotels per category × room type ───────────────────────────────────────
const SEED = [
  // ── BUDGET ─────────────────────────────────────────────────────────────
  {
    hotel:    { name: "Backpacker's Haven Hostel", city: "Rishikesh",  address: "Laxman Jhula Road, Rishikesh" },
    category: "Budget",
    roomType: "Single Bed",
    price:    699,
    amenities: ["Free Wi-Fi", "Free Breakfast"],
  },
  {
    hotel:    { name: "Varanasi Budget Lodge",     city: "Varanasi",   address: "Dashashwamedh Ghat, Varanasi" },
    category: "Budget",
    roomType: "Double Bed",
    price:    999,
    amenities: ["Free Wi-Fi", "Room Service"],
  },
  {
    hotel:    { name: "Agra Budget Residency",     city: "Agra",       address: "Fatehabad Road, Agra" },
    category: "Budget",
    roomType: "Single Bed",
    price:    850,
    amenities: ["Free Wi-Fi"],
  },
  {
    hotel:    { name: "Ooty Budget Cottage",       city: "Ooty",       address: "Charring Cross, Ooty" },
    category: "Budget",
    roomType: "Double Bed",
    price:    1100,
    amenities: ["Free Wi-Fi", "Mountain View"],
  },
  {
    hotel:    { name: "Haridwar Pilgrim Inn",       city: "Haridwar",   address: "Har Ki Pauri Road, Haridwar" },
    category: "Budget",
    roomType: "Single Bed",
    price:    750,
    amenities: ["Free Wi-Fi", "Free Breakfast"],
  },

  // ── PREMIUM ────────────────────────────────────────────────────────────
  {
    hotel:    { name: "Udaipur Lake Premium",      city: "Udaipur",    address: "Lake Pichola Road, Udaipur" },
    category: "Premium",
    roomType: "Double Bed",
    price:    3800,
    amenities: ["Free Wi-Fi", "Free Breakfast", "Pool Access", "Room Service"],
  },
  {
    hotel:    { name: "Darjeeling Summit Hotel",   city: "Darjeeling", address: "Chowrasta Mall Road, Darjeeling" },
    category: "Premium",
    roomType: "Family Suite",
    price:    4200,
    amenities: ["Free Wi-Fi", "Free Breakfast", "Mountain View", "Room Service"],
  },
  {
    hotel:    { name: "Jaipur Pink City Premier",  city: "Jaipur",     address: "MI Road, Jaipur" },
    category: "Premium",
    roomType: "Double Bed",
    price:    3500,
    amenities: ["Free Wi-Fi", "Free Breakfast", "Pool Access"],
  },
  {
    hotel:    { name: "Coorg Coffee Estate Hotel", city: "Coorg",      address: "Madikeri Town, Coorg" },
    category: "Premium",
    roomType: "Mountain View Cottage",
    price:    5500,
    amenities: ["Free Wi-Fi", "Free Breakfast", "Mountain View", "Pool Access"],
  },
  {
    hotel:    { name: "Manali Alpine Premium",     city: "Manali",     address: "Mall Road, Manali" },
    category: "Premium",
    roomType: "Mountain View Cottage",
    price:    4800,
    amenities: ["Free Wi-Fi", "Free Breakfast", "Mountain View"],
  },

  // ── LUXURY ─────────────────────────────────────────────────────────────
  {
    hotel:    { name: "Mumbai Grand Luxury",       city: "Mumbai",     address: "Marine Drive, Mumbai" },
    category: "Luxury",
    roomType: "Luxury Suite",
    price:    18000,
    amenities: ["Free Wi-Fi", "Free Breakfast", "Pool Access", "Room Service", "Mountain View"],
  },
  {
    hotel:    { name: "Delhi Imperial Palace",     city: "Delhi",      address: "Janpath, New Delhi" },
    category: "Luxury",
    roomType: "Luxury Suite",
    price:    22000,
    amenities: ["Free Wi-Fi", "Free Breakfast", "Pool Access", "Room Service"],
  },
  {
    hotel:    { name: "Goa Infinity Luxury Resort",city: "Goa",        address: "Calangute Beach, Goa" },
    category: "Luxury",
    roomType: "Luxury Suite",
    price:    15000,
    amenities: ["Free Wi-Fi", "Free Breakfast", "Pool Access", "Room Service"],
  },
  {
    hotel:    { name: "Jaipur Royal Haveli Luxury",city: "Jaipur",     address: "Amer Road, Jaipur" },
    category: "Luxury",
    roomType: "Heritage Suite",
    price:    12000,
    amenities: ["Free Wi-Fi", "Free Breakfast", "Pool Access", "Room Service"],
  },
  {
    hotel:    { name: "Shimla Cloud Nine Luxury",  city: "Shimla",     address: "The Ridge, Shimla" },
    category: "Luxury",
    roomType: "Mountain View Cottage",
    price:    9500,
    amenities: ["Free Wi-Fi", "Free Breakfast", "Mountain View", "Pool Access"],
  },

  // ── VILLA ──────────────────────────────────────────────────────────────
  {
    hotel:    { name: "Goa Beachfront Villa",      city: "Goa",        address: "Anjuna Beach Road, Goa" },
    category: "Villa",
    roomType: "Family Suite",
    price:    14000,
    amenities: ["Free Wi-Fi", "Free Breakfast", "Pool Access", "Room Service"],
  },
  {
    hotel:    { name: "Kerala Backwaters Villa",   city: "Alappuzha",  address: "Alappuzha Waterfront, Kerala" },
    category: "Villa",
    roomType: "Luxury Suite",
    price:    16000,
    amenities: ["Free Wi-Fi", "Free Breakfast", "Pool Access", "Room Service"],
  },
  {
    hotel:    { name: "Udaipur Lakefront Villa",   city: "Udaipur",    address: "Fateh Sagar Lake, Udaipur" },
    category: "Villa",
    roomType: "Family Suite",
    price:    20000,
    amenities: ["Free Wi-Fi", "Free Breakfast", "Pool Access", "Room Service", "Mountain View"],
  },
  {
    hotel:    { name: "Coorg Jungle Villa",        city: "Coorg",      address: "Virajpet, Coorg" },
    category: "Villa",
    roomType: "Mountain View Cottage",
    price:    11000,
    amenities: ["Free Wi-Fi", "Free Breakfast", "Mountain View", "Pool Access"],
  },
  {
    hotel:    { name: "Alibaug Sea Villa",         city: "Alibaug",    address: "Nagaon Beach, Alibaug" },
    category: "Villa",
    roomType: "Family Suite",
    price:    13500,
    amenities: ["Free Wi-Fi", "Free Breakfast", "Pool Access", "Room Service"],
  },

  // ── BUSINESS ───────────────────────────────────────────────────────────
  {
    hotel:    { name: "Bengaluru Tech Park Hotel", city: "Bangalore",  address: "Outer Ring Road, Bangalore" },
    category: "Business",
    roomType: "Business Suite",
    price:    6500,
    amenities: ["Free Wi-Fi", "Free Breakfast", "Room Service", "Pool Access"],
  },
  {
    hotel:    { name: "Hyderabad HITEC Business",  city: "Hyderabad",  address: "HITEC City, Hyderabad" },
    category: "Business",
    roomType: "Business Suite",
    price:    5800,
    amenities: ["Free Wi-Fi", "Free Breakfast", "Room Service"],
  },
  {
    hotel:    { name: "Pune Hinjewadi Business Hub",city: "Pune",      address: "Hinjewadi Phase 1, Pune" },
    category: "Business",
    roomType: "Business Suite",
    price:    5200,
    amenities: ["Free Wi-Fi", "Free Breakfast", "Room Service", "Pool Access"],
  },
  {
    hotel:    { name: "Chennai IT Corridor Hotel", city: "Chennai",    address: "OMR Tech Corridor, Chennai" },
    category: "Business",
    roomType: "Double Bed",
    price:    4200,
    amenities: ["Free Wi-Fi", "Free Breakfast", "Room Service"],
  },
  {
    hotel:    { name: "Noida Business Grand",      city: "Noida",      address: "Sector 62, Noida" },
    category: "Business",
    roomType: "Business Suite",
    price:    7000,
    amenities: ["Free Wi-Fi", "Free Breakfast", "Room Service", "Pool Access"],
  },
];

// ─── Main ──────────────────────────────────────────────────────────────────
async function main() {
  const uri = process.env.MONGODB_URL || process.env.MONGODB_URI;
  if (!uri) { console.error("❌  MONGODB_URL not found"); process.exit(1); }

  console.log("🔗  Connecting to MongoDB…");
  await mongoose.connect(uri);
  console.log("✅  Connected!\n");

  let created = 0;
  const catCount = {};

  for (let i = 0; i < SEED.length; i++) {
    const s = SEED[i];
    const existing = await Hotel.findOne({ name: s.hotel.name, city: s.hotel.city });
    if (existing) {
      console.log(`⏭️   Skip (exists): ${s.hotel.name}`);
      continue;
    }

    const hotel = await Hotel.create({
      name:    s.hotel.name,
      address: s.hotel.address,
      contact: "+91 98765 43210",
      city:    s.hotel.city,
    });

    const imgList = IMGS[s.category];
    await Room.create({
      hotel:         hotel._id,
      roomType:      s.roomType,
      pricePerNight: s.price,
      amenities:     s.amenities,
      images:        [imgList[i % imgList.length]],
      isAvailable:   true,
      category:      s.category,
    });

    catCount[s.category] = (catCount[s.category] || 0) + 1;
    created++;
    console.log(`✅  [${s.category}] ${s.hotel.name} — ${s.hotel.city} · ${s.roomType} · ₹${s.price}/night`);
  }

  console.log("\n📊  Summary:");
  for (const [cat, count] of Object.entries(catCount)) {
    console.log(`   ${cat}: ${count} hotel(s)`);
  }
  console.log(`\n🎉  Done! Created ${created} hotels.\n`);
  await mongoose.disconnect();
}

main().catch(err => { console.error("❌", err.message); process.exit(1); });
