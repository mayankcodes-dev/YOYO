/**
 * addHotels.js — YoYo Hotel Seed Script
 * ─────────────────────────────────────
 * Adds 100 new hotels across different Indian cities to MongoDB.
 *
 * Usage:
 *   node addHotels.js
 *
 * Requires:
 *   - server/.env with MONGODB_URI set
 *   - npm install mongoose dotenv (in root or server/)
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

// Load server .env — works from root YOYO/ OR from server/ folder
import { existsSync } from "fs";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = existsSync(path.join(__dirname, "server", ".env"))
  ? path.join(__dirname, "server", ".env")
  : path.join(__dirname, ".env");
dotenv.config({ path: envPath });

// ─── Minimal Mongoose Schemas ──────────────────────────────────────────────
const hotelSchema = new mongoose.Schema(
  {
    name: String,
    address: String,
    contact: String,
    city: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const roomSchema = new mongoose.Schema(
  {
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" },
    roomType: String,
    pricePerNight: Number,
    amenities: [String],
    images: [String],           // max 5 in production; exactly 1 used here
    isAvailable: { type: Boolean, default: true },
    category: { type: String, enum: ['Budget', 'Premium', 'Luxury', 'Villa', 'Business'], default: 'Budget' },
  },
  { timestamps: true }
);

const Hotel = mongoose.models.Hotel || mongoose.model("Hotel", hotelSchema);
const Room = mongoose.models.Room || mongoose.model("Room", roomSchema);

// ─── Unsplash curated hotel-room images (royalty-free) ─────────────────────
const ROOM_IMAGES = [
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&q=80",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80",
  "https://images.unsplash.com/photo-1560347876-aeef00ee58a1?w=600&q=80",
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80",
  "https://images.unsplash.com/photo-1587381420270-3e1a5b9e6904?w=600&q=80",
  "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=80",
  "https://images.unsplash.com/photo-1534612899740-55c821a90bee?w=600&q=80",
  "https://images.unsplash.com/photo-1591017403286-fd8493524e1e?w=600&q=80",
  "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=600&q=80",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
  "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=600&q=80",
  "https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?w=600&q=80",
  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&q=80",
  "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&q=80",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80",
  "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=600&q=80",
  "https://images.unsplash.com/photo-1574691250077-03a929faece5?w=600&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
];

// Helper: pick an image by cycling through the list
const img = (i) => ROOM_IMAGES[i % ROOM_IMAGES.length];

// ─── 100 new hotels ────────────────────────────────────────────────────────
const NEW_HOTELS = [
  // South India
  { name: "Andaman Pearl Resort",       city: "Port Blair",           type: "Luxury Room",  price: 7800, amenities: ["Free Wi-Fi","Free Breakfast","Pool Access","Room Service"] },
  { name: "Lakshadweep Lagoon Inn",     city: "Kavaratti",            type: "Double Bed",   price: 5200, amenities: ["Free Wi-Fi","Pool Access","Free Breakfast"] },
  { name: "Rann Utsav Desert Camp",     city: "Bhuj",                 type: "Family Suite", price: 9500, amenities: ["Free Wi-Fi","Free Breakfast","Room Service"] },
  { name: "Hampi Rock Residency",       city: "Hampi",                type: "Budget",       price: 1400, amenities: ["Free Wi-Fi","Free Breakfast"] },
  { name: "Mysore Palace View Hotel",   city: "Mysore",               type: "Double Bed",   price: 2800, amenities: ["Free Wi-Fi","Free Breakfast","Room Service"] },
  { name: "Alleppey Houseboat Suites",  city: "Alappuzha",            type: "Luxury Room",  price: 6800, amenities: ["Free Wi-Fi","Free Breakfast","Pool Access"] },
  { name: "Munnar Tea Garden Resort",   city: "Munnar",               type: "Family Suite", price: 5600, amenities: ["Free Wi-Fi","Free Breakfast","Mountain View","Pool Access"] },
  { name: "Pondicherry French Quarter", city: "Pondicherry",          type: "Double Bed",   price: 3200, amenities: ["Free Wi-Fi","Free Breakfast","Pool Access"] },
  { name: "Madurai Meenakshi Inn",      city: "Madurai",              type: "Luxury Room",  price: 3900, amenities: ["Free Wi-Fi","Free Breakfast","Pool Access","Room Service"] },
  { name: "Coimbatore Textile Heritage",city: "Coimbatore",           type: "Double Bed",   price: 2200, amenities: ["Free Wi-Fi","Free Breakfast"] },
  { name: "Trichy Rock Fort View",      city: "Tiruchirappalli",      type: "Single Bed",   price: 1400, amenities: ["Free Wi-Fi","Room Service"] },
  { name: "Kanyakumari Sunrise Point",  city: "Kanyakumari",          type: "Family Suite", price: 5000, amenities: ["Free Wi-Fi","Free Breakfast","Pool Access","Mountain View"] },
  { name: "Thanjavur Big Temple Stay",  city: "Thanjavur",            type: "Double Bed",   price: 2600, amenities: ["Free Wi-Fi","Free Breakfast","Room Service"] },
  { name: "Thrissur Cultural Stay",     city: "Thrissur",             type: "Luxury Room",  price: 4600, amenities: ["Free Wi-Fi","Free Breakfast","Pool Access","Room Service"] },
  { name: "Kozhikode Zamorin Heritage", city: "Kozhikode",            type: "Double Bed",   price: 3000, amenities: ["Free Wi-Fi","Free Breakfast","Pool Access"] },
  { name: "Kannur Beach Bungalow",      city: "Kannur",               type: "Family Suite", price: 6200, amenities: ["Free Wi-Fi","Free Breakfast","Pool Access"] },
  { name: "Palakkad Gap View Inn",      city: "Palakkad",             type: "Double Bed",   price: 2300, amenities: ["Free Wi-Fi","Mountain View","Free Breakfast"] },
  { name: "Vellore Fort Residency",     city: "Vellore",              type: "Single Bed",   price: 1500, amenities: ["Free Wi-Fi","Room Service"] },
  // North India - Mountains
  { name: "Spiti Valley Retreat",       city: "Kaza",                 type: "Double Bed",   price: 3900, amenities: ["Free Wi-Fi","Mountain View","Free Breakfast"] },
  { name: "Pushkar Lakeside Haven",     city: "Pushkar",              type: "Single Bed",   price: 1700, amenities: ["Free Wi-Fi","Room Service"] },
  { name: "Amritsar Golden Temple Inn", city: "Amritsar",             type: "Family Suite", price: 4500, amenities: ["Free Wi-Fi","Free Breakfast","Room Service","Pool Access"] },
  { name: "Chandigarh Rose Garden",     city: "Chandigarh",           type: "Double Bed",   price: 2600, amenities: ["Free Wi-Fi","Free Breakfast","Pool Access"] },
  { name: "Jodhpur Blue City Manor",    city: "Jodhpur",              type: "Luxury Room",  price: 5800, amenities: ["Free Wi-Fi","Free Breakfast","Pool Access","Room Service"] },
  { name: "Bikaner Camel Safari Camp",  city: "Bikaner",              type: "Family Suite", price: 7200, amenities: ["Free Wi-Fi","Free Breakfast","Mountain View"] },
  { name: "Leh Ladakh Mountain Base",   city: "Leh",                  type: "Double Bed",   price: 3800, amenities: ["Free Wi-Fi","Free Breakfast","Mountain View"] },
  { name: "Srinagar Dal Lake Houseboat",city: "Srinagar",             type: "Luxury Room",  price: 8900, amenities: ["Free Wi-Fi","Free Breakfast","Mountain View","Room Service"] },
  { name: "Gulmarg Ski Resort Hotel",   city: "Gulmarg",              type: "Family Suite", price: 12000,amenities: ["Free Wi-Fi","Free Breakfast","Mountain View","Pool Access"] },
  { name: "Nainital Lake Side Lodge",   city: "Nainital",             type: "Double Bed",   price: 3100, amenities: ["Free Wi-Fi","Free Breakfast","Mountain View"] },
  { name: "Mussoorie Valley Heights",   city: "Mussoorie",            type: "Luxury Room",  price: 4800, amenities: ["Free Wi-Fi","Free Breakfast","Mountain View","Pool Access"] },
  { name: "Haridwar Ganga Ashram",      city: "Haridwar",             type: "Single Bed",   price: 1100, amenities: ["Free Wi-Fi","Free Breakfast"] },
  { name: "Dehradun Forest Retreat",    city: "Dehradun",             type: "Family Suite", price: 5100, amenities: ["Free Wi-Fi","Free Breakfast","Pool Access","Mountain View"] },
  { name: "Dharamsala Dalai Lama Vista",city: "Dharamsala",           type: "Luxury Room",  price: 6800, amenities: ["Free Wi-Fi","Free Breakfast","Mountain View","Pool Access"] },
  { name: "Kullu Apple Orchard Stay",   city: "Kullu",                type: "Family Suite", price: 5400, amenities: ["Free Wi-Fi","Free Breakfast","Mountain View"] },
  { name: "Dalhousie Cedar Pine Inn",   city: "Dalhousie",            type: "Double Bed",   price: 3300, amenities: ["Free Wi-Fi","Free Breakfast","Mountain View"] },
  { name: "Mount Abu Sky Lodge",        city: "Mount Abu",            type: "Luxury Room",  price: 5600, amenities: ["Free Wi-Fi","Free Breakfast","Mountain View","Pool Access"] },
  // UP & Central India
  { name: "Lucknow Nawabi Haveli",      city: "Lucknow",              type: "Luxury Room",  price: 4400, amenities: ["Free Wi-Fi","Free Breakfast","Room Service","Pool Access"] },
  { name: "Prayagraj Confluence Inn",   city: "Prayagraj",            type: "Double Bed",   price: 2400, amenities: ["Free Wi-Fi","Free Breakfast"] },
  { name: "Mathura Vrindavan Temple",   city: "Mathura",              type: "Single Bed",   price: 900,  amenities: ["Free Wi-Fi"] },
  { name: "Kanpur Metro Business Hotel",city: "Kanpur",               type: "Double Bed",   price: 1800, amenities: ["Free Wi-Fi","Room Service"] },
  { name: "Bhopal Lake View Suites",    city: "Bhopal",               type: "Single Bed",   price: 1200, amenities: ["Free Wi-Fi","Room Service"] },
  { name: "Indore Business Park Hotel", city: "Indore",               type: "Double Bed",   price: 2100, amenities: ["Free Wi-Fi","Free Breakfast"] },
  { name: "Jabalpur Marble Rocks Inn",  city: "Jabalpur",             type: "Luxury Room",  price: 3800, amenities: ["Free Wi-Fi","Free Breakfast","Room Service"] },
  { name: "Gwalior Fort Heritage",      city: "Gwalior",              type: "Double Bed",   price: 2800, amenities: ["Free Wi-Fi","Free Breakfast","Room Service"] },
  { name: "Ujjain Mahakal Dharmshala", city: "Ujjain",               type: "Single Bed",   price: 900,  amenities: ["Free Wi-Fi"] },
  { name: "Raipur Chhattisgarh Capitol",city: "Raipur",               type: "Double Bed",   price: 2000, amenities: ["Free Wi-Fi","Room Service"] },
  // West India
  { name: "Nashik Grape Valley Hotel",  city: "Nashik",               type: "Family Suite", price: 5500, amenities: ["Free Wi-Fi","Free Breakfast","Pool Access","Room Service"] },
  { name: "Nagpur Orange City Hotel",   city: "Nagpur",               type: "Double Bed",   price: 2300, amenities: ["Free Wi-Fi","Free Breakfast","Room Service"] },
  { name: "Kolhapur Royal Palace",      city: "Kolhapur",             type: "Luxury Room",  price: 3800, amenities: ["Free Wi-Fi","Free Breakfast","Room Service","Pool Access"] },
  { name: "Surat Diamond City Hotel",   city: "Surat",                type: "Double Bed",   price: 2700, amenities: ["Free Wi-Fi","Free Breakfast","Pool Access"] },
  { name: "Vadodara Baroda Palace Inn", city: "Vadodara",             type: "Luxury Room",  price: 5000, amenities: ["Free Wi-Fi","Free Breakfast","Pool Access","Room Service"] },
  { name: "Rajkot Heritage Grand",      city: "Rajkot",               type: "Family Suite", price: 6100, amenities: ["Free Wi-Fi","Free Breakfast","Mountain View","Pool Access"] },
  { name: "Gandhinagar Capitol Suites", city: "Gandhinagar",          type: "Double Bed",   price: 2900, amenities: ["Free Wi-Fi","Free Breakfast","Room Service"] },
  { name: "Panaji Goa Old Town Villa",  city: "Panaji",               type: "Luxury Room",  price: 5900, amenities: ["Free Wi-Fi","Free Breakfast","Pool Access","Room Service"] },
  { name: "Margao South Goa Retreat",   city: "Margao",               type: "Family Suite", price: 7500, amenities: ["Free Wi-Fi","Free Breakfast","Pool Access"] },
  // East India
  { name: "Bhubaneswar Temple City",    city: "Bhubaneswar",          type: "Luxury Room",  price: 3600, amenities: ["Free Wi-Fi","Free Breakfast","Pool Access","Room Service"] },
  { name: "Puri Sea Shore Suites",      city: "Puri",                 type: "Family Suite", price: 5300, amenities: ["Free Wi-Fi","Free Breakfast","Pool Access"] },
  { name: "Visakhapatnam Beach Vista",  city: "Visakhapatnam",        type: "Double Bed",   price: 3000, amenities: ["Free Wi-Fi","Free Breakfast","Pool Access"] },
  { name: "Vijayawada Krishna Suites",  city: "Vijayawada",           type: "Single Bed",   price: 1600, amenities: ["Free Wi-Fi","Room Service"] },
  { name: "Rajahmundry Godavari Suites",city: "Rajahmundry",          type: "Family Suite", price: 4700, amenities: ["Free Wi-Fi","Free Breakfast","Pool Access","Room Service"] },
  { name: "Patna Ganga View Hotel",     city: "Patna",                type: "Single Bed",   price: 1300, amenities: ["Free Wi-Fi","Room Service"] },
  { name: "Ranchi Jharkhand Capitol",   city: "Ranchi",               type: "Double Bed",   price: 2000, amenities: ["Free Wi-Fi","Room Service"] },
  { name: "Siliguri Hill Gate Hotel",   city: "Siliguri",             type: "Double Bed",   price: 2400, amenities: ["Free Wi-Fi","Free Breakfast","Mountain View"] },
  { name: "Asansol Coal City Hotel",    city: "Asansol",              type: "Double Bed",   price: 1700, amenities: ["Free Wi-Fi","Room Service"] },
  // Northeast India
  { name: "Agartala Royal Tripura Inn", city: "Agartala",             type: "Luxury Room",  price: 3300, amenities: ["Free Wi-Fi","Free Breakfast","Pool Access"] },
  { name: "Imphal War Memorial Hotel",  city: "Imphal",               type: "Double Bed",   price: 2700, amenities: ["Free Wi-Fi","Free Breakfast"] },
  { name: "Kohima Heritage Homestay",   city: "Kohima",               type: "Family Suite", price: 4800, amenities: ["Free Wi-Fi","Free Breakfast","Mountain View"] },
  { name: "Shillong Scotland of East",  city: "Shillong",             type: "Luxury Room",  price: 5700, amenities: ["Free Wi-Fi","Free Breakfast","Mountain View","Pool Access"] },
  { name: "Guwahati Brahmaputra View",  city: "Guwahati",             type: "Double Bed",   price: 2800, amenities: ["Free Wi-Fi","Free Breakfast","Room Service"] },
  { name: "Jorhat Tea Estate Bungalow", city: "Jorhat",               type: "Family Suite", price: 6500, amenities: ["Free Wi-Fi","Free Breakfast","Mountain View","Pool Access"] },
  { name: "Aizawl Northeast Gateway",   city: "Aizawl",               type: "Double Bed",   price: 2600, amenities: ["Free Wi-Fi","Mountain View"] },
  { name: "Gangtok Sikkim Sky Villa",   city: "Gangtok",              type: "Luxury Room",  price: 7100, amenities: ["Free Wi-Fi","Free Breakfast","Mountain View","Pool Access"] },
  { name: "Pelling Kanchenjunga View",  city: "Pelling",              type: "Family Suite", price: 8200, amenities: ["Free Wi-Fi","Free Breakfast","Mountain View"] },
  { name: "Itanagar Arunachal Resort",  city: "Itanagar",             type: "Double Bed",   price: 3500, amenities: ["Free Wi-Fi","Free Breakfast","Mountain View"] },
  // Tier-2 cities
  { name: "Aurangabad Cave Heritage",   city: "Aurangabad",           type: "Luxury Room",  price: 4100, amenities: ["Free Wi-Fi","Free Breakfast","Room Service"] },
  { name: "Amravati Vidarbha Stay",     city: "Amravati",             type: "Double Bed",   price: 1900, amenities: ["Free Wi-Fi","Room Service"] },
  { name: "Pune Camp Area Hotel",       city: "Pune",                 type: "Luxury Room",  price: 4200, amenities: ["Free Wi-Fi","Free Breakfast","Pool Access","Room Service"] },
  { name: "Nashik Triambak Pilgrim",    city: "Nashik",               type: "Single Bed",   price: 1100, amenities: ["Free Wi-Fi"] },
  { name: "Hubli Business Center",      city: "Hubli",                type: "Single Bed",   price: 1300, amenities: ["Free Wi-Fi","Room Service"] },
  { name: "Belgaum Fort Residency",     city: "Belagavi",             type: "Double Bed",   price: 2100, amenities: ["Free Wi-Fi","Free Breakfast"] },
  { name: "Mangalore Coastal Retreat",  city: "Mangalore",            type: "Luxury Room",  price: 4200, amenities: ["Free Wi-Fi","Free Breakfast","Pool Access"] },
  { name: "Shimoga Western Ghats",      city: "Shivamogga",           type: "Family Suite", price: 5200, amenities: ["Free Wi-Fi","Free Breakfast","Mountain View","Pool Access"] },
  { name: "Bellary Iron Fort Hotel",    city: "Ballari",              type: "Double Bed",   price: 2100, amenities: ["Free Wi-Fi","Room Service"] },
  { name: "Tumkur Garden Stay",         city: "Tumkur",               type: "Single Bed",   price: 1000, amenities: ["Free Wi-Fi"] },
  { name: "Hyderabad Cyber Pearl",      city: "Hyderabad",            type: "Double Bed",   price: 3400, amenities: ["Free Wi-Fi","Free Breakfast","Pool Access"] },
  { name: "Warangal Kakatiyas Suites",  city: "Warangal",             type: "Luxury Room",  price: 4100, amenities: ["Free Wi-Fi","Free Breakfast","Pool Access","Room Service"] },
  { name: "Guntur Mirchi Spice Hotel",  city: "Guntur",               type: "Double Bed",   price: 2000, amenities: ["Free Wi-Fi","Room Service"] },
  { name: "Kakinada Port Vista Hotel",  city: "Kakinada",             type: "Luxury Room",  price: 3500, amenities: ["Free Wi-Fi","Free Breakfast","Pool Access"] },
  { name: "Nellore Andhra Heritage",    city: "Nellore",              type: "Single Bed",   price: 1400, amenities: ["Free Wi-Fi","Room Service"] },
  { name: "Tirupati Divine Residency",  city: "Tirupati",             type: "Double Bed",   price: 2500, amenities: ["Free Wi-Fi","Free Breakfast","Room Service"] },
  { name: "Kurnool Tungabhadra Stay",   city: "Kurnool",              type: "Double Bed",   price: 1800, amenities: ["Free Wi-Fi","Room Service"] },
  { name: "Erode Textile Towers",       city: "Erode",                type: "Double Bed",   price: 1800, amenities: ["Free Wi-Fi","Room Service"] },
  { name: "Thoothukudi Pearl Hotel",    city: "Thoothukudi",          type: "Luxury Room",  price: 3700, amenities: ["Free Wi-Fi","Free Breakfast","Pool Access"] },
  { name: "Salem Steel City Lodge",     city: "Salem",                type: "Double Bed",   price: 1900, amenities: ["Free Wi-Fi","Room Service"] },
  { name: "Kasauli Solang Escape",      city: "Kasauli",              type: "Luxury Room",  price: 4500, amenities: ["Free Wi-Fi","Free Breakfast","Mountain View","Room Service"] },
  { name: "Lansdowne Garhwal Nature",   city: "Lansdowne",            type: "Double Bed",   price: 2900, amenities: ["Free Wi-Fi","Mountain View","Free Breakfast"] },
  { name: "Chakrata Oak Forest Resort", city: "Chakrata",             type: "Family Suite", price: 5800, amenities: ["Free Wi-Fi","Free Breakfast","Mountain View","Pool Access"] },
  { name: "Solapur Business Suites",    city: "Solapur",              type: "Single Bed",   price: 1100, amenities: ["Free Wi-Fi","Room Service"] },
  { name: "Bilaspur Forest Edge Resort",city: "Bilaspur",             type: "Family Suite", price: 4300, amenities: ["Free Wi-Fi","Free Breakfast","Pool Access","Mountain View"] },
  { name: "Jaipur Palace", city: "Jaipur", type: "Family Suite", price: 3500, amenities: ["Free Wi-Fi", "Pool Access"], category: "Premium" },
  { name: "Udaipur Retreat", city: "Udaipur", type: "Luxury Room", price: 6000, amenities: ["Free Breakfast", "Mountain View"], category: "Luxury" },
  { name: "Ajmer Residency", city: "Ajmer", type: "Double Bed", price: 1500, amenities: ["Free Wi-Fi", "Room Service"], category: "Budget" },
  { name: "Ahmedabad Inn", city: "Ahmedabad", type: "Business Suite", price: 4000, amenities: ["Free Wi-Fi", "Gym Access"], category: "Business" },
  { name: "Mumbai Grand", city: "Mumbai", type: "Luxury Suite", price: 12000, amenities: ["Free Wi-Fi", "Spa", "Pool Access"], category: "Villa" },
  { name: "Delhi Lodge", city: "Delhi", type: "Double Bed", price: 1800, amenities: ["Free Wi-Fi", "Room Service"], category: "Budget" },
  { name: "Kolkata Heritage", city: "Kolkata", type: "Heritage Suite", price: 7000, amenities: ["Free Breakfast", "Free Wi-Fi"], category: "Luxury" },
  { name: "Chennai Suites", city: "Chennai", type: "Single Bed", price: 1200, amenities: ["Free Wi-Fi", "Laundry"], category: "Budget" },
  { name: "Bangalore Business", city: "Bangalore", type: "Business Suite", price: 5000, amenities: ["Free Wi-Fi", "Gym Access"], category: "Business" },
  { name: "Agra View Hotel", city: "Agra", type: "Family Suite", price: 4500, amenities: ["Free Wi-Fi", "Pool Access"], category: "Premium" },
  { name: "Varanasi Ganges Retreat", city: "Varanasi", type: "Luxury Room", price: 5500, amenities: ["Free Breakfast", "Balcony"], category: "Luxury" },
  { name: "Shimla Pine Inn", city: "Shimla", type: "Mountain View Cottage", price: 9000, amenities: ["Free Wi-Fi", "Mountain View", "Kitchen"], category: "Villa" },
  { name: "Manali Snow Resort", city: "Manali", type: "Luxury Suite", price: 11000, amenities: ["Free Breakfast", "Mountain View"], category: "Villa" },
  { name: "Rishikesh Yoga Retreat", city: "Rishikesh", type: "Double Bed", price: 1900, amenities: ["Free Wi-Fi", "Spa"], category: "Budget" },
  { name: "Jaisalmer Desert Camp", city: "Jaisalmer", type: "Family Suite", price: 4800, amenities: ["Free Wi-Fi", "Free Breakfast"], category: "Premium" },
  { name: "Ooty Tea Estate", city: "Ooty", type: "Luxury Room", price: 6500, amenities: ["Mountain View", "Free Wi-Fi"], category: "Luxury" },
  { name: "Kodaikanal Lake Resort", city: "Kodaikanal", type: "Family Suite", price: 4200, amenities: ["Free Wi-Fi", "Pool Access"], category: "Premium" },
  { name: "Mahabaleshwar Hills", city: "Mahabaleshwar", type: "Mountain View Cottage", price: 8500, amenities: ["Free Wi-Fi", "Mountain View"], category: "Villa" },
  { name: "Lonavala Valley View", city: "Lonavala", type: "Double Bed", price: 1700, amenities: ["Free Wi-Fi", "Room Service"], category: "Budget" },
  { name: "Darjeeling Heights", city: "Darjeeling", type: "Luxury Room", price: 5200, amenities: ["Mountain View", "Free Breakfast"], category: "Luxury" },
  { name: "Bodh Gaya Pilgrim Inn", city: "Bodh Gaya", type: "Single Bed", price: 1000, amenities: ["Free Wi-Fi", "Parking"], category: "Budget" },
  { name: "Khajuraho Heritage", city: "Khajuraho", type: "Heritage Suite", price: 6800, amenities: ["Free Wi-Fi", "Pool Access"], category: "Luxury" },
  { name: "Orchha River Retreat", city: "Orchha", type: "Family Suite", price: 3800, amenities: ["Free Wi-Fi", "Free Breakfast"], category: "Premium" },
  { name: "Pachmarhi Forest Lodge", city: "Pachmarhi", type: "Mountain View Cottage", price: 9500, amenities: ["Mountain View", "Free Breakfast"], category: "Villa" },
  { name: "Dwarka Ocean View", city: "Dwarka", type: "Double Bed", price: 1600, amenities: ["Free Wi-Fi", "Room Service"], category: "Budget" },
  { name: "Somnath Temple Stay", city: "Somnath", type: "Single Bed", price: 900, amenities: ["Free Wi-Fi"], category: "Budget" },
  { name: "Junagadh Palace", city: "Junagadh", type: "Luxury Room", price: 5800, amenities: ["Free Wi-Fi", "Free Breakfast"], category: "Luxury" },
  { name: "Bhavnagar Suites", city: "Bhavnagar", type: "Business Suite", price: 3200, amenities: ["Free Wi-Fi", "Gym Access"], category: "Business" },
  { name: "Jamnagar Royal", city: "Jamnagar", type: "Family Suite", price: 4100, amenities: ["Free Wi-Fi", "Pool Access"], category: "Premium" },
  { name: "Porbandar Coastal Inn", city: "Porbandar", type: "Double Bed", price: 1400, amenities: ["Free Wi-Fi", "Room Service"], category: "Budget" },
  { name: "Cuttack Business Hotel", city: "Cuttack", type: "Business Suite", price: 2800, amenities: ["Free Wi-Fi", "Gym Access"], category: "Business" },
  { name: "Rourkela Steel City Lodge", city: "Rourkela", type: "Single Bed", price: 1100, amenities: ["Free Wi-Fi", "Room Service"], category: "Budget" },
  { name: "Sambalpur Riverside", city: "Sambalpur", type: "Double Bed", price: 1500, amenities: ["Free Wi-Fi", "Parking"], category: "Budget" },
  { name: "Bokaro Suites", city: "Bokaro", type: "Business Suite", price: 3500, amenities: ["Free Wi-Fi", "Gym Access"], category: "Business" },
  { name: "Dhanbad Coal Capital Inn", city: "Dhanbad", type: "Family Suite", price: 2200, amenities: ["Free Wi-Fi", "Room Service"], category: "Premium" },
  { name: "Jamshedpur Grand", city: "Jamshedpur", type: "Luxury Room", price: 6200, amenities: ["Free Wi-Fi", "Pool Access"], category: "Luxury" },
  { name: "Muzaffarpur Litchi Garden", city: "Muzaffarpur", type: "Double Bed", price: 1300, amenities: ["Free Wi-Fi", "Parking"], category: "Budget" },
  { name: "Gaya Pilgrim Suites", city: "Gaya", type: "Single Bed", price: 1200, amenities: ["Free Wi-Fi", "Room Service"], category: "Budget" },
  { name: "Dibrugarh Tea Retreat", city: "Dibrugarh", type: "Luxury Suite", price: 10500, amenities: ["Free Wi-Fi", "Spa"], category: "Villa" },
  { name: "Tezpur Heritage", city: "Tezpur", type: "Heritage Suite", price: 5400, amenities: ["Free Wi-Fi", "Free Breakfast"], category: "Luxury" },
  { name: "Silchar Valley Inn", city: "Silchar", type: "Double Bed", price: 1800, amenities: ["Free Wi-Fi", "Room Service"], category: "Budget" },
  { name: "Cooch Behar Palace Stay", city: "Cooch Behar", type: "Family Suite", price: 3600, amenities: ["Free Wi-Fi", "Pool Access"], category: "Premium" },
  { name: "Malda Mango Garden Hotel", city: "Malda", type: "Single Bed", price: 950, amenities: ["Free Wi-Fi", "Room Service"], category: "Budget" },
  { name: "Howrah Bridge View", city: "Howrah", type: "Business Suite", price: 4200, amenities: ["Free Wi-Fi", "Gym Access"], category: "Business" },
  { name: "Thiruvananthapuram Royal", city: "Thiruvananthapuram", type: "Luxury Room", price: 7200, amenities: ["Free Wi-Fi", "Pool Access"], category: "Luxury" },
  { name: "Kottayam Backwaters Resort", city: "Kottayam", type: "Luxury Suite", price: 12500, amenities: ["Free Wi-Fi", "Spa", "Pool Access"], category: "Villa" },
  { name: "Wayanad Spice Retreat", city: "Wayanad", type: "Mountain View Cottage", price: 9800, amenities: ["Mountain View", "Free Breakfast"], category: "Villa" },
  { name: "Ratnagiri Coastal Stay", city: "Ratnagiri", type: "Double Bed", price: 1900, amenities: ["Free Wi-Fi", "Balcony"], category: "Budget" },
  { name: "Aligarh Fort Hotel", city: "Aligarh", type: "Family Suite", price: 2500, amenities: ["Free Wi-Fi", "Parking"], category: "Premium" },
  { name: "Meerut Grand", city: "Meerut", type: "Business Suite", price: 3800, amenities: ["Free Wi-Fi", "Gym Access"], category: "Business" },
  { name: "Moradabad Brass City Inn", city: "Moradabad", type: "Double Bed", price: 1600, amenities: ["Free Wi-Fi", "Room Service"], category: "Budget" },
  { name: "Bareilly Residency", city: "Bareilly", type: "Single Bed", price: 1100, amenities: ["Free Wi-Fi", "Laundry"], category: "Budget" },
  { name: "Gorakhpur Suites", city: "Gorakhpur", type: "Double Bed", price: 1400, amenities: ["Free Wi-Fi", "Room Service"], category: "Budget" },
  { name: "Jhansi Fort View", city: "Jhansi", type: "Heritage Suite", price: 5800, amenities: ["Free Wi-Fi", "Free Breakfast"], category: "Luxury" },
  { name: "Allahabad Sangam Hotel", city: "Allahabad", type: "Family Suite", price: 3400, amenities: ["Free Wi-Fi", "Room Service"], category: "Premium" },
  { name: "Roorkee Campus Lodge", city: "Roorkee", type: "Single Bed", price: 850, amenities: ["Free Wi-Fi"], category: "Budget" },
  { name: "Karnal Highway Retreat", city: "Karnal", type: "Double Bed", price: 1750, amenities: ["Free Wi-Fi", "Parking"], category: "Budget" },
  { name: "Panipat Heritage", city: "Panipat", type: "Family Suite", price: 2900, amenities: ["Free Wi-Fi", "Free Breakfast"], category: "Premium" },
  { name: "Faridabad Corporate Suites", city: "Faridabad", type: "Business Suite", price: 4500, amenities: ["Free Wi-Fi", "Gym Access"], category: "Business" },
  { name: "Noida Cyber Park Hotel", city: "Noida", type: "Luxury Room", price: 6800, amenities: ["Free Wi-Fi", "Pool Access"], category: "Luxury" },
  { name: "Jaipur Pink City Inn", city: "Jaipur", type: "Double Bed", price: 1800, amenities: ["Free Wi-Fi", "Room Service"], category: "Budget" },
  { name: "Udaipur Lake Palace", city: "Udaipur", type: "Luxury Suite", price: 13000, amenities: ["Free Breakfast", "Pool Access"], category: "Villa" },
  { name: "Ajmer Dargah Stay", city: "Ajmer", type: "Single Bed", price: 1000, amenities: ["Free Wi-Fi", "Parking"], category: "Budget" },
  { name: "Ahmedabad Heritage Stay", city: "Ahmedabad", type: "Family Suite", price: 3600, amenities: ["Free Wi-Fi", "Free Breakfast"], category: "Premium" },
  { name: "Mumbai Sea View", city: "Mumbai", type: "Luxury Room", price: 8500, amenities: ["Free Wi-Fi", "Balcony"], category: "Luxury" },
  { name: "Delhi Metro Suites", city: "Delhi", type: "Business Suite", price: 5500, amenities: ["Free Wi-Fi", "Gym Access"], category: "Business" },
  { name: "Kolkata Victoria Palace", city: "Kolkata", type: "Heritage Suite", price: 7500, amenities: ["Free Wi-Fi", "Free Breakfast"], category: "Luxury" },
  { name: "Chennai Marina Inn", city: "Chennai", type: "Double Bed", price: 1900, amenities: ["Free Wi-Fi", "Room Service"], category: "Budget" },
  { name: "Bangalore Tech Hub Resort", city: "Bangalore", type: "Luxury Suite", price: 9500, amenities: ["Free Wi-Fi", "Pool Access", "Spa"], category: "Luxury" },
  { name: "Agra Taj Retreat", city: "Agra", type: "Luxury Room", price: 6800, amenities: ["Free Wi-Fi", "Free Breakfast"], category: "Luxury" },
  { name: "Varanasi River View", city: "Varanasi", type: "Double Bed", price: 1700, amenities: ["Free Wi-Fi", "Balcony"], category: "Budget" },
  { name: "Shimla Snow Peaks", city: "Shimla", type: "Mountain View Cottage", price: 10500, amenities: ["Mountain View", "Free Breakfast"], category: "Villa" },
  { name: "Manali Alpine Resort", city: "Manali", type: "Family Suite", price: 4600, amenities: ["Free Wi-Fi", "Mountain View"], category: "Premium" },
  { name: "Rishikesh Ganges Inn", city: "Rishikesh", type: "Single Bed", price: 1100, amenities: ["Free Wi-Fi", "Room Service"], category: "Budget" },
  { name: "Jaisalmer Golden Fort Hotel", city: "Jaisalmer", type: "Heritage Suite", price: 7200, amenities: ["Free Wi-Fi", "Free Breakfast"], category: "Luxury" },
  { name: "Ooty Botanical Retreat", city: "Ooty", type: "Double Bed", price: 1950, amenities: ["Free Wi-Fi", "Mountain View"], category: "Budget" },
  { name: "Kodaikanal Pine Lodge", city: "Kodaikanal", type: "Mountain View Cottage", price: 8800, amenities: ["Free Wi-Fi", "Mountain View"], category: "Villa" },
  { name: "Mahabaleshwar Valley Suites", city: "Mahabaleshwar", type: "Family Suite", price: 4100, amenities: ["Free Wi-Fi", "Free Breakfast"], category: "Premium" },
  { name: "Lonavala Khandala Retreat", city: "Lonavala", type: "Luxury Room", price: 5900, amenities: ["Free Wi-Fi", "Pool Access"], category: "Luxury" },
  { name: "Darjeeling Tea Garden Stay", city: "Darjeeling", type: "Luxury Suite", price: 11500, amenities: ["Free Wi-Fi", "Mountain View"], category: "Villa" },
  { name: "Bodh Gaya Lotus Inn", city: "Bodh Gaya", type: "Double Bed", price: 1400, amenities: ["Free Wi-Fi", "Room Service"], category: "Budget" },
  { name: "Khajuraho Temple View", city: "Khajuraho", type: "Family Suite", price: 3200, amenities: ["Free Wi-Fi", "Pool Access"], category: "Premium" },
  { name: "Orchha Fort Residency", city: "Orchha", type: "Luxury Room", price: 5400, amenities: ["Free Wi-Fi", "Free Breakfast"], category: "Luxury" },
  { name: "Pachmarhi Hill Resort", city: "Pachmarhi", type: "Double Bed", price: 1800, amenities: ["Free Wi-Fi", "Mountain View"], category: "Budget" },
  { name: "Dwarka Krishna Stay", city: "Dwarka", type: "Family Suite", price: 2800, amenities: ["Free Wi-Fi", "Room Service"], category: "Premium" },
  { name: "Somnath Sea View", city: "Somnath", type: "Double Bed", price: 1550, amenities: ["Free Wi-Fi", "Balcony"], category: "Budget" },
  { name: "Junagadh Gir Retreat", city: "Junagadh", type: "Mountain View Cottage", price: 9200, amenities: ["Free Wi-Fi", "Mountain View"], category: "Villa" },
  { name: "Bhavnagar Grand", city: "Bhavnagar", type: "Business Suite", price: 4100, amenities: ["Free Wi-Fi", "Gym Access"], category: "Business" },
  { name: "Jamnagar Pearl Hotel", city: "Jamnagar", type: "Luxury Room", price: 6100, amenities: ["Free Wi-Fi", "Pool Access"], category: "Luxury" },
  { name: "Porbandar Heritage", city: "Porbandar", type: "Heritage Suite", price: 5600, amenities: ["Free Wi-Fi", "Free Breakfast"], category: "Luxury" },
  { name: "Cuttack Riverside Resort", city: "Cuttack", type: "Family Suite", price: 3700, amenities: ["Free Wi-Fi", "Pool Access"], category: "Premium" },
  { name: "Rourkela Executive Inn", city: "Rourkela", type: "Business Suite", price: 3100, amenities: ["Free Wi-Fi", "Gym Access"], category: "Business" },
  { name: "Sambalpur Dam View", city: "Sambalpur", type: "Luxury Room", price: 5200, amenities: ["Free Wi-Fi", "Free Breakfast"], category: "Luxury" },
  { name: "Bokaro Steel City Hotel", city: "Bokaro", type: "Double Bed", price: 1650, amenities: ["Free Wi-Fi", "Room Service"], category: "Budget" },
  { name: "Dhanbad Residency", city: "Dhanbad", type: "Single Bed", price: 950, amenities: ["Free Wi-Fi", "Laundry"], category: "Budget" },
  { name: "Jamshedpur Tata Steel Club", city: "Jamshedpur", type: "Business Suite", price: 4800, amenities: ["Free Wi-Fi", "Gym Access"], category: "Business" },
  { name: "Muzaffarpur Grand", city: "Muzaffarpur", type: "Family Suite", price: 2500, amenities: ["Free Wi-Fi", "Room Service"], category: "Premium" },
  { name: "Gaya Heritage Stay", city: "Gaya", type: "Double Bed", price: 1450, amenities: ["Free Wi-Fi", "Room Service"], category: "Budget" },
  { name: "Dibrugarh Brahmaputra Resort", city: "Dibrugarh", type: "Luxury Room", price: 6500, amenities: ["Free Wi-Fi", "Pool Access"], category: "Luxury" },
  { name: "Tezpur Green Valley", city: "Tezpur", type: "Family Suite", price: 3300, amenities: ["Free Wi-Fi", "Free Breakfast"], category: "Premium" }
];

// ─── Main ──────────────────────────────────────────────────────────────────
async function main() {
  const uri = process.env.MONGODB_URL || process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌  MONGODB_URL not found in .env");
    process.exit(1);
  }

  console.log("🔗  Connecting to MongoDB…");
  await mongoose.connect(uri);
  console.log("✅  Connected!\n");

  // Find first owner to associate hotels with (or create without owner)
  const User = mongoose.models.User ||
    mongoose.model("User", new mongoose.Schema({ role: String }));
  const owner = await User.findOne({ role: "hotelOwner" }).lean();
  const ownerId = owner?._id || null;

  let hotelsCreated = 0;
  let roomsCreated  = 0;

  for (let i = 0; i < NEW_HOTELS.length; i++) {
    const h = NEW_HOTELS[i];

    // Skip if hotel with same name+city already exists
    const existing = await Hotel.findOne({ name: h.name, city: h.city });
    if (existing) {
      console.log(`⏭️   Skipping (exists): ${h.name}, ${h.city}`);
      continue;
    }

    const hotel = await Hotel.create({
      name:    h.name,
      address: `Main Road, ${h.city}`,
      contact: "+91 98765 43210",
      city:    h.city,
      ...(ownerId ? { owner: ownerId } : {}),
    });
    hotelsCreated++;

    // Create ONE room per hotel with a SINGLE image
    await Room.create({
      hotel:         hotel._id,
      roomType:      h.type,
      pricePerNight: h.price,
      amenities:     h.amenities,
      images:        [img(i)],  // exactly 1 image
      isAvailable:   true,
      category:      h.category || 'Budget',
    });
    roomsCreated++;

    console.log(`✅  [${i + 1}/${NEW_HOTELS.length}] ${h.name} — ${h.city} (₹${h.price}/night)`);
  }

  console.log(`\n🎉  Done! Created ${hotelsCreated} hotels and ${roomsCreated} rooms.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌  Error:", err.message);
  process.exit(1);
});
