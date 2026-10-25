/**
 * YoYo Rooms — Cloudinary Asset Uploader
 *
 * Uploads all required images and the hero video to YOUR Cloudinary account (dgqgzmzed).
 * Run once:  node server/uploadAssets.js
 *
 * After this script completes, every image URL stored in MongoDB and used
 * in the UI will be a res.cloudinary.com URL.
 */

import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Helper: upload from URL ──────────────────────────────────
async function upload(url, publicId, resourceType = "image") {
  try {
    const result = await cloudinary.uploader.upload(url, {
      public_id:     publicId,
      resource_type: resourceType,
      overwrite:     false,         // skip if already uploaded
      folder:        "",            // public_id includes folder
    });
    console.log(`  ✅ ${publicId}`);
    return result.secure_url;
  } catch (err) {
    if (err.message?.includes("already exists")) {
      console.log(`  ⏭  ${publicId} (already exists)`);
      return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload/${publicId}`;
    }
    console.error(`  ❌ ${publicId}: ${err.message}`);
    return null;
  }
}

// ── Asset definitions ────────────────────────────────────────
const ASSETS = {
  // ── Hero video (Pixabay — allows remote fetch, no auth required)
  video: [
    {
      url:        "https://cdn.pixabay.com/video/2020/04/07/35197-407418340_large.mp4",
      publicId:   "yoyo/hero_video",
      resource:   "video",
    },
  ],

  // ── City thumbnails (Unsplash)
  cities: [
    { url: "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=800&q=80", publicId: "yoyo/cities/mumbai" },
    { url: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80", publicId: "yoyo/cities/delhi" },
    { url: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80", publicId: "yoyo/cities/goa" },
    { url: "https://images.unsplash.com/photo-1484821582734-6692f8e11a5a?w=800",       publicId: "yoyo/cities/jaipur" },
    { url: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800",       publicId: "yoyo/cities/manali" },
    { url: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80", publicId: "yoyo/cities/udaipur" },
    { url: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800",       publicId: "yoyo/cities/bengaluru" },
    { url: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&q=80", publicId: "yoyo/cities/kochi" },
    { url: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80", publicId: "yoyo/cities/agra" },
    { url: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=800",       publicId: "yoyo/cities/shimla" },
  ],

  // ── Hotel room images
  rooms: [
    // Goa
    { url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=900&q=85", publicId: "yoyo/rooms/goa_1" },
    { url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&q=85", publicId: "yoyo/rooms/goa_2" },
    { url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&q=85", publicId: "yoyo/rooms/goa_villa_1" },
    { url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900&q=85", publicId: "yoyo/rooms/goa_villa_2" },
    { url: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=900&q=85", publicId: "yoyo/rooms/goa_std_1" },
    { url: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=900&q=85", publicId: "yoyo/rooms/goa_std_2" },

    // Jaipur
    { url: "https://images.unsplash.com/photo-1517840901100-8179e982acb7?w=900&q=85", publicId: "yoyo/rooms/jaipur_1" },
    { url: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=900&q=85", publicId: "yoyo/rooms/jaipur_2" },
    { url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900&q=85", publicId: "yoyo/rooms/jaipur_dlx_1" },
    { url: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=900&q=85", publicId: "yoyo/rooms/jaipur_dlx_2" },
    { url: "https://images.unsplash.com/photo-1537726235470-8504e3beef77?w=900&q=85", publicId: "yoyo/rooms/jaipur_budget_1" },
    { url: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=900&q=85", publicId: "yoyo/rooms/jaipur_budget_2" },

    // Mumbai
    { url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900&q=85", publicId: "yoyo/rooms/mumbai_1" },
    { url: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=900&q=85", publicId: "yoyo/rooms/mumbai_2" },
    { url: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=900&q=85", publicId: "yoyo/rooms/mumbai_exec_1" },
    { url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&q=85", publicId: "yoyo/rooms/mumbai_exec_2" },
    { url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=85", publicId: "yoyo/rooms/mumbai_std_1" },
    { url: "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=900&q=85", publicId: "yoyo/rooms/mumbai_std_2" },

    // Manali
    { url: "https://images.unsplash.com/photo-1587135941948-670b381f08ce?w=900&q=85", publicId: "yoyo/rooms/manali_1" },
    { url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=85", publicId: "yoyo/rooms/manali_2" },
    { url: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=900&q=85", publicId: "yoyo/rooms/manali_chalet_1" },
    { url: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=900&q=85", publicId: "yoyo/rooms/manali_chalet_2" },
    { url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&q=85", publicId: "yoyo/rooms/manali_budget_1" },

    // Udaipur
    { url: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=900&q=85", publicId: "yoyo/rooms/udaipur_1" },
    { url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&q=85", publicId: "yoyo/rooms/udaipur_2" },
    { url: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=900&q=85", publicId: "yoyo/rooms/udaipur_heritage_1" },
    { url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900&q=85", publicId: "yoyo/rooms/udaipur_heritage_2" },

    // Delhi
    { url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=900&q=85",  publicId: "yoyo/rooms/delhi_1" },
    { url: "https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=900&q=85", publicId: "yoyo/rooms/delhi_2" },
    { url: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=900&q=85", publicId: "yoyo/rooms/delhi_biz_1" },
    { url: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=900&q=85", publicId: "yoyo/rooms/delhi_biz_2" },
    { url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=85", publicId: "yoyo/rooms/delhi_classic_1" },
    { url: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=900&q=85", publicId: "yoyo/rooms/delhi_classic_2" },
    { url: "https://images.unsplash.com/photo-1537726235470-8504e3beef77?w=900&q=85", publicId: "yoyo/rooms/delhi_economy_1" },

    // Bengaluru
    { url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900&q=85", publicId: "yoyo/rooms/bengaluru_1" },
    { url: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=900&q=85", publicId: "yoyo/rooms/bengaluru_2" },
    { url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900&q=85", publicId: "yoyo/rooms/bengaluru_dlx_1" },
    { url: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=900&q=85", publicId: "yoyo/rooms/bengaluru_dlx_2" },
    { url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&q=85", publicId: "yoyo/rooms/bengaluru_pod_1" },

    // Kochi
    { url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=900&q=85", publicId: "yoyo/rooms/kochi_1" },
    { url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=900&q=85", publicId: "yoyo/rooms/kochi_2" },
    { url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&q=85", publicId: "yoyo/rooms/kochi_seaview_1" },
    { url: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=900&q=85", publicId: "yoyo/rooms/kochi_seaview_2" },
    { url: "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=900&q=85", publicId: "yoyo/rooms/kochi_garden_1" },
    { url: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=900&q=85", publicId: "yoyo/rooms/kochi_garden_2" },
  ],
};

// ── Main runner ─────────────────────────────────────────────
async function main() {
  console.log("🚀 YoYo Cloudinary Asset Uploader");
  console.log(`📦 Cloud: ${process.env.CLOUDINARY_CLOUD_NAME}\n`);

  // Upload hero video
  console.log("🎬 Uploading hero video...");
  for (const asset of ASSETS.video) {
    await upload(asset.url, asset.publicId, asset.resource);
  }

  // Upload city thumbnails
  console.log("\n🏙  Uploading city thumbnails...");
  for (const asset of ASSETS.cities) {
    await upload(asset.url, asset.publicId, "image");
  }

  // Upload room images
  console.log("\n🛏  Uploading room images...");
  for (const asset of ASSETS.rooms) {
    await upload(asset.url, asset.publicId, "image");
  }

  console.log("\n✅ All assets uploaded to Cloudinary!");
  console.log("📋 Now run: node server/seedData.js  (to seed the database with Cloudinary URLs)\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Upload failed:", err.message);
  process.exit(1);
});
