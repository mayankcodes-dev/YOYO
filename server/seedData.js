/**
 * YoYo Rooms — Bulk Dummy Data Seeder (Cloudinary Edition)
 * Usage: node server/seedData.js
 *
 * All images use res.cloudinary.com/dgqgzmzed URLs.
 * Run `node server/uploadAssets.js` first to upload the assets.
 */

import "dotenv/config";
import mongoose from "mongoose";
import Hotel from "./models/Hotel.js";
import Room from "./models/Room.js";
import User from "./models/User.js";

const CLOUD = "dgqgzmzed";
const img = (id, w = 900) =>
  `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,w_${w}/${id}`;

const MONGO_URI = process.env.MONGODB_URL || process.env.MONGODB_URI;

const hotelData = [
  // ── GOA ──────────────────────────────────────────────────
  {
    name: "Azure Beach Resort",
    address: "Calangute Beach Road, Calangute, Goa 403516",
    contact: "+91 9800011001",
    city: "Goa",
    rooms: [
      {
        roomType: "Deluxe Sea-View",
        pricePerNight: 3499,
        category: "Premium",
        amenities: ["Free Wi-Fi", "Pool Access", "Free Breakfast", "Room Service"],
        images: [img("yoyo/rooms/goa_1"), img("yoyo/rooms/goa_2")],
      },
      {
        roomType: "Standard Room",
        pricePerNight: 1799,
        category: "Budget",
        amenities: ["Free Wi-Fi", "Room Service"],
        images: [img("yoyo/rooms/goa_std_1"), img("yoyo/rooms/goa_std_2")],
      },
      {
        roomType: "Ocean-View Villa",
        pricePerNight: 8499,
        category: "Villa",
        amenities: ["Free Wi-Fi", "Pool Access", "Free Breakfast", "Room Service", "Mountain View"],
        images: [img("yoyo/rooms/goa_villa_1"), img("yoyo/rooms/goa_villa_2")],
      },
    ],
  },

  // ── JAIPUR ───────────────────────────────────────────────
  {
    name: "Royal Rajputana Heritage",
    address: "Civil Lines, Mirza Ismail Road, Jaipur 302001",
    contact: "+91 9800022002",
    city: "Jaipur",
    rooms: [
      {
        roomType: "Heritage Suite",
        pricePerNight: 5999,
        category: "Luxury",
        amenities: ["Free Wi-Fi", "Free Breakfast", "Room Service", "Pool Access"],
        images: [img("yoyo/rooms/jaipur_1"), img("yoyo/rooms/jaipur_2")],
      },
      {
        roomType: "Deluxe Room",
        pricePerNight: 2799,
        category: "Premium",
        amenities: ["Free Wi-Fi", "Free Breakfast", "Room Service"],
        images: [img("yoyo/rooms/jaipur_dlx_1"), img("yoyo/rooms/jaipur_dlx_2")],
      },
      {
        roomType: "Budget Twin",
        pricePerNight: 999,
        category: "Budget",
        amenities: ["Free Wi-Fi"],
        images: [img("yoyo/rooms/jaipur_budget_1"), img("yoyo/rooms/jaipur_budget_2")],
      },
    ],
  },

  // ── MUMBAI ───────────────────────────────────────────────
  {
    name: "Metro Business Suites",
    address: "Andheri West, MIDC, Mumbai 400053",
    contact: "+91 9800033003",
    city: "Mumbai",
    rooms: [
      {
        roomType: "Business Suite",
        pricePerNight: 4499,
        category: "Business",
        amenities: ["Free Wi-Fi", "Free Breakfast", "Room Service"],
        images: [img("yoyo/rooms/mumbai_1"), img("yoyo/rooms/mumbai_2")],
      },
      {
        roomType: "Executive Studio",
        pricePerNight: 2999,
        category: "Business",
        amenities: ["Free Wi-Fi", "Room Service"],
        images: [img("yoyo/rooms/mumbai_exec_1"), img("yoyo/rooms/mumbai_exec_2")],
      },
      {
        roomType: "Standard Single",
        pricePerNight: 1299,
        category: "Budget",
        amenities: ["Free Wi-Fi"],
        images: [img("yoyo/rooms/mumbai_std_1"), img("yoyo/rooms/mumbai_std_2")],
      },
    ],
  },

  // ── MANALI ───────────────────────────────────────────────
  {
    name: "Himalayan Snow Lodge",
    address: "Old Manali Road, Near Manu Temple, Manali 175131",
    contact: "+91 9800044004",
    city: "Manali",
    rooms: [
      {
        roomType: "Mountain View Cottage",
        pricePerNight: 3299,
        category: "Premium",
        amenities: ["Free Wi-Fi", "Mountain View", "Free Breakfast"],
        images: [img("yoyo/rooms/manali_1"), img("yoyo/rooms/manali_2")],
      },
      {
        roomType: "Luxury Chalet",
        pricePerNight: 6799,
        category: "Luxury",
        amenities: ["Free Wi-Fi", "Mountain View", "Free Breakfast", "Room Service", "Pool Access"],
        images: [img("yoyo/rooms/manali_chalet_1"), img("yoyo/rooms/manali_chalet_2")],
      },
      {
        roomType: "Budget Dorm",
        pricePerNight: 649,
        category: "Budget",
        amenities: ["Free Wi-Fi"],
        images: [img("yoyo/rooms/manali_budget_1"), img("yoyo/rooms/goa_std_1")],
      },
    ],
  },

  // ── UDAIPUR ──────────────────────────────────────────────
  {
    name: "Lake Palace Retreat",
    address: "Lake Pichola, Near City Palace, Udaipur 313001",
    contact: "+91 9800055005",
    city: "Udaipur",
    rooms: [
      {
        roomType: "Lake-View Suite",
        pricePerNight: 8999,
        category: "Luxury",
        amenities: ["Free Wi-Fi", "Pool Access", "Free Breakfast", "Room Service"],
        images: [img("yoyo/rooms/udaipur_1"), img("yoyo/rooms/udaipur_2")],
      },
      {
        roomType: "Royal Heritage Room",
        pricePerNight: 4999,
        category: "Premium",
        amenities: ["Free Wi-Fi", "Free Breakfast", "Room Service"],
        images: [img("yoyo/rooms/udaipur_heritage_1"), img("yoyo/rooms/udaipur_heritage_2")],
      },
    ],
  },

  // ── DELHI ────────────────────────────────────────────────
  {
    name: "Capital Grand Hotel",
    address: "Connaught Place, New Delhi 110001",
    contact: "+91 9800066006",
    city: "Delhi",
    rooms: [
      {
        roomType: "Presidential Suite",
        pricePerNight: 12999,
        category: "Luxury",
        amenities: ["Free Wi-Fi", "Pool Access", "Free Breakfast", "Room Service"],
        images: [img("yoyo/rooms/delhi_1"), img("yoyo/rooms/delhi_2")],
      },
      {
        roomType: "Business Deluxe",
        pricePerNight: 3999,
        category: "Business",
        amenities: ["Free Wi-Fi", "Free Breakfast", "Room Service"],
        images: [img("yoyo/rooms/delhi_biz_2"), img("yoyo/rooms/delhi_biz_2")],
      },
      {
        roomType: "Classic Double",
        pricePerNight: 1899,
        category: "Budget",
        amenities: ["Free Wi-Fi", "Room Service"],
        images: [img("yoyo/rooms/delhi_classic_1"), img("yoyo/rooms/delhi_classic_2")],
      },
      {
        roomType: "Economy Single",
        pricePerNight: 799,
        category: "Budget",
        amenities: ["Free Wi-Fi"],
        images: [img("yoyo/rooms/delhi_economy_1"), img("yoyo/rooms/jaipur_budget_1")],
      },
    ],
  },

  // ── BENGALURU ────────────────────────────────────────────
  {
    name: "Silicon Valley Stays",
    address: "MG Road, Bengaluru 560001",
    contact: "+91 9800077007",
    city: "Bengaluru",
    rooms: [
      {
        roomType: "Tech Executive Suite",
        pricePerNight: 5499,
        category: "Business",
        amenities: ["Free Wi-Fi", "Free Breakfast", "Room Service", "Pool Access"],
        images: [img("yoyo/rooms/bengaluru_1"), img("yoyo/rooms/bengaluru_2")],
      },
      {
        roomType: "Deluxe King",
        pricePerNight: 2499,
        category: "Premium",
        amenities: ["Free Wi-Fi", "Free Breakfast", "Room Service"],
        images: [img("yoyo/rooms/bengaluru_dlx_1"), img("yoyo/rooms/bengaluru_dlx_2")],
      },
      {
        roomType: "Compact Pod",
        pricePerNight: 849,
        category: "Budget",
        amenities: ["Free Wi-Fi"],
        images: [img("yoyo/rooms/bengaluru_pod_1"), img("yoyo/rooms/manali_budget_1")],
      },
    ],
  },

  // ── KOCHI ────────────────────────────────────────────────
  {
    name: "Backwaters Luxury Resort",
    address: "Marine Drive, Ernakulam, Kochi 682016",
    contact: "+91 9800088008",
    city: "Kochi",
    rooms: [
      {
        roomType: "Houseboat Villa",
        pricePerNight: 7499,
        category: "Villa",
        amenities: ["Free Wi-Fi", "Free Breakfast", "Room Service", "Pool Access"],
        images: [img("yoyo/rooms/kochi_1"), img("yoyo/rooms/kochi_2")],
      },
      {
        roomType: "Sea-View Deluxe",
        pricePerNight: 3799,
        category: "Premium",
        amenities: ["Free Wi-Fi", "Free Breakfast", "Room Service"],
        images: [img("yoyo/rooms/kochi_seaview_1"), img("yoyo/rooms/kochi_seaview_2")],
      },
      {
        roomType: "Budget Garden Room",
        pricePerNight: 1199,
        category: "Budget",
        amenities: ["Free Wi-Fi", "Room Service"],
        images: [img("yoyo/rooms/kochi_garden_1"), img("yoyo/rooms/kochi_garden_2")],
      },
    ],
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    let owner = await User.findOne({ role: "hotelOwner" });
    if (!owner) {
      owner = await User.findOne({});
      if (!owner) {
        console.error("❌ No users found. Sign up first, then run the seeder.");
        process.exit(1);
      }
      owner.role = "hotelOwner";
      await owner.save();
      console.log(`👑 Promoted user ${owner._id} to hotelOwner`);
    }

    console.log(`🏨 Seeding with owner: ${owner._id}`);

    await Hotel.deleteMany({});
    await Room.deleteMany({});
    console.log("🧹 Cleared existing hotels & rooms\n");

    let totalRooms = 0;

    for (const hData of hotelData) {
      const hotel = await Hotel.create({
        name: hData.name,
        address: hData.address,
        contact: hData.contact,
        city: hData.city,
        owner: owner._id,
      });

      for (const rData of hData.rooms) {
        await Room.create({
          hotel: hotel._id,
          roomType: rData.roomType,
          pricePerNight: rData.pricePerNight,
          category: rData.category,
          amenities: rData.amenities,
          images: rData.images,
          isAvailable: true,
        });
        totalRooms++;
      }

      console.log(`  ✅ "${hData.name}" (${hData.city}) — ${hData.rooms.length} rooms`);
    }

    console.log(`\n🎉 Done! ${hotelData.length} hotels, ${totalRooms} rooms — all on Cloudinary CDN.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
}

seed();
